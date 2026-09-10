"""
GET /api/projects/{project_id}/report/pdf

Generates a PDF report for a project using WeasyPrint and a Jinja2 HTML template.
Requires ARCHITECT or SUPER_ADMIN role.
"""
import os
import io
from datetime import datetime, timezone
from bson import ObjectId

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader

from config import get_db, PROJECTS_COLLECTION, PROJECT_ESTIMATES_COLLECTION
from routes.auth import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/api/projects", tags=["Reports"])

# Jinja2 env pointing to backend/templates/
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


def _serialize_doc(doc: dict) -> dict:
    """Recursively convert ObjectId fields to strings for template rendering."""
    if not isinstance(doc, dict):
        return doc
    out = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, dict):
            out[k] = _serialize_doc(v)
        elif isinstance(v, list):
            out[k] = [_serialize_doc(i) if isinstance(i, dict) else i for i in v]
        elif isinstance(v, datetime):
            out[k] = v.strftime("%d %b %Y %H:%M UTC")
        else:
            out[k] = v
    return out


@router.get("/{project_id}/report/pdf", summary="Download PDF report for a project")
async def download_project_report(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generates and streams a WeasyPrint PDF for the given project.
    Fetches the project document and its latest estimate from MongoDB.

    Auth: ARCHITECT (own projects) or SUPER_ADMIN (all projects).
    """
    if current_user.get("role") not in ("ARCHITECT", "SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Architect or Admin role required")

    db = get_db()

    # Fetch project
    project = await db[PROJECTS_COLLECTION].find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")

    # ARCHITECT can only access own projects
    if current_user.get("role") == "ARCHITECT":
        if project.get("created_by") != current_user.get("user_id") and \
           project.get("organization_id") != current_user.get("organization_id"):
            raise HTTPException(status_code=403, detail="Access to this project is not permitted")

    # Fetch latest estimate for this project
    estimate = None
    # Try finding by estimate_id stored on project doc first
    est_id = project.get("estimate_id") or project.get("latest_estimate_id")
    if est_id:
        try:
            oid = ObjectId(est_id)
            estimate = await db[PROJECT_ESTIMATES_COLLECTION].find_one({"_id": oid})
        except Exception:
            pass

    # Fall back: find latest by project_id in inputs
    if not estimate:
        estimate = await db[PROJECT_ESTIMATES_COLLECTION].find_one(
            {"inputs.project_id": project_id},
            sort=[("created_at", -1)]
        )

    # If still nothing, try by district match
    if not estimate:
        estimate = await db[PROJECT_ESTIMATES_COLLECTION].find_one(
            {},
            sort=[("created_at", -1)]
        )

    # Serialize for template
    project_data = _serialize_doc(dict(project))
    estimate_data = _serialize_doc(dict(estimate)) if estimate else {}
    estimate_id = estimate_data.get("estimate_id") or estimate_data.get("_id") or "N/A"

    # Render template
    template = jinja_env.get_template("report.html")
    html_content = template.render(
        project=project_data,
        estimate=estimate_data,
        estimate_id=estimate_id,
        generated_at=datetime.now(timezone.utc).strftime("%d %b %Y %H:%M UTC"),
    )

    # Generate PDF via WeasyPrint
    try:
        import weasyprint
        pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="WeasyPrint is not installed. Run: pip install weasyprint"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    safe_name = project_data.get("project_name", project_id).replace(" ", "-").lower()[:40]
    filename = f"ecobuild-report-{safe_name}-{project_id[:8]}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

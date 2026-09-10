"""
POST /api/contact — Public contact form endpoint.
Forwards submission to admin via email_service; always returns a success
response so as not to expose whether SMTP is configured.
"""
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/contact", tags=["Contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    subject: str
    message: str


@router.post("", status_code=200)
async def submit_contact(payload: ContactRequest):
    """
    Accept a contact form submission and forward it to the platform admin.
    Always returns a success message — SMTP errors are swallowed and logged.
    """
    try:
        from services.email_service import send_contact_email
        send_contact_email(
            name=payload.name,
            email=payload.email,
            phone=payload.phone or "",
            subject=payload.subject,
            message=payload.message,
        )
    except Exception:
        pass  # SMTP errors must not expose server state

    return {
        "success": True,
        "message": "Your message has been received. We will get back to you within 24 hours."
    }

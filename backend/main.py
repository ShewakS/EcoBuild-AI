"""
EcoBuild AI — FastAPI Application Entry Point

Mounts all route modules under the main FastAPI app with CORS configured
for the React frontend dev server and serves uploaded site inspection images.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import get_settings
from routes import (
    auth,
    admin,
    customer,
    predict,
    rates,
    estimate,
    carbon,
    sustainability,
    recommendations,
    projects,
    waste,
    reuse,
    progress,
)
from services.recommendation_service import ensure_rules_seeded
from services.waste_service import ensure_waste_thresholds_seeded
from services.reuse_service import ensure_reuse_rules_seeded

settings = get_settings()

app = FastAPI(
    title="EcoBuild AI — Architect Workspace, Cost, Carbon & Sustainability API",
    description=(
        "Construction cost, embodied carbon, sustainability scoring, authentic CPWD/BMTPC waste tracking, "
        "safe material reuse, and 11-stage progress monitoring platform for Architects and Builders."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Ensure upload directory exists and mount static files ─────────────────────
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
async def startup_event():
    try:
        await ensure_rules_seeded()
    except Exception as e:
        print(f"Startup warning: could not seed eco rules: {e}")
        
    try:
        await ensure_waste_thresholds_seeded()
    except Exception as e:
        print(f"Startup warning: could not seed waste thresholds: {e}")
        
    try:
        await ensure_reuse_rules_seeded()
    except Exception as e:
        print(f"Startup warning: could not seed reuse rules: {e}")


# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(customer.router)
app.include_router(projects.router)
app.include_router(progress.router)

app.include_router(waste.router)
app.include_router(reuse.router)
app.include_router(predict.router)
app.include_router(rates.router)
app.include_router(estimate.router)
app.include_router(carbon.router)
app.include_router(sustainability.router)
app.include_router(recommendations.router)


@app.get("/", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "EcoBuild AI Architect Workspace API",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

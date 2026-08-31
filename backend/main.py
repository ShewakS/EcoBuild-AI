"""
EcoBuild AI — FastAPI Application Entry Point

Mounts all route modules under the main FastAPI app with CORS configured
for the Next.js frontend dev server.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routes import predict, rates, estimate

settings = get_settings()

app = FastAPI(
    title="EcoBuild AI — Cost Estimation API",
    description=(
        "Two-stage construction cost estimation platform for Tamil Nadu. "
        "Stage A: ML quantity prediction. Stage B: Rate master CRUD with versioning."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(rates.router)
app.include_router(estimate.router)


@app.get("/", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "EcoBuild AI Cost Estimation API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

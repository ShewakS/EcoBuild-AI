"""
EcoBuild AI — FastAPI Application Entry Point

Mounts all route modules under the main FastAPI app with CORS configured
for the Next.js frontend dev server.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routes import predict, rates, estimate, carbon

settings = get_settings()

app = FastAPI(
    title="EcoBuild AI — Cost & Carbon Estimation API",
    description=(
        "Construction cost and embodied carbon estimation platform for Tamil Nadu. "
        "Phase 1: Explicit calculation-based cost. Phase 2: ML quantity prediction. "
        "Phase 3: IFC Indian carbon emission factors integration."
    ),
    version="1.1.0",
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
app.include_router(carbon.router)


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

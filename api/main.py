from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analyze
from .core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Deepfake Detection using Reality Defender and Local Forensics",
    version="1.0.0",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
)

# CORS Config
# Relaxing for debugging "Spinal Disconnect"
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix=settings.API_PREFIX, tags=["analysis"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Deepfake Detector API", 
        "docs": f"{settings.API_PREFIX}/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

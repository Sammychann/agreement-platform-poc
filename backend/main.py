import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import generation, validation
from config import GENERATED_DIR, TEMPLATES_DIR, DATA_DIR, SIGNATURES_DIR, TEMP_DIR
from create_agreement_templates import generate_all_templates

app = FastAPI(
    title="MSD Agreement Platform",
    description="Backend API for Commercial Agreement Generation & Validation Platform",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(generation.router)
app.include_router(validation.router)

# Mount static directory for generated files
app.mount("/static", StaticFiles(directory=str(GENERATED_DIR)), name="static")

@app.on_event("startup")
async def startup_event():
    # Ensure all directories exist
    for d in [DATA_DIR, TEMPLATES_DIR, GENERATED_DIR, SIGNATURES_DIR, TEMP_DIR]:
        d.mkdir(parents=True, exist_ok=True)
        
    # Generate templates if they don't exist
    generate_all_templates()

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

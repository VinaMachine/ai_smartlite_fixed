from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Import the router from your route module. Adjust the import path if your package layout differs.
from api.version1.speech import router as speech_router

# Optional: preload model on startup (lazy load will still work if load fails)
from services.speech_to_text import load_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Starting speech2text service (lifespan startup)...")
    # Try to preload the model to avoid first-request latency.
    try:
        await load_model()
        logging.info("STT model preloaded successfully.")
    except Exception:
        logging.exception("Failed to preload STT model on startup; will attempt lazy load on first request.")
    # yield control to let FastAPI start serving
    try:
        yield
    finally:
        logging.info("Shutting down speech2text service (lifespan shutdown)...")
        # Add model cleanup here if you implement it (e.g., _model = None, close GPU contexts, etc.)

def create_app() -> FastAPI:
    app = FastAPI(title="speech2text-service", version="0.1.0", lifespan=lifespan)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    # All routes in app/api/version1/speech.py will be available under /v1/speech
    app.include_router(speech_router, prefix="/v1/speech", tags=["speech"])

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok"}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    # If you run this file directly: python app/main.py
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, log_level="info")
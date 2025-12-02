import asyncio
import logging
from typing import Optional

# Whisper (OpenAI) - pip package "whisper" (openai-whisper)
# Requires: torch, ffmpeg installed on the system
try:
    import whisper
except Exception as e:
    whisper = None
    logging.warning("whisper is not available: %s", e)

_model = None
_model_name_default = "small"  # change to "tiny", "base", "small", "medium", "large" as needed

async def load_model(model_name: str = _model_name_default) -> None:
    """
    Load Whisper model in a background thread. Call this at app startup if possible.
    """
    global _model
    if whisper is None:
        raise RuntimeError("whisper package is not installed")
    if _model is not None:
        return
    loop = asyncio.get_running_loop()
    logging.info("Loading Whisper model '%s'...", model_name)
    _model = await loop.run_in_executor(None, whisper.load_model, model_name)
    logging.info("Whisper model loaded.")

async def transcribe_audio(file_path: str, language: Optional[str] = None, task: str = "transcribe") -> Optional[str]:
    """
    Transcribe the given audio file to text using Whisper.
    - file_path: path to preprocessed audio (wav)
    - language: optional ISO language hint (e.g., "vi" for Vietnamese)
    - task: 'transcribe' or 'translate' (translate outputs English)
    Returns transcribed text or None on failure.
    """
    global _model
    if whisper is None:
        logging.error("whisper package is not installed")
        return None

    # lazy load if not loaded yet
    if _model is None:
        await load_model()

    loop = asyncio.get_running_loop()

    def _blocking_transcribe(path: str, lang: Optional[str], task_name: str) -> str:
        opts = {"task": task_name}
        if lang:
            # whisper expects language code like "vi" or "en"
            opts["language"] = lang
            opts["initial_prompt"] = None
        # model.transcribe is blocking and CPU/GPU-bound -> run in executor
        result = _model.transcribe(path, **opts)
        return result.get("text", "")

    try:
        text = await loop.run_in_executor(None, _blocking_transcribe, file_path, language, task)
        return text
    except Exception as e:
        logging.exception("Error during transcription: %s", e)
        return None
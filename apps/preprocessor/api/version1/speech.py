from fastapi import APIRouter, UploadFile, File, HTTPException
from helpers.preprocessing import preprocess_audio
from services.speech_to_text import transcribe_audio
import tempfile
import os

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe speech audio file to text.
    - Accept audio files via multipart/form-data at `file`.
    - Preprocess the audio before running STT model.
    """
    try:
        # Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(await file.read())
            temp_file_path = tmp.name

        # Preprocess the audio (resampling, denoising)
        processed_file_path = await preprocess_audio(temp_file_path)

        # Transcribe the audio -> Text
        transcribed_text = await transcribe_audio(processed_file_path)

        # Cleaning up temp files
        os.remove(temp_file_path)
        os.remove(processed_file_path)

        if not transcribed_text:
            raise HTTPException(status_code=500, detail="Failed to transcribe audio.")

        return {"text": transcribed_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
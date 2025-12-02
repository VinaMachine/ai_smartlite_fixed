import librosa
import soundfile as sf
import tempfile
import os

def preprocess_audio(file_path: str, sample_rate: int = 16000) -> str:
    """
    Preprocess audio file: Resampling and denoising.
    Args:
        file_path: Path to the audio file.
        sample_rate: Targeted sample rate (default 16kHz).
    Returns:
        Path to the processed file.
    """
    # Load the original audio file
    audio, sr = librosa.load(file_path, sr=None)

    # Resample the audio if needed
    if sr != sample_rate:
        audio = librosa.resample(audio, orig_sr=sr, target_sr=sample_rate)

    # Generate temporary file for processed audio
    processed_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    sf.write(processed_file.name, audio, samplerate=sample_rate)

    return processed_file.name
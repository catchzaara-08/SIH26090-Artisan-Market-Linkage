from pathlib import Path

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

from app.services.voice import (
    speech_to_text,
    create_catalogue_from_text,
    text_to_speech,
)

router = APIRouter(prefix="/voice", tags=["AI Voice"])


LANGUAGE_CONFIG = {
    "en-IN": {
        "tts": "en",
        "message": "Your product catalogue has been created successfully.",
    },
    "ta-IN": {
        "tts": "ta",
        "message": "உங்கள் தயாரிப்பு பட்டியல் வெற்றிகரமாக உருவாக்கப்பட்டது.",
    },
    "bn-IN": {
        "tts": "bn",
        "message": "আপনার পণ্যের ক্যাটালগ সফলভাবে তৈরি হয়েছে।",
    },
}


@router.post("/catalogue")
async def create_voice_catalogue(
    file: UploadFile = File(...),
    language: str = "en-IN",
):
    """
    Convert artisan speech into a structured product catalogue.
    Supports WAV and M4A audio.
    """

    allowed_types = {
        "audio/wav",
        "audio/x-wav",
        "audio/wave",
        "audio/mp4",
        "audio/x-m4a",
        "audio/m4a",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Supported audio formats are WAV and M4A.",
        )

    if language not in LANGUAGE_CONFIG:
        raise HTTPException(
            status_code=400,
            detail="Supported languages: en-IN, ta-IN, bn-IN",
        )

    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded audio file is empty.",
        )

    try:
        extension = Path(file.filename or "").suffix.lower()

        if extension not in {".wav", ".m4a"}:
            raise HTTPException(
                status_code=400,
                detail="Please upload a WAV or M4A audio file.",
            )

        transcript = speech_to_text(
            audio_bytes=audio_bytes,
            language=language,
            file_extension=extension,
        )

        catalogue = create_catalogue_from_text(transcript)

        config = LANGUAGE_CONFIG[language]

        audio_path = text_to_speech(
            text=config["message"],
            language=config["tts"],
            output_filename=f"response_{config['tts']}.mp3",
        )

        return {
            "message": "Voice catalogue created successfully",
            "language": language,
            "transcript": transcript,
            "catalogue": catalogue,
            "audio_response": audio_path,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.post("/text-to-speech")
async def generate_speech(
    text: str,
    language: str = "en",
):
    """
    Convert text into speech.
    """

    supported_languages = {
        "en",
        "ta",
        "bn",
    }

    if language not in supported_languages:
        raise HTTPException(
            status_code=400,
            detail="Supported languages: en, ta, bn",
        )

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty.",
        )

    try:
        output_path = text_to_speech(
            text=text,
            language=language,
            output_filename=f"response_{language}.mp3",
        )

        return FileResponse(
            output_path,
            media_type="audio/mpeg",
            filename=f"response_{language}.mp3",
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Text-to-speech failed: {exc}",
        )
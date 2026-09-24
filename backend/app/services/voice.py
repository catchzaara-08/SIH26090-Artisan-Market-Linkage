from io import BytesIO
from pathlib import Path
import subprocess
import tempfile

import imageio_ffmpeg
import speech_recognition as sr
from gtts import gTTS


OUTPUT_DIR = Path("voice_outputs")
OUTPUT_DIR.mkdir(exist_ok=True)


def convert_to_wav(audio_bytes: bytes, input_extension: str = ".m4a") -> bytes:
    """
    Convert uploaded audio to WAV using the FFmpeg binary
    provided by imageio-ffmpeg.
    """

    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()

    with tempfile.NamedTemporaryFile(
        suffix=input_extension,
        delete=False
    ) as input_file:
        input_file.write(audio_bytes)
        input_path = input_file.name

    with tempfile.NamedTemporaryFile(
        suffix=".wav",
        delete=False
    ) as output_file:
        output_path = output_file.name

    try:
        command = [
            ffmpeg_path,
            "-y",
            "-i",
            input_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-f",
            "wav",
            output_path,
        ]

        subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        with open(output_path, "rb") as wav_file:
            return wav_file.read()

    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            f"Audio conversion failed: {exc}"
        )

    finally:
        Path(input_path).unlink(missing_ok=True)
        Path(output_path).unlink(missing_ok=True)


def speech_to_text(
    audio_bytes: bytes,
    language: str = "en-IN",
    file_extension: str = ".wav",
) -> str:
    """
    Convert WAV/M4A audio into text.
    """

    if file_extension.lower() != ".wav":
        audio_bytes = convert_to_wav(
            audio_bytes,
            input_extension=file_extension,
        )

    recognizer = sr.Recognizer()

    try:
        audio_file = BytesIO(audio_bytes)

        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)

        text = recognizer.recognize_google(
            audio,
            language=language,
        )

        return text

    except sr.UnknownValueError:
        raise ValueError(
            "Could not understand the speech."
        )

    except sr.RequestError as exc:
        raise RuntimeError(
            f"Speech recognition service is unavailable: {exc}"
        )

    except Exception as exc:
        raise RuntimeError(
            f"Audio processing failed: {exc}"
        )


def create_catalogue_from_text(text: str) -> dict:
    """
    Create a basic structured catalogue from the artisan's speech.
    Missing information is never invented.
    """

    text_lower = text.lower()

    catalogue = {
        "product_name": "Not provided",
        "material": "Not provided",
        "craft": "Not provided",
        "region": "Not provided",
        "description": text,
        "production_time": "Not provided",
        "use": "Not provided",
    }

    material_keywords = [
        "clay",
        "cotton",
        "silk",
        "wood",
        "bamboo",
        "terracotta",
        "brass",
        "bronze",
        "leather",
        "wool",
    ]

    craft_keywords = [
        "pottery",
        "weaving",
        "wood carving",
        "painting",
        "handloom",
        "terracotta",
        "carpentry",
        "embroidery",
    ]

    region_keywords = [
        "tamil nadu",
        "coimbatore",
        "madurai",
        "chennai",
        "karnataka",
        "kerala",
        "andhra pradesh",
        "telangana",
        "assam",
        "kashmir",
        "west bengal",
        "bengal",
        "india",
    ]

    for keyword in material_keywords:
        if keyword in text_lower:
            catalogue["material"] = keyword.title()
            break

    for keyword in craft_keywords:
        if keyword in text_lower:
            catalogue["craft"] = keyword.title()
            break

    for keyword in region_keywords:
        if keyword in text_lower:
            catalogue["region"] = keyword.title()
            break

    return catalogue


def text_to_speech(
    text: str,
    language: str = "en",
    output_filename: str = "catalogue_response.mp3",
) -> str:
    """
    Convert text into speech using gTTS.
    """

    output_path = OUTPUT_DIR / output_filename

    tts = gTTS(
        text=text,
        lang=language,
        slow=False,
    )

    tts.save(str(output_path))

    return str(output_path)
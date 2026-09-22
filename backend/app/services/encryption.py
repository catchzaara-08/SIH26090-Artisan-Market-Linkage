import os

from cryptography.fernet import Fernet


ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    raise RuntimeError(
        "ENCRYPTION_KEY is not set. "
        "Set it as an environment variable before starting the server."
    )


cipher = Fernet(
    ENCRYPTION_KEY.encode()
)


def encrypt_data(data: str) -> str:
    return cipher.encrypt(
        data.encode()
    ).decode()


def decrypt_data(encrypted_data: str) -> str:
    return cipher.decrypt(
        encrypted_data.encode()
    ).decode()
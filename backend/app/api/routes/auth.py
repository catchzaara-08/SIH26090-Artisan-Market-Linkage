import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from pwdlib import PasswordHash


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "dev-secret-change-this"
)

ALGORITHM = "HS256"

security = HTTPBearer()

users = {}


class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


def create_access_token(username: str):
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    payload = {
        "sub": username,
        "exp": expires_at
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return username

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


@router.post("/register")
def register(user: RegisterRequest):

    if user.username in users:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = password_hash.hash(
        user.password
    )

    users[user.username] = hashed_password

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
def login(user: LoginRequest):

    stored_password = users.get(
        user.username
    )

    if not stored_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not password_hash.verify(
        user.password,
        stored_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        user.username
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(
    current_user: str = Depends(get_current_user)
):
    return {
        "authenticated": True,
        "username": current_user
    }
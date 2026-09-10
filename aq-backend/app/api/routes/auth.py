"""
Lightweight JSON-file-backed authentication routes.
Endpoints:
  POST /auth/register  – create a new user
  POST /auth/login     – get a JWT
  GET  /auth/me        – return the current user (requires Bearer token)
"""

import json
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr

from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# ── settings ────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "aerovir-dev-secret-change-in-prod")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "72"))

# Users are persisted to a simple JSON file next to the running process.
USERS_FILE = Path(os.getenv("USERS_FILE", "users.json"))


# ── helpers ─────────────────────────────────────────────────────────
def _load_users() -> list[dict]:
    if not USERS_FILE.exists():
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_users(users: list[dict]):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _user_public(user: dict) -> dict:
    """Strip sensitive fields before returning to the client."""
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


# ── dependency: extract current user from Bearer token ──────────────
async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    users = _load_users()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── schemas ─────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


# ── routes ──────────────────────────────────────────────────────────
@router.post("/register")
async def register(body: RegisterBody):
    users = _load_users()
    if any(u["email"] == body.email for u in users):
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = {
        "id": uuid.uuid4().hex,
        "name": body.name,
        "email": body.email,
        "password": _hash_password(body.password),
    }
    users.append(new_user)
    _save_users(users)
    logger.info(f"New user registered: {body.email}")

    token = _create_token(new_user["id"])
    return {"token": token, "user": _user_public(new_user)}


@router.post("/login")
async def login(body: LoginBody):
    users = _load_users()
    user = next((u for u in users if u["email"] == body.email), None)
    if not user or not _check_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_token(user["id"])
    logger.info(f"User logged in: {body.email}")
    return {"token": token, "user": _user_public(user)}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": _user_public(user)}

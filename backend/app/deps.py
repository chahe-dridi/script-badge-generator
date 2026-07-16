"""Shared FastAPI dependencies (current-user resolution)."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from .db import get_session
from .models import User
from .security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token, expected_type="access")
        subject = payload.get("sub")
        if subject is None:
            raise cred_exc
    except ValueError:
        raise cred_exc

    user = session.get(User, int(subject))
    if user is None or not user.is_active:
        raise cred_exc
    return user


def get_current_admin(current: User = Depends(get_current_user)) -> User:
    """Require the caller to be an active admin (403 if not)."""
    if not current.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current

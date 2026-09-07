from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any
from config import get_db, USERS_COLLECTION
from models.auth import LoginRequest, TokenResponse
from services.auth_service import verify_password, hash_password, create_access_token
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """
    Authenticate user via email and password, returning a JWT token with minimal payload.
    """
    db = get_db()
    email_clean = payload.email.strip().lower()
    user = await db[USERS_COLLECTION].find_one({"email": email_clean})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password hash
    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check account status
    user_status = user.get("status", "active")
    if user_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact platform support.",
        )
    if user_status == "inactive":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently inactive.",
        )

    # Generate token payload
    token_payload = {
        "user_id": user["user_id"],
        "role": user["role"],
        "organization_id": user.get("organization_id"),
        "email": user["email"]
    }
    token = create_access_token(token_payload)

    # Clean user dict for client
    user_data = {
        "user_id": user["user_id"],
        "name": user.get("name", "User"),
        "email": user["email"],
        "role": user["role"],
        "organization_id": user.get("organization_id"),
        "company_name": user.get("company_name"),
        "plan": user.get("plan"),
        "status": user.get("status", "active"),
        "phone": user.get("phone"),
        "assigned_project_ids": user.get("assigned_project_ids", [])
    }

    return TokenResponse(access_token=token, token_type="Bearer", user=user_data)


@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Return currently authenticated user identity and role.
    """
    # Exclude password_hash
    safe_user = {k: v for k, v in current_user.items() if k not in ["password_hash", "_id"]}
    return {"user": safe_user}


@router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Log out currently authenticated user.
    """
    return {"message": "Successfully logged out"}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Allow authenticated user to change their own password.
    """
    db = get_db()
    user = await db[USERS_COLLECTION].find_one({"user_id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.old_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password does not match")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    new_hash = hash_password(payload.new_password)
    await db[USERS_COLLECTION].update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password changed successfully"}

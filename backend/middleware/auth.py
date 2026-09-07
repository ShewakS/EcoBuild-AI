from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from config import get_db, USERS_COLLECTION, PROJECTS_COLLECTION
from services.auth_service import decode_access_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    Validate the Bearer token, look up the user in MongoDB, and verify active status.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user identity",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db = get_db()
    user = await db[USERS_COLLECTION].find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or has been removed",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check status: must be active
    user_status = user.get("status", "active")
    if user_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact platform administrator.",
        )
    if user_status == "inactive":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Access denied.",
        )

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """Return current user if token present and valid; otherwise None."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials)
    except Exception:
        return None



def require_role(allowed_roles: List[str]):
    """
    Dependency factory to restrict endpoint access to specific roles.
    Allowed roles can include: 'SUPER_ADMIN', 'ARCHITECT', 'CUSTOMER'.
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Insufficient permissions for role '{user_role}'. Required: {allowed_roles}",
            )
        return current_user

    return role_checker


async def check_project_access(user: Dict[str, Any], project_id: str) -> Dict[str, Any]:
    """
    Verify if the given user is authorized to access the specific project.
    - SUPER_ADMIN: Can access any project in read-only / administration mode.
    - ARCHITECT: Must belong to the same organization_id or be the creator.
    - CUSTOMER: Must be the assigned customer_id, customer_email, or have project_id in assigned_project_ids.
    Returns the project document if authorized, raises 403 or 404 otherwise.
    """
    db = get_db()
    project = await db[PROJECTS_COLLECTION].find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found",
        )

    role = user.get("role")
    if role == "SUPER_ADMIN":
        return project

    if role == "ARCHITECT":
        user_org = user.get("organization_id")
        project_org = project.get("organization_id")
        created_by = project.get("created_by")
        
        # If project has an org, it must match user's org
        if project_org and user_org and project_org != user_org:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You cannot access projects belonging to another organization",
            )
        # If project has created_by and no org match
        if created_by and created_by != user.get("user_id") and project_org != user_org:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this project",
            )
        return project

    if role == "CUSTOMER":
        user_id = user.get("user_id")
        user_email = user.get("email")
        assigned_ids = user.get("assigned_project_ids", [])
        
        is_owner = (
            project.get("customer_id") == user_id
            or project.get("customer_email") == user_email
            or project_id in assigned_ids
        )
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You are not authorized to view this customer project",
            )
        return project

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Unknown role or access denied",
    )

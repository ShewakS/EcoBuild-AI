from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ARCHITECT = "ARCHITECT"
    CUSTOMER = "CUSTOMER"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class SubscriptionPlan(str, Enum):
    BASIC = "Basic"
    PROFESSIONAL = "Professional"
    ENTERPRISE = "Enterprise"


# Plan default limits
PLAN_LIMITS = {
    SubscriptionPlan.BASIC: {
        "max_projects": 3,
        "max_predictions": 20,
        "features": ["quantities", "cost", "carbon", "waste"]
    },
    SubscriptionPlan.PROFESSIONAL: {
        "max_projects": 15,
        "max_predictions": 100,
        "features": ["quantities", "cost", "carbon", "waste", "sustainability", "reuse", "gallery"]
    },
    SubscriptionPlan.ENTERPRISE: {
        "max_projects": 9999,
        "max_predictions": 9999,
        "features": ["quantities", "cost", "carbon", "waste", "sustainability", "reuse", "gallery", "analytics", "priority_support"]
    }
}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: Dict[str, Any]


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    phone: Optional[str] = None
    organization_id: Optional[str] = None
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    password: str
    company_name: Optional[str] = None
    plan: Optional[SubscriptionPlan] = SubscriptionPlan.PROFESSIONAL


class UserResponse(UserBase):
    user_id: str
    company_name: Optional[str] = None
    plan: Optional[str] = None
    assigned_project_ids: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserInDB(UserBase):
    user_id: str
    password_hash: str
    company_name: Optional[str] = None
    assigned_project_ids: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class Organization(BaseModel):
    organization_id: str
    name: str
    owner_id: str
    email: str
    plan: SubscriptionPlan = SubscriptionPlan.PROFESSIONAL
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Subscription(BaseModel):
    subscription_id: str
    organization_id: str
    plan: SubscriptionPlan
    status: str = "active"
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    usage_limits: Dict[str, Any]
    current_usage: Dict[str, int] = {
        "projects_count": 0,
        "predictions_count": 0,
        "cost_analyses": 0,
        "carbon_analyses": 0
    }


class AssignCustomerRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = "Customer@12345"  # default initial password if not specified


class StatusUpdateRequest(BaseModel):
    status: UserStatus


class PlanUpdateRequest(BaseModel):
    plan: SubscriptionPlan

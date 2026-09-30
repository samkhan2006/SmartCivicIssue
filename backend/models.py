from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ComplaintBase(BaseModel):
    issue_type: str
    description: str
    latitude: float
    longitude: float
    address: str
    priority: Optional[str] = "Medium"

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdateStatus(BaseModel):
    status: str

class ComplaintResponse(BaseModel):
    id: int
    complaint_number: str
    issue_type: str
    description: str
    photo: Optional[str] = None
    latitude: float
    longitude: float
    address: str
    status: str
    priority: str
    created_at: str
    updated_at: str
    resolved_at: Optional[str] = None

class AnalyticsSummary(BaseModel):
    total_complaints: int
    pending: int
    under_review: int
    in_progress: int
    resolved: int
    rejected: int
    high_priority: int
    resolution_rate: float
    issue_distribution: dict
    status_distribution: dict

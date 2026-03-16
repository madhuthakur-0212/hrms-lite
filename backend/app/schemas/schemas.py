from pydantic import BaseModel, EmailStr, validator
from datetime import date, datetime
from typing import Optional, List

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @validator("employee_id", "full_name", "department")
    def must_not_be_blank(cls, v):
        if not v.strip():
            raise ValueError("This field cannot be blank.")
        return v.strip()

class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    class Config:
        orm_mode = True

class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: str

    @validator("status")
    def status_valid(cls, v):
        if v not in ("Present", "Absent"):
            raise ValueError("Status must be Present or Absent.")
        return v

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str
    full_name: Optional[str]
    emp_code: Optional[str]
    department: Optional[str]

    class Config:
        orm_mode = True

class AttendanceSummary(BaseModel):
    id: int
    emp_code: str
    full_name: str
    department: str
    total_days: int
    present_days: int
    absent_days: int

class DashboardStats(BaseModel):
    total_employees: int
    total_attendance_records: int
    present_today: int
    departments: List[dict]

class MessageResponse(BaseModel):
    message: str

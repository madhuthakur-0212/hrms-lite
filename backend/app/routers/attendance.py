from fastapi import APIRouter, Query
from typing import Optional, List
from datetime import date
from app.schemas.schemas import AttendanceCreate, AttendanceOut, AttendanceSummary
from app.controllers import attendance_controller

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("/summary", response_model=List[AttendanceSummary])
def attendance_summary():
    return attendance_controller.get_attendance_summary()

@router.get("/", response_model=List[AttendanceOut])
def list_attendance(date: Optional[date] = Query(default=None)):
    return attendance_controller.get_all_attendance(date)

@router.get("/employee/{emp_id}", response_model=List[AttendanceOut])
def employee_attendance(emp_id: int, date: Optional[date] = Query(default=None)):
    return attendance_controller.get_attendance_by_employee(emp_id, date)

@router.post("/", response_model=AttendanceOut, status_code=201)
def mark_attendance(data: AttendanceCreate):
    return attendance_controller.mark_attendance(data)

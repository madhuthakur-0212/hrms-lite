from fastapi import APIRouter
from typing import List
from app.schemas.schemas import EmployeeCreate, EmployeeOut, DashboardStats, MessageResponse
from app.controllers import employee_controller

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("/stats", response_model=DashboardStats)
def dashboard_stats():
    return employee_controller.get_dashboard_stats()

@router.get("/", response_model=List[EmployeeOut])
def list_employees():
    return employee_controller.get_all_employees()

@router.post("/", response_model=EmployeeOut, status_code=201)
def add_employee(data: EmployeeCreate):
    return employee_controller.create_employee(data)

@router.delete("/{emp_id}", response_model=MessageResponse)
def remove_employee(emp_id: int):
    return employee_controller.delete_employee(emp_id)

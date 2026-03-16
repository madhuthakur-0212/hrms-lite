from psycopg2 import errors
from fastapi import HTTPException
from app.schemas.schemas import EmployeeCreate
from app.config.database import get_conn, put_conn

def get_all_employees():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM employees ORDER BY created_at DESC")
            return cur.fetchall()
    finally:
        put_conn(conn)

def create_employee(data: EmployeeCreate):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO employees (employee_id, full_name, email, department) VALUES (%s, %s, %s, %s) RETURNING *",
                (data.employee_id.strip(), data.full_name.strip(), data.email.lower().strip(), data.department.strip()),
            )
            row = cur.fetchone()
        conn.commit()
        return row
    except errors.UniqueViolation as e:
        conn.rollback()
        msg = str(e)
        if "email" in msg:
            raise HTTPException(status_code=409, detail="An employee with this email already exists.")
        raise HTTPException(status_code=409, detail="An employee with this Employee ID already exists.")
    finally:
        put_conn(conn)

def delete_employee(emp_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM employees WHERE id = %s RETURNING id", (emp_id,))
            row = cur.fetchone()
        conn.commit()
        if not row:
            raise HTTPException(status_code=404, detail="Employee not found.")
        return {"message": "Employee deleted successfully."}
    finally:
        put_conn(conn)

def get_dashboard_stats():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as count FROM employees")
            total_employees = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) as count FROM attendance")
            total_records = cur.fetchone()["count"]
            cur.execute("SELECT COUNT(*) as count FROM attendance WHERE date = CURRENT_DATE AND status = 'Present'")
            present_today = cur.fetchone()["count"]
            cur.execute("SELECT department, COUNT(*) as count FROM employees GROUP BY department ORDER BY count DESC")
            departments = cur.fetchall()
        return {
            "total_employees": total_employees,
            "total_attendance_records": total_records,
            "present_today": present_today,
            "departments": [dict(d) for d in departments],
        }
    finally:
        put_conn(conn)

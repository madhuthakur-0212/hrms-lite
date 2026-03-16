from fastapi import HTTPException
from app.schemas.schemas import AttendanceCreate
from app.config.database import get_conn, put_conn
from datetime import date as date_type
from typing import Optional

def mark_attendance(data: AttendanceCreate):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM employees WHERE id = %s", (data.employee_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Employee not found.")
            cur.execute(
                """
                INSERT INTO attendance (employee_id, date, status)
                VALUES (%s, %s, %s)
                ON CONFLICT (employee_id, date) DO UPDATE SET status = EXCLUDED.status
                RETURNING *
                """,
                (data.employee_id, data.date, data.status),
            )
            row = cur.fetchone()
        conn.commit()
        return row
    finally:
        put_conn(conn)

def get_all_attendance(date: Optional[date_type] = None):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            if date:
                cur.execute(
                    "SELECT a.*, e.full_name, e.employee_id as emp_code, e.department FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.date = %s ORDER BY e.full_name ASC",
                    (date,),
                )
            else:
                cur.execute(
                    "SELECT a.*, e.full_name, e.employee_id as emp_code, e.department FROM attendance a JOIN employees e ON a.employee_id = e.id ORDER BY a.date DESC, e.full_name ASC"
                )
            return cur.fetchall()
    finally:
        put_conn(conn)

def get_attendance_by_employee(emp_id: int, date: Optional[date_type] = None):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            if date:
                cur.execute(
                    "SELECT a.*, e.full_name, e.employee_id as emp_code FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.employee_id = %s AND a.date = %s ORDER BY a.date DESC",
                    (emp_id, date),
                )
            else:
                cur.execute(
                    "SELECT a.*, e.full_name, e.employee_id as emp_code FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.employee_id = %s ORDER BY a.date DESC",
                    (emp_id,),
                )
            return cur.fetchall()
    finally:
        put_conn(conn)

def get_attendance_summary():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT e.id, e.employee_id AS emp_code, e.full_name, e.department,
                    COUNT(a.id) AS total_days,
                    COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present_days,
                    COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS absent_days
                FROM employees e
                LEFT JOIN attendance a ON e.id = a.employee_id
                GROUP BY e.id, e.employee_id, e.full_name, e.department
                ORDER BY e.full_name ASC
            """)
            return cur.fetchall()
    finally:
        put_conn(conn)

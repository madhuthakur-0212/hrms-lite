# HRMS Lite

A lightweight Human Resource Management System for tracking employees and daily attendance.

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS             |
| Backend    | Python 3.11, FastAPI, Uvicorn            |
| Validation | Pydantic v2                              |
| Database   | PostgreSQL (via asyncpg connection pool) |
| Deployment | Vercel (Frontend), Render (Backend)      |

## Features

- Add, view, and delete employees with Pydantic validation
- Duplicate detection on Employee ID and Email with clear error messages
- Mark daily attendance (Present / Absent) with upsert on conflict
- Filter attendance records by date
- Dashboard: total employees, present today, department breakdown
- Reports: per-employee attendance rate bars + full log on click
- Auto-generated API docs at /docs (FastAPI Swagger UI)
- Loading, empty, and error states throughout the UI

## Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── config/database.py
│   │   ├── controllers/
│   │   │   ├── employee_controller.py
│   │   │   └── attendance_controller.py
│   │   ├── routers/
│   │   │   ├── employees.py
│   │   │   └── attendance.py
│   │   └── schemas/schemas.py
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml
└── frontend/
    ├── src/
    │   ├── api/index.js
    │   ├── components/ui/index.jsx
    │   ├── components/Sidebar.jsx
    │   ├── components/PageHeader.jsx
    │   ├── hooks/useToast.js
    │   ├── pages/Dashboard.jsx
    │   ├── pages/Employees.jsx
    │   ├── pages/Attendance.jsx
    │   ├── pages/Reports.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── vercel.json
    └── package.json
```

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/hrms-lite.git
cd hrms-lite
```

### 2. Set up the database

```bash
createdb hrms_lite
```

Tables are created automatically on server startup.

### 3. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/hrms_lite
FRONTEND_URL=http://localhost:5173
```

```bash
uvicorn main:app --reload --port 5000
```

Backend: http://localhost:5000
Swagger docs: http://localhost:5000/docs

### 4. Start the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

## Deployment

### Backend on Render

1. Push to GitHub
2. New Web Service → Python environment
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add PostgreSQL database → link as `DATABASE_URL`
6. Add `FRONTEND_URL=https://your-app.vercel.app`

### Frontend on Vercel

1. Import frontend folder on Vercel
2. Set `VITE_API_URL=https://your-render-app.onrender.com/api`
3. Deploy

## API Reference

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | /api/employees/stats          | Dashboard stats                |
| GET    | /api/employees                | List all employees             |
| POST   | /api/employees                | Create employee                |
| DELETE | /api/employees/{id}           | Delete employee                |
| POST   | /api/attendance               | Mark attendance (upsert)       |
| GET    | /api/attendance               | All records (?date= optional)  |
| GET    | /api/attendance/employee/{id} | Records for one employee       |
| GET    | /api/attendance/summary       | Aggregated summary             |
| GET    | /docs                         | Swagger UI                     |

## Assumptions

- Single admin, no authentication
- Employee IDs are unique strings assigned by the admin
- Re-marking attendance for same employee + date updates the existing record
- Leave, payroll, and multi-role access are out of scope

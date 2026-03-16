import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import pool
import os
from dotenv import load_dotenv

load_dotenv()

connection_pool = None

def connect():
    global connection_pool
    connection_pool = pool.SimpleConnectionPool(
        1, 10,
        dsn=os.getenv("DATABASE_URL"),
        cursor_factory=RealDictCursor,
    )
    initialize_tables()

def disconnect():
    global connection_pool
    if connection_pool:
        connection_pool.closeall()

def get_conn():
    return connection_pool.getconn()

def put_conn(conn):
    connection_pool.putconn(conn)

def initialize_tables():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS employees (
                    id SERIAL PRIMARY KEY,
                    employee_id VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    department VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS attendance (
                    id SERIAL PRIMARY KEY,
                    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                    date DATE NOT NULL,
                    status VARCHAR(10) CHECK (status IN ('Present', 'Absent')) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(employee_id, date)
                );
            """)
        conn.commit()
    finally:
        put_conn(conn)

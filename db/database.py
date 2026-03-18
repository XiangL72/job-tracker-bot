import sqlite3
from typing import List
from scraper.models import JobPosting

DB_NAME = "job_tracker.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    create_table_query = """
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        url TEXT UNIQUE NOT NULL,
        raw_description TEXT,       
        experience_level TEXT,      
        tech_stack TEXT,            
        salary TEXT,                
        date_found TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    cursor.execute(create_table_query)
    conn.commit()
    conn.close()

    print("[*] Database initialized successfully with advanced schema.")


def save_jobs(jobs: List[JobPosting]):
    """Saves a list of JobPostings to the database, ignoring duplicates."""
    if not jobs:
        return

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    insert_query = """
    INSERT OR IGNORE INTO jobs (title, company, location, url, raw_description)
    VALUES (?, ?, ?, ?, ?)
    """

    new_jobs_count = 0

    for job in jobs:
        cursor.execute(insert_query, (job.title, job.company, job.location, job.url, job.description))
        if cursor.rowcount == 1:
            new_jobs_count += 1

    conn.commit()
    conn.close()

    print(f"[*] Saved {new_jobs_count} NEW jobs to the database. ({len(jobs) - new_jobs_count} were duplicates/already existed).")


def get_unprocessed_jobs(limit=5):
    """Fetches a batch of jobs that haven't been analyzed by the AI yet."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # FIX: Process the newest jobs first!
    cursor.execute("SELECT id, raw_description FROM jobs WHERE tech_stack IS NULL ORDER BY id DESC LIMIT ?", (limit,))

    jobs = cursor.fetchall()
    conn.close()
    return jobs


def update_job_ai_data(job_id: int, ai_data: dict):
    """Updates the database with the AI's extracted JSON data."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    tech_stack_val = ai_data.get("tech_stack", "Unknown")
    if isinstance(tech_stack_val, list):
        tech_stack_val = ", ".join(tech_stack_val)

    update_query = """
    UPDATE jobs 
    SET experience_level = ?, tech_stack = ?, salary = ?
    WHERE id = ?
    """
    cursor.execute(update_query, (
        str(ai_data.get("experience_level", "Unknown")),
        str(tech_stack_val),
        str(ai_data.get("salary", "Unknown")),
        job_id
    ))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
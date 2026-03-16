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
        raw_description TEXT,       -- NEW: The full text for the AI to read
        experience_level TEXT,      -- NEW: e.g., 'Entry Level' (Filled later)
        tech_stack TEXT,            -- NEW: e.g., 'Python, SQL' (Filled later)
        salary TEXT,                -- NEW: (Filled later)
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

    # We use INSERT OR IGNORE so the UNIQUE url constraint doesn't crash our program
    # if it sees a job it already saved yesterday.
    insert_query = """
    INSERT OR IGNORE INTO jobs (title, company, location, url, raw_description)
    VALUES (?, ?, ?, ?, ?)
    """

    new_jobs_count = 0

    for job in jobs:
        cursor.execute(insert_query, (job.title, job.company, job.location, job.url, job.description))
        # cursor.rowcount tells us if a new row was added (1) or ignored (0)
        if cursor.rowcount == 1:
            new_jobs_count += 1

    conn.commit()
    conn.close()

    print(
        f"[*] Saved {new_jobs_count} NEW jobs to the database. ({len(jobs) - new_jobs_count} were duplicates/already existed).")


if __name__ == "__main__":
    init_db()
import sqlite3
from collections import Counter

# Make sure this matches where your database actually is!
DB_NAME = "job_tracker.db"


def run_summary(scope="all"):
    """Generates the statistical summary for either 'today' or 'all' time."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if scope == "today":
        title_text = "TODAY'S NEW JOBS"
    else:
        title_text = "ALL-TIME JOB MARKET"

    print(f"\n=======================================")
    print(f"   {title_text} SUMMARY   ")
    print(f"=======================================")

    # 1. Setup the SQL Filter
    condition = "tech_stack IS NOT NULL"
    if scope == "today":
        condition += " AND date(date_found) = date('now', 'localtime')"

    # 2. Count total jobs
    cursor.execute(f"SELECT COUNT(*) FROM jobs WHERE {condition}")
    count = cursor.fetchone()[0]
    print(f"[*] Total Jobs Analyzed: {count}\n")

    if count == 0:
        print("[!] No jobs found for this timeframe. Run 'python main.py' to fetch more!")
        conn.close()
        return

    # 3. Experience Levels
    print("--- ROLES BY EXPERIENCE ---")
    cursor.execute(
        f"SELECT experience_level, COUNT(*) FROM jobs WHERE {condition} AND experience_level != 'Unknown' GROUP BY experience_level")
    for level, c in cursor.fetchall():
        print(f" - {level}: {c} jobs")

    # 4. Top Tech Stacks
    print("\n--- TOP 5 TECH STACKS ---")
    cursor.execute(
        f"SELECT tech_stack FROM jobs WHERE {condition} AND tech_stack != 'Unknown' AND tech_stack != 'Not specified'")

    tech_counter = Counter()
    for row in cursor.fetchall():
        # Split the AI's comma-separated string into individual tech skills
        technologies = [tech.strip() for tech in row[0].split(',') if tech.strip()]
        tech_counter.update(technologies)

    for tech, c in tech_counter.most_common(5):
        print(f" - {tech}: mentioned in {c} jobs")

    conn.close()


def search_jobs(column, keyword):
    """Searches the database for specific tech stacks or experience levels."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    query = f"SELECT title, company, url FROM jobs WHERE {column} LIKE ?"
    cursor.execute(query, (f'%{keyword}%',))
    results = cursor.fetchall()

    print(f"\n--- FOUND {len(results)} JOBS MATCHING '{keyword.upper()}' ---")
    if len(results) == 0:
        print(" -> No jobs found with that criteria.")
    else:
        for title, company, url in results[:10]:
            print(f" -> {title} @ {company} | {url}")

        if len(results) > 10:
            print(f"    ... and {len(results) - 10} more.")

    conn.close()


def main_menu():
    """The interactive steering wheel for the user."""
    while True:
        print("\n" + "=" * 40)
        print("         JOB TRACKER DASHBOARD          ")
        print("=" * 40)
        print("1. View Today's Summary (New Jobs)")
        print("2. View All-Time Summary (Monthly)")
        print("3. Search by Tech Stack (e.g., Python)")
        print("4. Search by Experience Level (e.g., Internship)")
        print("5. Exit Dashboard")

        choice = input("\nSelect an option (1-5): ").strip()

        if choice == '1':
            run_summary(scope="today")
        elif choice == '2':
            run_summary(scope="all")
        elif choice == '3':
            tech = input("Enter a tech stack to search for (e.g., React, SQL): ").strip()
            search_jobs("tech_stack", tech)
        elif choice == '4':
            exp = input("Enter an experience level (e.g., Entry, Intern, Senior): ").strip()
            search_jobs("experience_level", exp)
        elif choice == '5':
            print("Closing dashboard. Goodbye!")
            break
        else:
            print("[!] Invalid choice. Please type a number from 1 to 5.")


# This is the "Start Button" that makes the whole file run!
if __name__ == "__main__":
    main_menu()
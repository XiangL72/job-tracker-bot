import time
from config import COMPANY_TARGETS, INTERESTING_ROLES
from scraper.greenhouse import fetch_jobs
from scraper.models import JobPosting  # FIX: Imported our data model!
from db.database import init_db, save_jobs, get_unprocessed_jobs, update_job_ai_data
from llm.extractor import analyze_job_description


def main():
    print("=======================================")
    print("   CANADA TECH MONITOR - BATCH MODE    ")
    print("=======================================")

    # 1. Ensure database exists
    init_db()

    # --- PHASE 1: BATCH SCRAPING ---
    for company in COMPANY_TARGETS:
        print(f"\n[*] Checking {company.upper()}...")

        # Fetch the raw JSON jobs for Canada
        raw_jobs = fetch_jobs(company)

        if not raw_jobs:
            continue

        valid_job_objects = []
        for job_dict in raw_jobs:
            title = job_dict.get('title', "").lower()

            # SUB-FILTER: Check if it's a tech role (Software, Data, Intern, etc.)
            if any(role in title for role in INTERESTING_ROLES):
                # FIX: Convert the raw JSON dictionary into our strict JobPosting format
                # We use .get() so the script doesn't crash if a field is missing
                job_obj = JobPosting(
                    title=job_dict.get('title', 'Unknown Title'),
                    company=company.upper(),
                    location=job_dict.get('location', {}).get('name', 'Canada'),
                    url=job_dict.get('absolute_url', ''),
                    description=job_dict.get('content', '')  # Greenhouse stores the description in 'content'
                )
                valid_job_objects.append(job_obj)

        # Save to database
        if valid_job_objects:
            save_jobs(valid_job_objects)
        else:
            print(f"[-] No new relevant tech roles found for {company}.")

        time.sleep(1)  # Be polite to Greenhouse APIs

    # --- PHASE 2: AI BATCH PROCESSING ---
    print("\n" + "=" * 40)
    print("    STARTING AI ANALYSIS (OBJECTIVE)    ")
    print("=" * 40)

    # Process 10 jobs at a time
    unprocessed = get_unprocessed_jobs(limit=3)

    if not unprocessed:
        print("[+] All jobs in the database have already been analyzed. You're up to date!")
        return

    for job_id, raw_desc in unprocessed:
        print(f"[*] Waking up Gemini AI for Job ID {job_id}...")

        # Safety Check: If a job has no description, skip the AI to save API calls
        if not raw_desc or len(raw_desc) < 50:
            print("    -> Description missing or too short. Skipping AI.")
            update_job_ai_data(job_id, {"experience_level": "Unknown", "tech_stack": "None", "salary": "Unknown"})
            continue

        # Send to Gemini
        ai_result = analyze_job_description(raw_desc)

        if ai_result:
            update_job_ai_data(job_id, ai_result)
            # Print a quick preview of what the AI found
            print(f"    -> Success: {ai_result.get('experience_level')} | {str(ai_result.get('tech_stack'))[:40]}...")

        # CRITICAL: Pause for 4 seconds to respect Google Gemini's free tier rate limits
        time.sleep(4)

    print("\n[OK] Daily update complete. Run 'python report.py' to see your new dashboard!")


if __name__ == "__main__":
    main()
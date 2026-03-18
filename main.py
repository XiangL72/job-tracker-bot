import time
from scraper.greenhouse import fetch_jobs
# FIX: We imported init_db here!
from db.database import init_db, save_jobs, get_unprocessed_jobs, update_job_ai_data
from llm.extractor import analyze_job_description


def main():
    print("=======================================")
    print("   TERMINAL JOB SCRAPER - V3 (AI BRAIN)  ")
    print("=======================================")

    # FIX: Run the setup check every time the app starts.
    # If the table exists, it does nothing. If it's missing, it builds it!
    init_db()

    while True:
        target_company = input("\nEnter a company name (e.g., figma, stripe) or 'exit': ").strip().lower()

        if target_company in ['exit', 'quit']:
            print("Shutting down scraper. Goodbye!")
            break

        if not target_company:
            continue

        # --- PHASE 1 & 2: SCRAPE AND SAVE ---
        print(f"\n[*] Fetching jobs for '{target_company}'...")
        jobs = fetch_jobs(target_company)

        if not jobs:
            print(f"[!] Could not find any jobs for '{target_company}'.\n")
            continue

        print(f"[+] Success! Found {len(jobs)} open roles.")
        save_jobs(jobs)

        # --- PHASE 3: AI PROCESSING ---
        print("\n[*] Checking database for jobs that need AI analysis...")
        unprocessed = get_unprocessed_jobs(limit=5)  # Process 5 at a time to respect API rate limits

        if unprocessed:
            print(f"[*] Waking up Gemini AI to analyze {len(unprocessed)} jobs...")

            for job_id, raw_desc in unprocessed:
                print(f"    -> Reading Job ID {job_id}...")

                # 1. Ask the AI to read the text
                ai_result = analyze_job_description(raw_desc)

                # 2. Save the structured JSON into the SQL columns
                update_job_ai_data(job_id, ai_result)

                # 3. Respect the rate limit (pause for 4 seconds so Google doesn't block us)
                time.sleep(4)

            print("[+] AI Batch Processing complete! (Run again to process the next 5)")
        else:
            print("[+] All jobs in the database have already been analyzed!")


if __name__ == "__main__":
    main()
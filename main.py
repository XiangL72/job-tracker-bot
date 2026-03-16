from scraper.greenhouse import fetch_jobs
from db.database import save_jobs  # NEW: Import our save function


def main():
    print("=======================================")
    print("   TERMINAL JOB SCRAPER - V2 (DATABASE)   ")
    print("=======================================")

    while True:
        target_company = input("\nEnter a company name (e.g., figma, stripe) or 'exit': ").strip().lower()

        if target_company in ['exit', 'quit']:
            print("Shutting down scraper. Goodbye!")
            break

        if not target_company:
            continue

        print(f"\n[*] Fetching jobs for '{target_company}'...")
        jobs = fetch_jobs(target_company)

        if not jobs:
            print(f"[!] Could not find any jobs for '{target_company}'.\n")
            continue

        print(f"[+] Success! Found {len(jobs)} open roles on the website.")

        # NEW: Save the jobs to the database
        save_jobs(jobs)


if __name__ == "__main__":
    main()
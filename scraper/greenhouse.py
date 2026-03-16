import requests
from typing import List
from scraper.models import JobPosting


def fetch_jobs(company_name: str) -> List[JobPosting]:
    api_url = f"https://boards-api.greenhouse.io/v1/boards/{company_name}/jobs?content=true"

    try:
        response = requests.get(api_url)
        # If the company doesn't exist, this catches the 404 error
        if response.status_code != 200:
            return []

        data = response.json()

        # Inside fetch_jobs, update your for-loop:
        job_postings = []
        for job in data.get("jobs", []):
            import html  # We use this to clean up the messy text slightly

            job_postings.append(JobPosting(
                title=job.get("title", "Unknown"),
                company=company_name,
                location=job.get("location", {}).get("name", "Unknown"),
                url=job.get("absolute_url", ""),
                # Grab the raw description text
                description=job.get("content", "")
            ))
        return job_postings
    except Exception as e:
        print(f"\n[!] Network Error: {e}")
        return []
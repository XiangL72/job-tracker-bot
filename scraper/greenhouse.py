import requests
# Import our new filters
from config import CANADA_KEYWORDS


def fetch_jobs(board_token):
    url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        all_jobs = data.get('jobs', [])
        canada_jobs = []

        for job in all_jobs:
            location = job.get('location', {}).get('name', "").lower()

            # THE FILTER: Only keep it if it mentions a Canadian city or "Canada"
            if any(city in location for city in CANADA_KEYWORDS):
                canada_jobs.append(job)

        print(f"[+] {board_token.upper()}: Found {len(all_jobs)} total, kept {len(canada_jobs)} in Canada.")
        return canada_jobs

    except Exception as e:
        print(f"[-] Error fetching {board_token}: {e}")
        return []
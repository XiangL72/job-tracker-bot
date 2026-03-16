from dataclasses import dataclass

@dataclass
class JobPosting:
    title: str
    company: str
    location: str
    url: str
    description: str
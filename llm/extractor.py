import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. Load the secret key from the .env file into the system
load_dotenv()

# 2. Initialize the AI Client (It automatically finds your GEMINI_API_KEY)
client = genai.Client()


def analyze_job_description(description: str) -> dict:
    """Sends the raw description to Gemini and forces a structured JSON response."""

    # The Engineering part: A strict, zero-tolerance system prompt
    # The Engineering Prompt: Objective Data Extraction
    prompt = f"""
        You are an expert technical data extractor. Analyze the following job description and extract three specific data points.

        1. "experience_level": Classify the seniority. 
           STRICTLY use one of these exact phrases: "Internship", "Entry Level", "Mid Level", "Senior", or "Staff/Principal".
           (If the description mentions "returning to school", "undergraduate", or "co-op", classify it as "Internship").

        2. "tech_stack": Extract a comma-separated list of technical tools, programming languages, databases, and frameworks.
           ONLY include hard technical skills (e.g., Python, Kubernetes, React, Redis, AWS).
           IGNORE generic soft skills (e.g., leadership, communication, agile) and generic terms (e.g., SaaS, APIs).

        3. "salary": Extract the specific salary range if provided. If not mentioned, return "Not listed".

        Return ONLY a JSON object with these exact keys: "experience_level", "tech_stack", "salary". Do not include markdown formatting.

        Job Description:
        {description}
        """

    try:
        # We tell the API we specifically want JSON back
        response = client.models.generate_content(
            model='gemini-2.5-flash',  # Fast, cheap, and highly capable
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        # Convert the AI's raw text response into a real Python dictionary
        return json.loads(response.text)

    except Exception as e:
        print(f"\n[!] AI Processing Error: {e}")
        # Return a safe fallback if the AI fails or the network drops
        return {"experience_level": "Error", "tech_stack": "Error", "salary": "Error"}


# Quick test if we run this file directly
if __name__ == "__main__":
    dummy_job = """
    We are looking for a scrappy backend engineer to join our startup. 
    You should have at least 3 years of experience building APIs. 
    Our core stack is Python, FastAPI, and PostgreSQL. 
    Compensation is between $120,000 and $150,000 base.
    """

    print("[*] Waking up the LLM to analyze test data...")
    result = analyze_job_description(dummy_job)

    print("\n[+] Structured Data Extracted:")
    print(json.dumps(result, indent=4))
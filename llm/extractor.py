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
    prompt = f"""
        You are an expert technical data extractor. Read the following job description and extract the data following THESE STRICT RULES:

        1. "experience_level": You MUST categorize the role into exactly ONE of these exact phrases: "Internship", "Entry Level", "Mid Level", "Senior", "Director/Executive", or "Not specified". Do not copy text from the description.
        2. "tech_stack": Extract ONLY recognized programming languages, software frameworks, databases, and cloud platforms (e.g., Python, React, AWS, PostgreSQL, Kubernetes). IGNORE generic corporate terms like "SaaS", "design tools", "AI tools", or "Figma". Return them as a comma-separated string.
        3. "salary": Extract the compensation range if available.

        You MUST respond ONLY with a valid JSON object. Do not add any markdown formatting, code blocks, or conversational text.
        Use exactly these keys: "experience_level", "tech_stack", "salary".

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
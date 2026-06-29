import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables (like API keys) from the .env file
load_dotenv()

# We initialize the OpenAI client. It will automatically look for the OPENAI_API_KEY environment variable.
client = OpenAI()

def generate_invite_message(candidate_name, sport, proposed_time, top_factors):
    """
    Uses Generative AI (LLM) to write a personalized, friendly invite message.
    """
    # We join the top factors into a readable string, e.g. "proximity score, reliability"
    factors_str = ", ".join(top_factors)
    
    prompt = f"""
    System: You are writing a short, friendly invite message on behalf of a sports-matchmaking app called 'Let's Play'.
    Be casual and specific. Mention the sport, the proposed time, and one specific reason this is a
    good match, drawn from the factors below. Two sentences maximum.

    Player being invited: {candidate_name}
    Sport: {sport}
    Proposed time: {proposed_time}
    Match reasons: {factors_str}
    """

    try:
        # Call the OpenAI API (we use a fast/cheap model like gpt-4o-mini or gpt-3.5-turbo)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a friendly matchmaker."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7 # 0.7 gives a good balance of creativity and predictability
        )
        
        # Extract the text from the response
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating invite: {e}")
        # Always provide a fallback message in case the AI API fails (e.g., if we run out of credits)
        return f"Hey {candidate_name}! We found a great match for {sport} at {proposed_time}. Are you in?"

if __name__ == "__main__":
    # Test the function (will fail if OPENAI_API_KEY is not set in .env)
    print("Testing GenAI Invite Generation...")
    print(generate_invite_message("Alex", "Tennis", "Saturday 10 AM", ["similar skill level", "close by"]))

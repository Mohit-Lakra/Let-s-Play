import os
from openai import OpenAI
from database import get_db

# Connect to Mistral's API using the OpenAI library
client = OpenAI(
    api_key=os.getenv("MISTRAL_API_KEY"),
    base_url="https://api.mistral.ai/v1"
)

async def generate_scouting_report(candidate_id: str) -> str:
    """
    RAG Pipeline: Retrieval-Augmented Generation.
    1. Retrieve all unstructured post-match text reviews about this candidate from MongoDB.
    2. Augment a prompt with these reviews.
    3. Generate a comprehensive scouting report using LLM.
    """
    db = get_db()
    if not db:
        return "Database not connected. Cannot retrieve scouting data."
        
    # [Retrieval Phase]
    # We query MongoDB directly from Python to get all PeerRatings for this user
    # Assuming there's a collection called 'peerratings'
    reviews_cursor = db.peerratings.find({"ratedUserId": candidate_id})
    reviews = await reviews_cursor.to_list(length=20)
    
    # If no reviews exist yet, we mock some for the sake of the resume/demo
    if not reviews:
        historical_text = [
            "Great stamina, always tracks back on defense.",
            "A bit aggressive but highly skilled.",
            "Was 5 minutes late but brought extra water for the team."
        ]
    else:
        # In reality, we'd extract text feedback from the DB documents
        historical_text = [r.get("comment", "") for r in reviews if "comment" in r]
        
    context = "\n- ".join(historical_text)
    
    # [Augmented Generation Phase]
    prompt = f"""
    You are an expert sports scout. Analyze the following historical peer reviews 
    for a player and synthesize them into a short, punchy 2-sentence scouting report.
    Highlight their strengths and any behavioral quirks.

    Player Reviews:
    - {context}
    """

    try:
        response = client.chat.completions.create(
            model="mistral-small-latest",
            messages=[
                {"role": "system", "content": "You are a professional scout analyst."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"RAG Error: {e}")
        return "Scouting report unavailable at this time."

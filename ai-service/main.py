import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import List

# Import our AI pipelines
from pipelines.ranking import rank_candidates
from pipelines.no_show_model import predict_no_show
from pipelines.invite_gen import generate_invite_message
from pipelines.ratings import update_player_rating
from pipelines.squad_builder import build_squads

# V2 Advanced Imports
from database import connect_to_mongo, close_mongo_connection, get_db
from pipelines.dl_match_predictor import predict_success_probability, train_model_from_db
from pipelines.scouting_report import generate_scouting_report

from dotenv import load_dotenv
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="Let's Play AI Service V2", lifespan=lifespan)

# --- Security: Internal API Key Check ---
# This ensures that ONLY our Node.js backend can talk to this AI service.
# We don't want regular users hitting these heavy AI routes directly.
async def verify_internal_key(x_internal_key: str = Header(None)):
    expected_key = os.getenv("INTERNAL_API_KEY", "dev_key_123")
    if x_internal_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid internal API key")

# --- Pydantic Data Models (for validation) ---

class CandidateFeatures(BaseModel):
    candidate_id: str
    distance_km: float
    rating_overall: float
    reliability: float
    availability_overlap: float

class RankRequest(BaseModel):
    requester_id: str
    requester_rating_overall: float
    candidates: List[CandidateFeatures]

class NoShowRequest(BaseModel):
    candidate_id: str
    past_no_show_rate: float
    days_since_last_match: float
    request_lead_time_hours: float
    reliability: float

class InviteGenRequest(BaseModel):
    candidate_name: str
    sport: str
    proposed_time: str
    top_factors: List[str]

class RatingUpdateRequest(BaseModel):
    user_id: str
    current: dict
    peer_scores: dict

class SquadPlayer(BaseModel):
    player_id: str
    overall: float

class SquadBuildRequest(BaseModel):
    players: List[SquadPlayer]

# --- API Endpoints ---

@app.post("/internal/rank", dependencies=[Depends(verify_internal_key)])
async def api_rank(request: RankRequest):
    """Ranks players using the weighted similarity algorithm."""
    requester = {"overall": request.requester_rating_overall}
    candidates_list = [c.model_dump() for c in request.candidates]
    ranked = rank_candidates(requester, candidates_list)
    return {"ranked": ranked}

@app.post("/internal/predict-no-show", dependencies=[Depends(verify_internal_key)])
async def api_predict_no_show(request: NoShowRequest):
    """Predicts no-show risk using Scikit-Learn Logistic Regression."""
    return predict_no_show(request.model_dump())

@app.post("/internal/generate-invite", dependencies=[Depends(verify_internal_key)])
async def api_generate_invite(request: InviteGenRequest):
    """Generates a friendly invite message using OpenAI."""
    message = generate_invite_message(
        request.candidate_name, 
        request.sport, 
        request.proposed_time, 
        request.top_factors
    )
    return {"message": message}

@app.post("/internal/update-ratings", dependencies=[Depends(verify_internal_key)])
async def api_update_ratings(request: RatingUpdateRequest):
    """Calculates Elo-style rating updates after a match."""
    new_stats = update_player_rating(request.current, request.peer_scores)
    return new_stats

@app.post("/internal/build-squad", dependencies=[Depends(verify_internal_key)])
async def api_build_squad(request: SquadBuildRequest):
    """Splits players into two balanced teams."""
    players_list = [p.model_dump() for p in request.players]
    squads = build_squads(players_list)
    return squads

# --- V2 Advanced Endpoints ---

class DLMatchPredictionRequest(BaseModel):
    distance_km: float
    rating_diff: float
    reliability: float
    time_of_day_score: float

@app.post("/internal/v2/predict-success", dependencies=[Depends(verify_internal_key)])
async def api_v2_predict_success(request: DLMatchPredictionRequest):
    """Uses PyTorch Deep Neural Network to predict match success."""
    prob = predict_success_probability(request.model_dump())
    return {"success_probability": prob}

@app.post("/internal/v2/train-dl", dependencies=[Depends(verify_internal_key)])
async def api_v2_train_dl():
    """Triggers a background training job in PyTorch using data straight from MongoDB."""
    db = get_db()
    result = await train_model_from_db(db)
    return result

class ScoutingReportRequest(BaseModel):
    candidate_id: str

@app.post("/internal/v2/scouting-report", dependencies=[Depends(verify_internal_key)])
async def api_v2_scouting_report(request: ScoutingReportRequest):
    """Uses GenAI RAG to pull MongoDB reviews and synthesize a scouting report."""
    report = await generate_scouting_report(request.candidate_id)
    return {"scouting_report": report}

@app.get("/")
def health_check():
    return {"status": "AI Service V2 is running"}

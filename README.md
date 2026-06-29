# Let's Play – Sports & Game Matchmaking Platform ⚽🏸

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)
![Python FastAPI](https://img.shields.io/badge/AI_Service-Python_FastAPI-green?style=for-the-badge&logo=fastapi)

**Let's Play** is a full-stack web application designed to solve a real-world coordination problem: people who want to play a sport or game often can't find a consistent group. Plans fall through, or teams simply never assemble. 

Let's Play solves this by letting users post play requests, automatically matching them with compatible nearby players based on a trust/skill rating, and generating personalized invites using GenAI.

## 🚀 Architecture & Tech Stack

This project uses a modern, decoupled microservices architecture:

### 1. Web Application (MERN Stack)
*   **Frontend:** React 18 (Vite), featuring a rich, glassmorphism UI with smooth animations.
*   **Backend:** Node.js + Express 4.
*   **Database:** MongoDB + Mongoose, utilizing **`2dsphere` geospatial queries** to surface nearby players instantly.
*   **Real-time:** `Socket.io` pushes live updates the instant a play request finds a match or a match is confirmed.
*   **Security:** JWT-based authentication and Bcrypt password hashing.

### 2. Matchmaking Intelligence (Python Microservice)
*   **Framework:** FastAPI + Pydantic for strict data validation.
*   **Database:** Direct asynchronous MongoDB integration using `motor` to pull massive training datasets bypassing Node.js.
*   **Ranking Algorithm:** A deterministic weighted similarity algorithm evaluating geographic proximity (Haversine formula), skill closeness, and availability overlap.
*   **Deep Learning (PyTorch):** A custom Deep Neural Network (`torch.nn`) that learns complex, non-linear relationships between geospatial data, player reliability, and time-of-day to predict the exact probability of a successful match.
*   **Generative AI (RAG):** Instead of simple prompts, we implemented a Retrieval-Augmented Generation (RAG) pipeline using the OpenAI API. It retrieves unstructured post-match peer reviews from MongoDB and synthesizes them into punchy, real-time "Scouting Reports" for every candidate.
*   **Auto-Squad-Builder:** A greedy algorithm that mathematically balances two full teams the moment enough players are available.

---

## 💻 Running the Project Locally

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   A MongoDB Atlas Cluster URI
*   An OpenAI API Key

### Step 1: Start the AI Service
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # (or install fastapi uvicorn pydantic scikit-learn openai pandas python-dotenv)
uvicorn main:app --reload
```

### Step 2: Start the Express Server
Create a `.env` file in the `server` directory with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
```bash
cd server
npm install
npm run dev
```

### Step 3: Start the React Client
```bash
cd client
npm install
npm run dev
```

---

## 🌟 Resume Highlights
If you are reviewing this project from a resume, here are the key engineering challenges solved:
*   **Microservices Communication:** Secure, stateless internal HTTP communication between a Node.js REST API and a Python FastAPI service.
*   **Geospatial Data:** Implemented MongoDB `$geoNear` aggregation pipelines for highly efficient location-based filtering before passing data to the AI ranking engine.
*   **Real-time UX:** Built a robust WebSocket (Socket.io) layer to transform static HTTP request/response cycles into a dynamic, real-time match feed.
*   **Algorithmic Balancing:** Designed an Elo-inspired rating decay and an O(N log N) greedy partitioning algorithm for automated team building.

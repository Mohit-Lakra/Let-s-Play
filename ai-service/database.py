import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/letsplay")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGO_URI)
    # The database name is parsed from the URI or default to 'test'
    db_name = MONGO_URI.split('/')[-1].split('?')[0]
    if not db_name:
        db_name = "letsplay"
    db.db = db.client[db_name]
    print(f"Python connected to MongoDB: {db_name}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Python disconnected from MongoDB")

def get_db():
    return db.db

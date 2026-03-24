import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient
from bson import ObjectId

try:
    from app.config import MONGODB_URI
except Exception:
    MONGODB_URI = os.getenv("MONGODB_URI", "")
MODULE_ID = "6961197fb9c0423985754c6e"

def main():
    if not MONGODB_URI:
        print("Set MONGODB_URI in .env")
        return
    client = MongoClient(MONGODB_URI)
    db = client["learn-rights"]
    try:
        oid = ObjectId(MODULE_ID)
    except Exception:
        print("Invalid module ID")
        return
    module = db["modules"].find_one({"_id": oid})
    if module:
        title = module.get("title", "")
        print("Module ID:", module["_id"])
        print("Module title:", repr(title))
        print("Module title length:", len(title))
    else:
        print("Module not found")
    client.close()

if __name__ == "__main__":
    main()

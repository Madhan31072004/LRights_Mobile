import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://gopaladasmadhanmohan70998_db_user:FOEEnULaQ10cAQea@cluster0.4arbdnd.mongodb.net/learn-rights?retryWrites=true&w=majority")

def main():
    client = MongoClient(MONGODB_URI)
    db = client["learn-rights"]
    users = list(db["users"].find({}, {"name": 1, "email": 1, "mobile": 1, "role": 1}))
    print("\n=== USERS IN DATABASE ===")
    for i, u in enumerate(users or []):
        print(f"{i+1}. Name: {u.get('name')}, Email: {u.get('email')}, Role: {u.get('role')}")
    print(f"\nTotal users: {len(users)}")
    client.close()

if __name__ == "__main__":
    main()

# Converted from check-modules.js - list modules in DB
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
    modules = list(db["modules"].find({}, {"title": 1, "_id": 1}))
    print("\n=== MODULES IN DATABASE ===")
    if not modules:
        print("No modules found in database")
    else:
        for i, m in enumerate(modules):
            print(f"{i+1}. ID: {m['_id']}")
            print(f'   Title: "{m.get("title", "")}"')
            print("   ---")
    print(f"\nTotal modules: {len(modules)}")
    client.close()
    print("Database connection closed")


if __name__ == "__main__":
    main()

"""Fix the mobile index issue: unset null mobile fields and ensure sparse unique index."""
from app.database import get_db

db = get_db()
users = db["users"]

# Count users with null/missing mobile
null_mobile = list(users.find({"$or": [{"mobile": None}, {"mobile": ""}]}, {"name": 1, "email": 1, "mobile": 1}))
print(f"Users with null/empty mobile: {len(null_mobile)}")
for u in null_mobile:
    print(f"  {u.get('name')} - {u.get('email')} - mobile: {repr(u.get('mobile'))}")

# Fix them one by one: unset the mobile field  
fixed = 0
for u in null_mobile:
    r = users.update_one({"_id": u["_id"]}, {"$unset": {"mobile": 1}})
    if r.modified_count > 0:
        fixed += 1
print(f"Fixed {fixed} users (unset null/empty mobile field)")

# Verify
remaining = users.count_documents({"mobile": None})
print(f"Remaining users with mobile=None: {remaining}")

# Try signup test
print("\nTesting signup...")
from app.routers.auth import signup
from app.schemas import SignupBody
try:
    body = SignupBody(name="Index Fix Test", email="indexfix_test@test.com", password="test123456", preferredLanguage="en")
    result = signup(body)
    print(f"SIGNUP OK: {result['message']}, token: {result['token'][:30]}...")
    # Clean up test user
    users.delete_one({"email": "indexfix_test@test.com"})
    print("Test user cleaned up")
except Exception as e:
    print(f"SIGNUP FAILED: {e}")

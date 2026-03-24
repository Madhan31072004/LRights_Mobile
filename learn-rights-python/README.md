# LearnRights Backend - Python

This is the **Python (FastAPI)** version of the LearnRights backend. It exposes the **same API** as the original Node/Express backend so the existing **React frontend** works without changes.

## Stack

- **FastAPI** – API server
- **PyMongo** – MongoDB (same DB as JS version)
- **PyJWT** + **passlib[bcrypt]** – auth
- **google-generativeai** – Gemini 1.5 Flash (optimized model) for chatbot and quiz generation

## Setup

1. **Create virtualenv and install dependencies**

   ```bash
   cd learn-rights-python
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```

2. **Environment**

   Create a `.env` file (optional) with:

   - `MONGODB_URI` – MongoDB connection string (default in code for dev)
   - `JWT_SECRET` – secret for JWT (default in code for dev)
   - `GOOGLE_AI_API_KEY` – for Gemini chatbot/quiz (optional; fallbacks used if missing)

## Run

```bash
# From learn-rights-python directory with venv active
uvicorn app.main:app --reload --port 5000
# Or
python run.py
```

API: **http://localhost:5000**  
Docs: **http://localhost:5000/docs**

## Frontend

Keep using the **React frontend** (`learn-rights-frontend`). Set its API base to `http://localhost:5000/api` (e.g. in `src/api/axios.js`). Run the frontend as usual:

```bash
cd learn-rights-frontend
npm install
npm start
```

## Python UI (Streamlit)

A full Python-served UI that uses the same API (same output as React):

```bash
# With backend running on port 5000
cd learn-rights-python
streamlit run ui/app.py
```

Opens in the browser: **Login**, **Signup**, **Dashboard**, **Modules**, **Chatbot**, **Leaderboard**, **Profile**.

## Scripts (converted from JS)

Run from `learn-rights-python` (or with `PYTHONPATH` set):

- `python scripts/check_modules.py` – list modules in DB
- `python scripts/check_users.py` – list users in DB
- `python scripts/check_module_title.py` – inspect a module by ID (set `MONGODB_URI` or use `app.config`)
- `python scripts/list_models.py` – list Google AI models (set `GOOGLE_AI_API_KEY`)
- `python scripts/test_progress_logic.py` – test progress logic (no DB)
- `python scripts/test_chatbot.py` – test chatbot (backend must be running)
- `python scripts/test_quiz.py [JWT_TOKEN]` – test quiz by module ID

## API parity

Endpoints match the JS backend:

- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET/PUT /api/profile/:userId`, `POST /api/profile/:userId/photo`
- `GET /api/progress/:userId`, `POST /api/progress/complete-subtopic`, `POST /api/progress/submit-quiz`, etc.
- `GET /api/modules`, `GET /api/modules/user/:userId`, `GET /api/modules/:id`
- `GET /api/quizzes/module?moduleId=...`, etc.
- `POST /api/ai/chatbot`, `POST /api/ai/quiz`
- `GET /api/leaderboard`
- `GET /api/language`, `GET /api/test`
- `GET /api/admin/users`, etc.

Same output and behavior as the previous JS backend.

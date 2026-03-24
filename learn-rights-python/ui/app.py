"""
LearnRights - Python UI (Streamlit).
Uses the same API as the React app (http://localhost:5000/api).
Run: streamlit run ui/app.py
Ensure the Python backend is running first.
"""
import streamlit as st
import requests

API_BASE = "http://localhost:5000/api"

def api_get(path, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    r = requests.get(f"{API_BASE}{path}", headers=h, timeout=10)
    if r.status_code == 401:
        return None
    r.raise_for_status()
    return r.json()

def api_post(path, json=None, token=None):
    h = {"Authorization": f"Bearer {token}"} if token else {}
    r = requests.post(f"{API_BASE}{path}", json=json or {}, headers=h, timeout=15)
    r.raise_for_status()
    return r.json()

def main():
    st.set_page_config(page_title="LearnRights", page_icon="⚖️", layout="wide")
    if "token" not in st.session_state:
        st.session_state.token = None
    if "user" not in st.session_state:
        st.session_state.user = None

    token = st.session_state.token
    user = st.session_state.user

    # Sidebar nav
    st.sidebar.title("LearnRights")
    st.sidebar.markdown("---")
    if token and user:
        st.sidebar.success(f"Hi, {user.get('name') or user.get('email') or 'User'}")
        nav = st.sidebar.radio("Go to", ["Dashboard", "Modules", "Chatbot", "Leaderboard", "Profile"], label_visibility="collapsed")
        if st.sidebar.button("Logout"):
            st.session_state.token = None
            st.session_state.user = None
            st.rerun()
    else:
        nav = st.sidebar.radio("Go to", ["Home", "Login", "Signup"], label_visibility="collapsed")

    # Pages
    if not token and nav in ("Dashboard", "Modules", "Chatbot", "Leaderboard", "Profile"):
        nav = "Login"

    if nav == "Home":
        st.title("Learn Your Rights")
        st.markdown("Empower yourself with legal knowledge. Simple, multilingual, AI-powered.")
        st.markdown("---")
        st.info("Please **Login** or **Signup** from the sidebar to continue.")
        if st.button("Go to Login"):
            st.session_state._nav = "Login"
            st.rerun()

    elif nav == "Login":
        st.title("Login")
        with st.form("login"):
            email = st.text_input("Email")
            mobile = st.text_input("Mobile (optional)")
            password = st.text_input("Password", type="password")
            if st.form_submit_button("Login"):
                if not email and not mobile:
                    st.error("Email or mobile required")
                else:
                    try:
                        data = api_post("/auth/login", {"email": email or None, "mobile": mobile or None, "password": password})
                        st.session_state.token = data["token"]
                        st.session_state.user = data.get("user", {})
                        st.success("Login successful!")
                        st.rerun()
                    except requests.RequestException as e:
                        detail = e.response.json().get("detail", str(e)) if e.response is not None else str(e)
                        st.error(detail)

    elif nav == "Signup":
        st.title("Signup")
        with st.form("signup"):
            name = st.text_input("Name")
            email = st.text_input("Email")
            mobile = st.text_input("Mobile (optional)")
            password = st.text_input("Password", type="password")
            if st.form_submit_button("Signup"):
                if not email:
                    st.error("Email required")
                else:
                    try:
                        data = api_post("/auth/signup", {"name": name, "email": email, "mobile": mobile or None, "password": password})
                        st.session_state.token = data["token"]
                        st.session_state.user = data.get("user", {})
                        st.success("Signup successful!")
                        st.rerun()
                    except requests.RequestException as e:
                        detail = e.response.json().get("detail", str(e)) if e.response is not None else str(e)
                        st.error(detail)

    elif nav == "Dashboard":
        st.title("Dashboard")
        uid = (user or {}).get("id")
        if not uid:
            st.warning("User ID missing")
        else:
            try:
                progress = api_get(f"/progress/{uid}", token)
                modules_data = api_get(f"/modules/user/{uid}", token)
            except Exception as e:
                st.error("Could not load data. Is the backend running? " + str(e))
                progress = {}
                modules_data = []
            if progress:
                c1, c2, c3 = st.columns(3)
                with c1:
                    st.metric("Modules completed", len(progress.get("completedModules") or []))
                with c2:
                    st.metric("Points", progress.get("points", 0))
                with c3:
                    st.metric("Badges", len(progress.get("badges") or []))
            st.subheader("Recent progress")
            for m in (modules_data or [])[:5]:
                p = m.get("progress", {})
                pct = p.get("percentage", 0)
                st.progress(pct / 100)
                st.caption(f"{m.get('title', '')} — {pct}%")
                st.markdown("---")

    elif nav == "Modules":
        st.title("Learning Modules")
        uid = (user or {}).get("id")
        try:
            modules_data = api_get(f"/modules/user/{uid}", token) if uid else api_get("/modules")
        except Exception:
            modules_data = api_get("/modules")
        if not modules_data:
            st.info("No modules yet.")
        else:
            for m in modules_data:
                with st.expander(m.get("title", "Module")):
                    st.write(m.get("description", ""))
                    p = m.get("progress", {})
                    if p:
                        st.progress((p.get("percentage") or 0) / 100)
                        st.caption(f"{p.get('completedSubTopics', 0)}/{p.get('totalSubTopics', 0)} subtopics")
                    if st.button("Open module", key=m.get("_id"), disabled=True):
                        pass

    elif nav == "Chatbot":
        st.title("Legal Assistant Chatbot")
        msg = st.chat_input("Ask about women's rights, domestic violence, workplace harassment, etc.")
        if msg:
            try:
                data = api_post("/ai/chatbot", {"message": msg, "context": "general"})
                st.chat_message("user").write(msg)
                st.chat_message("assistant").write(data.get("response", ""))
            except Exception as e:
                st.error("Error: " + str(e))
        st.caption("Example: What are my rights in case of domestic violence? | Helpline: 181")

    elif nav == "Leaderboard":
        st.title("Leaderboard")
        try:
            lb = api_get("/leaderboard")
        except Exception as e:
            st.error("Could not load leaderboard. " + str(e))
            lb = []
        if not lb:
            st.info("No leaderboard data yet.")
        else:
            for i, u in enumerate(lb, 1):
                st.markdown(f"**#{i}** {u.get('name', '')} — {u.get('points', 0)} pts — {len(u.get('completedModules') or [])} modules")
                st.markdown("---")

    elif nav == "Profile":
        st.title("Profile")
        uid = (user or {}).get("id")
        if not uid:
            st.warning("User ID missing")
        else:
            try:
                profile_data = api_get(f"/profile/{uid}", token)
            except Exception as e:
                st.error("Could not load profile. " + str(e))
                profile_data = {}
            if profile_data:
                st.write("Name:", profile_data.get("name"))
                st.write("Email:", profile_data.get("email"))
                st.write("Points:", profile_data.get("points", 0))
                st.write("Modules completed:", len(profile_data.get("completedModules") or []))
                st.write("Badges:", ", ".join(profile_data.get("badges") or []) or "None")

if __name__ == "__main__":
    main()

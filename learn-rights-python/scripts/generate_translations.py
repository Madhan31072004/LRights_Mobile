"""
Pre-generate translations for ALL Indian languages using Google Translate.
Run this once to warm up the backend cache so users get instant switching.

Usage:
    cd learn-rights-python
    python scripts/generate_translations.py
"""

import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Add parent to path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from deep_translator import GoogleTranslator

# ── Same language map as the backend ──────────────────────────────────
LANGUAGES = {
    "hi": "hi", "te": "te", "ta": "ta", "kn": "kn", "ml": "ml",
    "mr": "mr", "bn": "bn", "gu": "gu", "pa": "pa", "or": "or",
    "as": "as", "ur": "ur", "sa": "sa", "ne": "ne", "sd": "sd",
    "mai": "mai",
}

LANG_NAMES = {
    "hi": "Hindi", "te": "Telugu", "ta": "Tamil", "kn": "Kannada",
    "ml": "Malayalam", "mr": "Marathi", "bn": "Bengali", "gu": "Gujarati",
    "pa": "Punjabi", "or": "Odia", "as": "Assamese", "ur": "Urdu",
    "sa": "Sanskrit", "ne": "Nepali", "sd": "Sindhi", "mai": "Maithili",
}

# ── English UI strings (must match frontend translation.js) ─────────
ENGLISH_STRINGS = {
    "home": "Home",
    "dashboard": "Dashboard",
    "modules": "Modules",
    "quiz": "Quiz",
    "leaderboard": "Leaderboard",
    "chatbot": "Bot",
    "profile": "Profile",
    "logout": "Logout",
    "login": "Login",
    "hero.title": "Welcome to LearnRights",
    "hero.subtitle": "Empowering Rural Women with Legal Knowledge",
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back",
    "dashboard.modules_completed": "Modules Completed",
    "dashboard.total_points": "Total Points",
    "dashboard.average_score": "Average Quiz Score",
    "dashboard.your_rank": "Your Rank",
    "dashboard.continue_journey": "Continue your journey towards legal empowerment",
    "dashboard.quick_actions": "Quick Actions",
    "dashboard.continue_learning": "Continue Learning",
    "dashboard.ask_assistant": "Ask Legal Assistant",
    "dashboard.view_leaderboard": "View Leaderboard",
    "dashboard.update_profile": "Update Profile",
    "dashboard.recent_progress": "Recent Progress",
    "dashboard.achievements": "Achievements",
    "dashboard.no_achievements": "Complete modules and quizzes to earn badges!",
    "modules.title": "Learning Modules",
    "modules.subtitle": "Explore your rights and protections",
    "modules.start": "Start Module",
    "modules.loading": "Loading modules...",
    "modules.search_placeholder": "Search modules...",
    "modules.no_modules_found": "No modules found",
    "modules.try_different_search": "Try different search or filters.",
    "modules.topics": "Topics",
    "modules.review": "Review",
    "modules.back": "Back to Modules",
    "modules.view_subtopics": "View Subtopics",
    "modules.take_quiz": "Take Quiz",
    "modules.back_to_topics": "Back to Topics",
    "modules.click_to_read": "Click to read",
    "modules.back_to_subtopics": "Back to Subtopics",
    "modules.content_not_available": "Content not available.",
    "modules.already_completed": "You have completed this topic!",
    "modules.mark_completed": "Mark as Completed",
    "modules.filters.all": "All",
    "modules.filters.not_started": "Not Started",
    "modules.filters.in_progress": "In Progress",
    "modules.filters.completed": "Completed",
    "chatbot.error": "Sorry, I couldn't process your request. Please try again.",
    "chatbot.voiceNotSupported": "Voice input not supported in this browser.",
    "chatbot.voiceError": "Voice input failed. Please try again.",
    "chatbot.suggestion1": "What are my basic rights?",
    "chatbot.suggestion2": "How to file a complaint?",
    "chatbot.suggestion3": "Legal aid services?",
    "chatbot.suggestion4": "Domestic violence help?",
    "chatbot.title": "Gemini",
    "chatbot.subtitle": "Legal rights assistant",
    "chatbot.clearChat": "New chat",
    "chatbot.welcome": "Ask me anything about your legal rights",
    "chatbot.tryAsking": "Try asking:",
    "chatbot.attachImage": "Attach image",
    "chatbot.placeholder": "Ask me about your legal rights...",
    "chatbot.voice": "Voice input",
    "chatbot.send": "Send",
    "chatbot.listening": "Listening...",
    "chatbot.speakClearly": "Speak your question clearly",
    "chatbot.disclaimer": "This AI provides general information only. For legal advice, consult a qualified attorney.",
    "users.fetchError": "Failed to fetch users",
    "users.loading": "Loading users...",
    "users.title": "User Management",
    "users.subtitle": "View and manage all platform users",
    "users.totalUsers": "Total Users",
    "users.searchPlaceholder": "Search users by name or email...",
    "users.sortBy": "Sort by:",
    "users.name": "Name",
    "users.email": "Email",
    "users.noUsers": "No users found",
    "users.noSearchResults": "Try adjusting your search criteria",
    "users.noUsersText": "No users have registered yet",
    "users.points": "points",
    "users.joined": "Joined",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.passwordTooShort": "Password must be at least 6 characters",
    "auth.signupSuccess": "Account created successfully!",
    "auth.signupFailed": "Failed to create account",
    "auth.joinCommunity": "Join our community of empowered learners",
    "auth.createAccount": "Create Your Account",
    "auth.startJourney": "Start your legal education journey today",
    "auth.fullName": "Full Name",
    "auth.enterFullName": "Enter your full name",
    "auth.email": "Email Address",
    "auth.enterEmail": "Enter your email address",
    "auth.preferredLanguage": "Preferred Language",
    "auth.password": "Password",
    "auth.createPassword": "Create a strong password",
    "auth.confirmPassword": "Confirm Password",
    "auth.creatingAccount": "Creating Account...",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.signIn": "Sign In",
    "auth.agreeToTerms": "By signing up, you agree to our Terms of Service and Privacy Policy.",
    "profile.change_photo": "Change photo",
    "profile.default_name": "Learner",
    "profile.points": "Points",
    "profile.modules": "Modules",
    "profile.badges": "Badges",
    "profile.tabs.personal": "Personal Info",
    "profile.tabs.progress": "Progress",
    "profile.tabs.achievements": "Achievements",
    "profile.fields.name": "Full Name",
    "profile.fields.email": "Email",
    "profile.fields.mobile": "Mobile",
    "profile.fields.language": "Language",
    "profile.preferences": "Preferences",
    "profile.show_on_leaderboard": "Show my progress on leaderboard",
    "profile.email_notifications": "Receive email updates",
    "profile.save": "Save",
    "profile.saved": "Saved.",
    "profile.progress.completed_modules": "Completed Modules",
    "profile.progress.quizzes_taken": "Quizzes Taken",
    "profile.progress.total_points": "Total Points",
    "profile.progress.module_progress": "Module Progress",
    "profile.progress.subtopics": "subtopics",
    "profile.progress.no_modules": "No modules available yet.",
    "profile.achievements.keep_learning": "Complete modules and quizzes to earn your first badge!",
    "login.failed": "Login failed. Please try again.",
    "login.sign_in_continue": "Sign in to continue your learning journey",
    "login.email_placeholder": "Enter your email",
    "login.password_placeholder": "Enter your password",
    "login.remember_me": "Remember me",
    "login.forgot_password": "Forgot Password?",
    "login.signing_in": "Signing In...",
    "login.or": "or",
    "login.continue_google": "Continue with Google",
    "login.footer": "By signing in, you agree to our Terms of Service and Privacy Policy",
    "leaderboard.error_load": "Failed to load leaderboard",
    "leaderboard.loading": "Loading leaderboard...",
    "leaderboard.error_title": "Something went wrong",
    "leaderboard.title": "Leaderboard",
    "leaderboard.subtitle": "See how you rank among fellow learners!",
    "leaderboard.full_leaderboard_title": "Complete Rankings",
    "leaderboard.no_data_message": "Start learning to see your ranking here!",
    "home.features.modules.title": "Learning Modules",
    "home.features.modules.description": "Rights explained with real-life examples and interactive content.",
    "home.features.modules.action": "Start Learning",
    "home.features.chatbot.title": "AI Legal Assistant",
    "home.features.chatbot.description": "Ask legal questions anytime in your preferred language.",
    "home.features.chatbot.action": "Ask Questions",
    "home.features.leaderboard.title": "Community Leaderboard",
    "home.features.leaderboard.description": "Earn points, track progress, and compete with others.",
    "home.features.leaderboard.action": "View Rankings",
    "home.stats.users": "Active Learners",
    "home.stats.modules": "Learning Modules",
    "home.stats.languages": "Languages",
    "home.stats.support": "AI Support",
    "home.hero.title": "Learn Your Rights",
    "home.hero.subtitle": "Empower Yourself",
    "home.hero.description": "Learn about your legal rights, access resources, and connect with a supportive community.",
    "home.hero.start_learning": "Start Learning",
    "home.hero.view_dashboard": "View Dashboard",
    "home.hero.rights": "Know Your Rights",
    "home.hero.empower": "Get Empowered",
    "home.hero.grow": "Grow Together",
    "home.features.title": "Why Choose Learn Rights?",
    "home.features.subtitle": "Discover the features that make learning legal rights accessible and engaging.",
    "home.cta.title": "Ready to Start Your Learning Journey?",
    "home.cta.description": "Join thousands of women who are learning and exercising their rights every day.",
    "home.cta.join_now": "Join Now - It's Free",
    "home.cta.sign_in": "Sign In",
    "admin.title": "Admin Dashboard",
    "quiz.title": "Quiz",
    "quiz.subtitle": "Test your knowledge and earn points!",
    "quiz.start_quiz": "Start Quiz",
    "quiz.submit_quiz": "Submit Quiz",
    "quiz.questions": "Questions",
    "quiz.pass_mark": "Pass",
    "quiz.total_marks": "Marks",
    "quiz.no_quizzes_title": "No Quizzes Available",
    "quiz.no_quizzes_message": "Complete some modules to unlock quizzes!",
    "profile.title": "Profile",
    "profile.edit": "Edit Profile",
    "login.title": "Login",
    "login.welcome_back": "Welcome Back",
    "login.sign_in": "Sign In",
    "login.email": "Email Address",
    "login.password": "Password",
    "login.no_account": "Don't have an account?",
    "login.sign_up": "Sign Up",
    "signup.title": "Sign Up",
    "signup.create_account": "Create Account",
    "signup.already_have_account": "Already have an account?",
    "signup.sign_in": "Sign In",
    "app.name": "Learn Rights",
}

CACHE_DIR = Path(__file__).resolve().parent.parent / "app" / "translation_cache"


def translate_one(text, google_code):
    try:
        result = GoogleTranslator(source="en", target=google_code).translate(text)
        return result if result else text
    except Exception as e:
        print(f"  ⚠ Failed: '{text[:30]}' → {e}")
        return text


def generate_for_language(lang_code, google_code, lang_name):
    cache_file = CACHE_DIR / f"{lang_code}.json"
    if cache_file.exists():
        print(f"  ✓ {lang_name} ({lang_code}) — already cached, skipping")
        return True

    print(f"  ⏳ {lang_name} ({lang_code}) — translating {len(ENGLISH_STRINGS)} strings …")
    start = time.time()

    keys = list(ENGLISH_STRINGS.keys())
    values = list(ENGLISH_STRINGS.values())

    with ThreadPoolExecutor(max_workers=8) as pool:
        translated = list(pool.map(lambda t: translate_one(t, google_code), values))

    result = dict(zip(keys, translated))
    cache_file.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    elapsed = time.time() - start
    print(f"  ✓ {lang_name} done in {elapsed:.1f}s")
    return True


def main():
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\n{'='*60}")
    print("  LearnRights — Pre-generate translations (Google Translate)")
    print(f"  {len(ENGLISH_STRINGS)} strings × {len(LANGUAGES)} languages")
    print(f"  Cache dir: {CACHE_DIR}")
    print(f"{'='*60}\n")

    success = 0
    failed = 0
    total_start = time.time()

    for lang_code, google_code in LANGUAGES.items():
        name = LANG_NAMES.get(lang_code, lang_code)
        try:
            if generate_for_language(lang_code, google_code, name):
                success += 1
        except Exception as e:
            print(f"  ✗ {name} ({lang_code}) FAILED: {e}")
            failed += 1

    total_elapsed = time.time() - total_start
    print(f"\n{'='*60}")
    print(f"  Done! {success} languages translated, {failed} failed")
    print(f"  Total time: {total_elapsed:.1f}s")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()

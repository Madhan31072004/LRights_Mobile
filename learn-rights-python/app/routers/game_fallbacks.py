# Robust Fallbacks for AI Games when Quota hits.

FALLBACK_MATCH = {
    "domestic-violence": [
        {"right": "Protection Order", "desc": "Legal order by Magistrate to stop respondent from committing acts of violence."},
        {"right": "Right to Shared Household", "desc": "Every woman in a domestic relationship has the right to reside in the shared household (PWDVA 2005)."},
        {"right": "Residence Order", "desc": "Court order preventing respondent from disturbing woman's possession of the household."},
        {"right": "Monetary Relief", "desc": "Medical expenses and losses caused due to domestic violence must be paid by respondent."}
    ],
    "workplace-harassment": [
        {"right": "Internal Committee (IC)", "desc": "Mandatory body in offices with 10+ employees to handle harassment complaints."},
        {"right": "3-Month Deadline", "desc": "Standard time limit to file a sexual harassment complaint from the date of incident."},
        {"right": "Confidentiality", "desc": "The contents of the complaint and identity of the victim must not be published."},
        {"right": "Interim Relief", "desc": "Transfer or leave granted during the pendency of a harassment inquiry."}
    ],
    "labor-laws": [
        {"right": "Night Shift Consent", "desc": "Women can work 7 PM to 6 AM only with their written consent and safety measures."},
        {"right": "Creche Facility", "desc": "Establishments with 50+ employees must provide a nursery for children under 6."},
        {"right": "Maternity Leave", "desc": "26 weeks of paid leave for the first two children in India."},
        {"right": "Equal Remuneration", "desc": "Same wages for same work or work of similar nature regardless of gender."}
    ]
}

FALLBACK_SCENARIOS = {
    "domestic-violence": [
        {
            "title": "The Silent Tenant",
            "description": "Anjali's husband's family is forcing her to move out of their home after an argument. What is her right?",
            "options": [
                {"text": "Refuse to leave based on 'Right to Shared Household'", "points": 50, "feedback": "Correct! Under PWDVA 2005, she cannot be evicted except by legal procedure."},
                {"text": "Go to her parents' house immediately", "points": 10, "feedback": "Safe, but she should know she has a legal right to stay."},
                {"text": "Pack everything and hand over the keys", "points": 0, "feedback": "Incorrect. She has a legal right to reside in the shared household."}
            ]
        }
    ]
}

# General variants for variety
GENERAL_VARIANTS = [
    [
        {"right": "Right to Legal Aid", "desc": "Free legal services for women and children under NALSA."},
        {"right": "Zero FIR", "desc": "An FIR registered at any police station regardless of where crime happened."},
        {"right": "Marriage Age", "desc": "Legal minimum age for marriage is 18 for women."},
        {"right": "Succession Rights", "desc": "Equal share in ancestral property for daughters."}
    ],
    [
        {"right": "Equal Pay", "desc": "Same wages for same work regardless of gender (ERA 1976)."},
        {"right": "Privacy Right", "desc": "Right to have your identity protected during legal proceedings."},
        {"right": "Maternity Rights", "desc": "Protection from termination during pregnancy."},
        {"right": "Safety at Work", "desc": "Employers must provide safe environment under POSH Act."}
    ]
]

def get_match_fallback(module_id):
    import random
    raw = FALLBACK_MATCH.get(module_id, random.choice(GENERAL_VARIANTS))
    cards = []
    for i, item in enumerate(raw[:4]):
        match_id = 100 + i
        cards.append({"id": i + 1, "type": "right", "content": item.get("right"), "matchId": match_id})
        cards.append({"id": match_id, "type": "desc", "content": item.get("desc"), "matchId": i + 1})
    return cards

def get_scenario_fallback(module_id):
    return FALLBACK_SCENARIOS.get(module_id, FALLBACK_SCENARIOS["domestic-violence"])

def get_quiz_fallback(module_id):
    return [
        {
            "question": "Which Act protects women from sexual harassment at workplace in India?",
            "options": ["POSH Act 2013", "PWDVA 2005", "Consumer Protection Act", "Maternity Benefit Act"],
            "correctAnswer": 0
        },
        {
            "question": "What is the duration of paid maternity leave for the first 2 children in India?",
            "options": ["12 Weeks", "26 Weeks", "6 Months", "1 Year"],
            "correctAnswer": 1
        },
        {
            "question": "Under the new Labor Codes (2025), women can work night shifts if...",
            "options": ["Only if they are married", "They give written consent and safety is ensured", "It is only in government jobs", "It is not allowed"],
            "correctAnswer": 1
        }
    ]

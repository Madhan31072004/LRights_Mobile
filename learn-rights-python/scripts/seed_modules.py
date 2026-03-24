"""
seed_modules.py – Populate learn-rights MongoDB with comprehensive learning
modules on Indian Constitutional & Legal Rights for Women.
Includes: videos, reference links, and illustration images per subtopic.

Run:  python scripts/seed_modules.py
"""

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://gopaladasmadhanmohan70998_db_user:FOEEnULaQ10cAQea@cluster0.4arbdnd.mongodb.net/learn-rights?retryWrites=true&w=majority",
)

MODULES = [
    # ────────────────────────────────────────────────────────
    # MODULE 1 – FUNDAMENTAL RIGHTS & WOMEN
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-01",
        "title": "Fundamental Rights & Women in the Constitution",
        "description": "Learn about the Indian Constitution's powerful guarantees for gender equality – Articles 14-16, Directive Principles, and landmark Supreme Court cases.",
        "icon": "bi-bank2",
        "color": "#7c3aed",
        "image": "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80",
        "topics": [
            {
                "title": "Right to Equality (Articles 14–16)",
                "subTopics": [
                    {
                        "title": "Article 14 – Equality Before Law",
                        "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
                        "videos": [
                            {"title": "Rights and Legal Status of Women in Indian Constitution", "url": "https://www.youtube.com/watch?v=Ikm6R1-yFqs"},
                            {"title": "Fundamental Rights of the Indian Constitution", "url": "https://www.youtube.com/watch?v=ifTCiPdDpMg"},
                        ],
                        "links": [
                            {"title": "Constitution of India – Article 14 (Full Text)", "url": "https://www.constitutionofindia.net/articles/article-14-equality-before-law/"},
                            {"title": "National Commission for Women", "url": "http://ncw.nic.in/"},
                        ],
                        "content": (
                            "Article 14 guarantees that 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.'\n\n"
                            "🔑 Key Points for Women:\n"
                            "• No law can discriminate against women solely on the basis of sex.\n"
                            "• If a policy gives benefits to men but not women in similar situations, it violates Article 14.\n"
                            "• The Supreme Court has used this article to strike down unfair rules in workplaces, inheritance, and family matters.\n\n"
                            "📌 Landmark Case – Air India v. Nargesh Meerza (1981): The Supreme Court struck down an airline rule that forced air hostesses to retire upon marriage or first pregnancy, calling it arbitrary and violative of Article 14.\n\n"
                            "💡 Remember: Equality doesn't always mean identical treatment. The Constitution allows 'special provisions' for women and children under Article 15(3)."
                        ),
                    },
                    {
                        "title": "Article 15(3) – Special Provisions for Women",
                        "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
                        "videos": [
                            {"title": "Fundamental Rights Quick Revision", "url": "https://www.youtube.com/watch?v=pvbcJ7SkG8w"},
                        ],
                        "links": [
                            {"title": "Article 15(3) – Legal Provisions for Women", "url": "https://www.constitutionofindia.net/articles/article-15-prohibition-of-discrimination-on-grounds-of-religion-race-caste-sex-or-place-of-birth/"},
                            {"title": "Ministry of Women & Child Development", "url": "https://wcd.nic.in/"},
                        ],
                        "content": (
                            "While Article 15 prohibits discrimination on grounds of religion, race, caste, sex, or place of birth, sub-clause (3) empowers the State to make special provisions for women and children.\n\n"
                            "🔑 What This Means:\n"
                            "• The government CAN give women reservations, special benefits, and extra protection.\n"
                            "• Women-only bus seats, women's colleges, ladies compartments in trains – all legal under Article 15(3).\n"
                            "• Special criminal laws for women's safety (like the Domestic Violence Act) are constitutional.\n\n"
                            "📌 Examples of Special Provisions:\n"
                            "• 33% reservation for women in Panchayati Raj institutions under the 73rd Amendment.\n"
                            "• The Nari Adalat (Women's Courts) set up for faster dispute resolution.\n"
                            "• Maternity Benefit Act – providing 26 weeks paid leave.\n\n"
                            "💡 This is NOT reverse discrimination – it is 'affirmative action' to correct centuries of inequality."
                        ),
                    },
                    {
                        "title": "Article 16 – Equal Opportunity in Employment",
                        "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
                        "videos": [
                            {"title": "POSH Act 2013 Full Explanation", "url": "https://www.youtube.com/watch?v=zyzvjxjfKkk"},
                            {"title": "Equal Remuneration Act 1976 Explained", "url": "https://www.youtube.com/watch?v=2hcyDUtDkLY"},
                        ],
                        "links": [
                            {"title": "POSH Act 2013 – Full Text", "url": "https://legislative.gov.in/sites/default/files/A2013-14.pdf"},
                            {"title": "Equal Remuneration Act", "url": "https://labour.gov.in/whatsnew/equal-remuneration-act-1976"},
                        ],
                        "content": (
                            "Article 16 guarantees equality of opportunity in matters of public employment.\n\n"
                            "🔑 Key Protections:\n"
                            "• No woman can be denied a government job because of her sex.\n"
                            "• Equal pay for equal work is a constitutional mandate.\n"
                            "• Married or pregnant women cannot be terminated from government service.\n\n"
                            "📌 Landmark Case – Vishaka v. State of Rajasthan (1997):\n"
                            "The Supreme Court laid down binding guidelines against sexual harassment at the workplace. These later became the POSH Act, 2013.\n\n"
                            "📌 Case – Randhir Singh v. Union of India (1982):\n"
                            "The Supreme Court held that 'equal pay for equal work' is a constitutional right derived from Articles 14 and 16.\n\n"
                            "💡 If your salary is less than a male colleague doing the same job, you have a constitutional right to challenge it."
                        ),
                    },
                ],
            },
            {
                "title": "Directive Principles & Women's Welfare",
                "subTopics": [
                    {
                        "title": "Article 39(a)(d)(e) – Economic Justice for Women",
                        "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
                        "videos": [
                            {"title": "Indian Constitution Explained - Fundamental Rights", "url": "https://www.youtube.com/watch?v=mPMAWSsSLHQ"},
                        ],
                        "links": [
                            {"title": "DPSP – Part IV of Constitution", "url": "https://www.constitutionofindia.net/parts/part-iv/"},
                            {"title": "MGNREGA Official Portal", "url": "https://nrega.nic.in/"},
                        ],
                        "content": (
                            "The Directive Principles of State Policy (Part IV) guide the government to create policies for women's welfare.\n\n"
                            "📜 Article 39(a): Equal right of men and women to an adequate means of livelihood.\n"
                            "📜 Article 39(d): Equal pay for equal work for both men and women.\n"
                            "📜 Article 39(e): Protection of workers' health and strength – especially women – ensuring they are not forced into unsuitable employment.\n\n"
                            "🔑 Practical Impact:\n"
                            "• Minimum wages apply equally to women.\n"
                            "• Night shift restrictions for women have been relaxed but with mandatory safety measures.\n"
                            "• MGNREGA guarantees 100 days of work to women equally.\n\n"
                            "💡 While Directive Principles are not enforceable in court directly, the Supreme Court often reads them alongside Fundamental Rights to deliver justice."
                        ),
                    },
                    {
                        "title": "Article 42 – Maternity Relief",
                        "image": "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
                        "videos": [
                            {"title": "Maternity Benefit Act 2017 - 26 Weeks Paid Leave", "url": "https://www.youtube.com/watch?v=CtPUnf95DXY"},
                        ],
                        "links": [
                            {"title": "Maternity Benefit Act 2017 – Full Text", "url": "https://labour.gov.in/whatsnew/maternity-benefit-amendment-act2017"},
                            {"title": "ESI Maternity Benefits", "url": "https://www.esic.nic.in/maternity-benefit"},
                        ],
                        "content": (
                            "Article 42 directs the State to make provision for securing just and humane conditions of work and maternity relief.\n\n"
                            "🔑 What You Get:\n"
                            "• 26 weeks of paid maternity leave for the first two children (Maternity Benefit Act, 2017).\n"
                            "• 12 weeks for the third child onwards.\n"
                            "• Adoptive and commissioning mothers get 12 weeks of leave.\n"
                            "• Crèche facility is mandatory in establishments with 50+ employees.\n"
                            "• Work-from-home option must be provided where possible.\n\n"
                            "📌 Important: You cannot be dismissed or have your pay reduced during maternity leave. This is a criminal offense by the employer.\n\n"
                            "💡 Even if you are a contractual or temporary worker, maternity benefits apply if you've worked for at least 80 days in the past 12 months."
                        ),
                    },
                ],
            },
            {
                "title": "Right to Life & Personal Liberty",
                "subTopics": [
                    {
                        "title": "Article 21 – Right to Life with Dignity",
                        "image": "https://images.unsplash.com/photo-1591184510259-bfbe03c1e6a0?w=600&q=80",
                        "videos": [
                            {"title": "India's Fundamental Rights Explained", "url": "https://www.youtube.com/watch?v=r6V29cE4Cjg"},
                            {"title": "Right to Equality - Fundamental Rights", "url": "https://www.youtube.com/watch?v=xI0rEKEDY28"},
                        ],
                        "links": [
                            {"title": "Article 21 – Expanded Rights", "url": "https://www.constitutionofindia.net/articles/article-21-protection-of-life-and-personal-liberty/"},
                            {"title": "Medical Termination of Pregnancy Act", "url": "https://main.mohfw.gov.in/acts-rules-and-standards-health-sector/acts/mtp-act-1971"},
                        ],
                        "content": (
                            "Article 21 states: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.'\n\n"
                            "The Supreme Court has expanded this to include:\n"
                            "🔑 Right to live with dignity – freedom from exploitation, trafficking, and forced prostitution.\n"
                            "🔑 Right to privacy – includes reproductive choices, decisions about marriage, and bodily autonomy.\n"
                            "🔑 Right to health – access to maternal healthcare, safe abortion (Medical Termination of Pregnancy Act).\n"
                            "🔑 Right to shelter – single women and abandoned wives have a right to accommodation.\n\n"
                            "📌 Landmark Cases:\n"
                            "• Justice K.S. Puttaswamy v. Union of India (2017) – Right to Privacy is a fundamental right.\n"
                            "• Suchita Srivastava v. Chandigarh Administration (2009) – A woman's right to make reproductive choices is part of personal liberty.\n"
                            "• Laxmi v. Union of India (2014) – Acid attack victims must receive free medical treatment; sale of acid restricted.\n\n"
                            "💡 Article 21 is the most powerful weapon for women's rights – it has been used to address everything from domestic violence to workplace harassment."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 2 – WOMEN'S PERSONAL & FAMILY LAW
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-02",
        "title": "Women's Rights in Marriage, Divorce & Family",
        "description": "Understand your legal rights in marriage, divorce, maintenance, child custody, and protection against dowry harassment.",
        "icon": "bi-heart-fill",
        "color": "#ec4899",
        "image": "https://images.unsplash.com/photo-1516589178581-6cd7ca1e6c1e?w=800&q=80",
        "topics": [
            {
                "title": "Marriage Rights",
                "subTopics": [
                    {
                        "title": "Legal Age & Consent for Marriage",
                        "image": "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&q=80",
                        "videos": [
                            {"title": "SC Guidelines to Combat Child Marriage in India", "url": "https://www.youtube.com/watch?v=ySGndLygS6I"},
                        ],
                        "links": [
                            {"title": "Prohibition of Child Marriage Act 2006", "url": "https://wcd.nic.in/acts/prohibition-child-marriage-act-2006"},
                            {"title": "Childline India – 1098", "url": "https://www.childlineindia.org/"},
                        ],
                        "content": (
                            "📜 The Prohibition of Child Marriage Act, 2006:\n"
                            "• Minimum age: 18 years for women, 21 years for men.\n"
                            "• Child marriage is VOIDABLE (can be annulled) at the option of the minor.\n"
                            "• Punishment: Up to 2 years imprisonment and ₹1 lakh fine for anyone who performs, promotes, or abets child marriage.\n\n"
                            "🔑 Key Rights:\n"
                            "• No woman can be forced into marriage. Forced marriage is a criminal offense.\n"
                            "• A girl married below 18 can seek annulment up to 2 years after reaching 18.\n"
                            "• She is entitled to maintenance until remarriage even after annulment.\n"
                            "• Any children from a void/voidable marriage are legitimate.\n\n"
                            "📌 Important 2023 Update: The Supreme Court discussed raising the minimum age for women to 21 (Prohibition of Child Marriage Amendment Bill). Currently still 18.\n\n"
                            "💡 Helpline: If you know of a child marriage, call 1098 (Childline) or 181 (Women Helpline)."
                        ),
                    },
                    {
                        "title": "Dowry Prohibition & Anti-Dowry Laws",
                        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
                        "videos": [
                            {"title": "498A IPC Explained - Dowry Law", "url": "https://www.youtube.com/watch?v=ZBBOkCHNNVQ"},
                            {"title": "Section 498A Explained - Protecting Women from Cruelty", "url": "https://www.youtube.com/watch?v=Xad3Wx2BjnU"},
                        ],
                        "links": [
                            {"title": "Dowry Prohibition Act 1961", "url": "https://wcd.nic.in/act/dowry-prohibition-act-1961"},
                            {"title": "NCW Complaint Portal", "url": "http://ncwapps.nic.in/onlinecomplaint/"},
                        ],
                        "content": (
                            "📜 The Dowry Prohibition Act, 1961 (amended 1986):\n"
                            "• Giving, taking, or demanding dowry is a criminal offense.\n"
                            "• Punishment: Minimum 5 years imprisonment and fine of ₹15,000 or amount of dowry.\n"
                            "• Even indirect demands ('hints' about gifts, car, house) count as dowry demand.\n\n"
                            "📜 Section 498A IPC (now BNS Section 85):\n"
                            "• Cruelty by husband or his relatives to a woman for dowry is a cognizable, non-bailable, non-compoundable offense.\n"
                            "• Includes physical and mental cruelty, harassment for dowry demands.\n\n"
                            "📜 Section 304B IPC – Dowry Death:\n"
                            "• If a woman dies within 7 years of marriage under unnatural circumstances and was subjected to dowry harassment, it is treated as dowry death.\n"
                            "• Minimum 7 years to life imprisonment for the husband/relatives.\n\n"
                            "🔑 How to Report:\n"
                            "• File an FIR at the nearest police station.\n"
                            "• Contact the National Commission for Women: 7827-170-170.\n"
                            "• Approach a Protection Officer under the DV Act."
                        ),
                    },
                ],
            },
            {
                "title": "Divorce & Maintenance Rights",
                "subTopics": [
                    {
                        "title": "Grounds for Divorce & How to File",
                        "image": "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=600&q=80",
                        "videos": [
                            {"title": "Divorce, Maintenance and Child Custody Explained", "url": "https://www.youtube.com/watch?v=WPQlT7XR2R8"},
                        ],
                        "links": [
                            {"title": "Hindu Marriage Act 1955", "url": "https://legislative.gov.in/actsofparliamentfromtheyear/hindu-marriage-act-1955"},
                            {"title": "Special Marriage Act 1954", "url": "https://legislative.gov.in/actsofparliamentfromtheyear/special-marriage-act-1954"},
                        ],
                        "content": (
                            "Women can file for divorce under:\n\n"
                            "📜 Hindu Marriage Act, 1955 (for Hindus, Buddhists, Sikhs, Jains):\n"
                            "Grounds: Cruelty, desertion (2+ years), adultery, conversion, mental disorder, communicable disease, renunciation, presumption of death (7+ years).\n"
                            "Special ground for wife: Husband's bigamy or rape/sodomy.\n\n"
                            "📜 Muslim Personal Law:\n"
                            "• Talaq-e-Tafweez: Wife's delegated right of divorce.\n"
                            "• Khula: Wife seeks divorce by returning mehr.\n"
                            "• Muslim Women (Protection of Rights on Divorce) Act, 1986.\n"
                            "• Triple Talaq declared unconstitutional (Shayara Bano v. Union of India, 2017).\n\n"
                            "📜 Special Marriage Act, 1954 (for inter-faith/civil marriages):\n"
                            "Same grounds as Hindu Marriage Act.\n\n"
                            "📜 Mutual Consent Divorce: Available to ALL – both parties agree, minimum 6 months cooling-off period (can be waived by court).\n\n"
                            "💡 You DO NOT need your husband's permission or cooperation to file for divorce. A woman can file unilaterally."
                        ),
                    },
                    {
                        "title": "Right to Maintenance & Alimony",
                        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
                        "videos": [
                            {"title": "Maintenance Rules for Divorced Wife - India", "url": "https://www.youtube.com/watch?v=30xnYw6HeDo"},
                        ],
                        "links": [
                            {"title": "Section 125 CrPC – Maintenance", "url": "https://devgan.in/crpc/section/125/"},
                            {"title": "Free Legal Aid – NALSA", "url": "https://nalsa.gov.in/"},
                        ],
                        "content": (
                            "Every woman has a right to financial support from her husband:\n\n"
                            "📜 Section 125 CrPC (now BNSS Section 144) – Maintenance:\n"
                            "• Available to ALL women regardless of religion.\n"
                            "• Wife, children, and elderly parents can claim maintenance.\n"
                            "• Magistrate decides the amount based on husband's income.\n"
                            "• Interim (temporary) maintenance is available during the case.\n\n"
                            "📜 Hindu Adoption and Maintenance Act, 1956:\n"
                            "• Wife can claim maintenance even while living separately if husband is guilty of cruelty, desertion, bigamy, or has an STD.\n\n"
                            "📜 Muslim Women (Protection of Rights on Marriage) Act, 2019:\n"
                            "• Right to subsistence allowance during iddat period and beyond.\n"
                            "• Right to mehr (dower) amount.\n\n"
                            "🔑 Key Points:\n"
                            "• Maintenance continues until wife remarries or can sustain herself.\n"
                            "• Even a working woman can claim maintenance if her income is substantially less.\n"
                            "• Non-payment of maintenance can lead to arrest and imprisonment.\n"
                            "• Children's maintenance includes education, medical expenses, and food.\n\n"
                            "💡 You can file for maintenance from the place where YOU live — you don't need to go to your husband's city/town."
                        ),
                    },
                    {
                        "title": "Child Custody Rights",
                        "image": "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80",
                        "videos": [
                            {"title": "Child Marriage Prohibition Act 2006", "url": "https://www.youtube.com/watch?v=YvgMO7vuAu8"},
                        ],
                        "links": [
                            {"title": "Guardians and Wards Act 1890", "url": "https://legislative.gov.in/actsofparliamentfromtheyear/guardians-and-wards-act-1890"},
                        ],
                        "content": (
                            "📜 The Guardians and Wards Act, 1890 and Hindu Minority and Guardianship Act, 1956:\n\n"
                            "🔑 General Rules:\n"
                            "• Children below 5 years: Mother is usually given custody.\n"
                            "• The 'welfare of the child' is the paramount consideration – not the parent's desires.\n"
                            "• Court considers: child's age, emotional bond, financial ability, moral character of parents, and child's preference (if old enough).\n\n"
                            "📌 Types of Custody:\n"
                            "• Physical Custody – where the child lives.\n"
                            "• Legal Custody – who makes decisions about education, health, etc.\n"
                            "• Joint Custody – both parents share responsibilities.\n"
                            "• Visitation Rights – non-custodial parent's right to meet the child.\n\n"
                            "🔑 Mother's Rights:\n"
                            "• A mother can NEVER be denied visitation rights.\n"
                            "• Even an unwed mother has full custody rights.\n"
                            "• If the father is abusive, custody will almost always go to the mother.\n"
                            "• The mother's financial status alone cannot be a reason to deny custody.\n\n"
                            "💡 The court always prioritizes the child's best interest. Document everything – school records, medical visits, daily care – as evidence of your involvement."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 3 – SAFETY & PROTECTION FROM VIOLENCE
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-03",
        "title": "Safety & Protection from Violence",
        "description": "Comprehensive guide to laws protecting women from domestic violence, sexual harassment, stalking, acid attacks, and cyber crimes.",
        "icon": "bi-shield-fill-check",
        "color": "#ef4444",
        "image": "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80",
        "topics": [
            {
                "title": "Domestic Violence Act, 2005",
                "subTopics": [
                    {
                        "title": "What is Domestic Violence?",
                        "image": "https://images.unsplash.com/photo-1590650046871-92c51f0cb463?w=600&q=80",
                        "videos": [
                            {"title": "Domestic Violence Act 2005 - Legal Rights Every Woman Should Know", "url": "https://www.youtube.com/watch?v=tttleMWhVp0"},
                        ],
                        "links": [
                            {"title": "DV Act 2005 – Full Text", "url": "https://wcd.nic.in/act/protection-women-domestic-violence-act-2005"},
                            {"title": "One Stop Centre Scheme", "url": "https://wcd.nic.in/schemes/one-stop-centre-scheme-1"},
                        ],
                        "content": (
                            "📜 The Protection of Women from Domestic Violence Act, 2005 (PWDVA)\n\n"
                            "Domestic violence includes ANY act that:\n"
                            "🔴 Physical Abuse: Hitting, slapping, kicking, burning, using weapons, or any physical force.\n"
                            "🔴 Sexual Abuse: Forced intercourse, degrading sexual acts, forcing pornography on women.\n"
                            "🔴 Verbal & Emotional Abuse: Name-calling, insults, humiliation, threats, isolation from family/friends, not allowing work.\n"
                            "🔴 Economic Abuse: Not providing money for basic needs, controlling finances, denying access to money, taking away earnings.\n\n"
                            "🔑 Who Can File:\n"
                            "• Wife or live-in partner\n"
                            "• Mother, daughter, or sister living in the household\n"
                            "• Any woman in a domestic relationship (including daughter-in-law)\n\n"
                            "🔑 Against Whom:\n"
                            "• Husband or male live-in partner\n"
                            "• His relatives (mother-in-law, father-in-law, brother-in-law, etc.)\n\n"
                            "📌 You Don't Need to File an FIR First! You can directly approach the Magistrate or Protection Officer.\n\n"
                            "💡 Important: Even a SINGLE incident of violence is enough to file a complaint. You don't need to 'prove a pattern.'"
                        ),
                    },
                    {
                        "title": "How to File & What Protection You Get",
                        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
                        "videos": [
                            {"title": "Domestic Violence Act 2005 - Filing Process", "url": "https://www.youtube.com/watch?v=PqpyGxk9rks"},
                        ],
                        "links": [
                            {"title": "Women Helpline 181", "url": "https://www.india.gov.in/information-women-helpline"},
                            {"title": "NCW Online Complaint", "url": "http://ncwapps.nic.in/onlinecomplaint/"},
                        ],
                        "content": (
                            "📋 Step-by-Step Process:\n\n"
                            "Step 1: Contact a Protection Officer (available in every district) or call 181 Women Helpline.\n"
                            "Step 2: The Protection Officer will help you file a Domestic Incident Report (DIR).\n"
                            "Step 3: Application is filed before the Magistrate (no court fee needed).\n"
                            "Step 4: Court issues notice to the respondent; first hearing within 3 days.\n"
                            "Step 5: Final order within 60 days.\n\n"
                            "🛡️ Protection Orders You Can Get:\n"
                            "✅ Protection Order – Abuser cannot commit any act of violence.\n"
                            "✅ Residence Order – Right to live in the shared household; cannot be evicted.\n"
                            "✅ Monetary Relief – Medical expenses, loss of earnings, maintenance.\n"
                            "✅ Custody Order – Temporary custody of children.\n"
                            "✅ Compensation Order – For emotional distress and mental anguish.\n\n"
                            "📞 Emergency Help:\n"
                            "• Police: 100\n"
                            "• Women Helpline: 181\n"
                            "• NCW WhatsApp: 7827-170-170\n"
                            "• One Stop Centre (Sakhi): Available in every district\n\n"
                            "💡 If the abuser violates any protection order, it is a criminal offense punishable with up to 1 year imprisonment."
                        ),
                    },
                ],
            },
            {
                "title": "Sexual Harassment & Criminal Laws",
                "subTopics": [
                    {
                        "title": "POSH Act – Workplace Sexual Harassment",
                        "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
                        "videos": [
                            {"title": "POSH Act 2013 Full Explanation", "url": "https://www.youtube.com/watch?v=zyzvjxjfKkk"},
                        ],
                        "links": [
                            {"title": "POSH Act 2013 – Legal Text", "url": "https://legislative.gov.in/sites/default/files/A2013-14.pdf"},
                            {"title": "SHe-Box Complaint Portal", "url": "https://shebox.nic.in/"},
                        ],
                        "content": (
                            "📜 The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 – POSH Act\n\n"
                            "🔑 What Counts as Sexual Harassment:\n"
                            "• Physical contact and advances\n"
                            "• Demand or request for sexual favours\n"
                            "• Sexually coloured remarks\n"
                            "• Showing pornography\n"
                            "• Any other unwelcome sexual conduct (verbal, non-verbal, physical)\n\n"
                            "📋 Where to Complain:\n"
                            "• Internal Complaints Committee (ICC) – mandatory in every organization with 10+ employees.\n"
                            "• Local Complaints Committee (LCC) – for informal sector, domestic workers, small firms.\n\n"
                            "🔑 Your Rights:\n"
                            "• Complaint must be filed within 3 months (extendable by 3 months with reasons).\n"
                            "• Written complaint required (help is available for illiterate women).\n"
                            "• You can request transfer (your own or the accused's) during inquiry.\n"
                            "• Your identity will be kept confidential.\n"
                            "• Retaliation against you is a punishable offense.\n\n"
                            "📌 Penalty for Not Having ICC: ₹50,000 fine on the employer. On repeat: cancellation of business license.\n\n"
                            "💡 The POSH Act covers ALL women – full-time, part-time, temporary, contractual, intern, volunteer. Even women visiting a workplace are protected."
                        ),
                    },
                    {
                        "title": "Criminal Laws Against Sexual Offenses",
                        "image": "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&q=80",
                        "videos": [
                            {"title": "Offences Against Women under BNS 2023", "url": "https://www.youtube.com/watch?v=U-gwOuolQ7M"},
                        ],
                        "links": [
                            {"title": "Know Your Criminal Rights – India Code", "url": "https://www.indiacode.nic.in/"},
                            {"title": "National Crime Records Bureau", "url": "https://ncrb.gov.in/"},
                        ],
                        "content": (
                            "📜 Indian Penal Code (now BNS) provisions protecting women:\n\n"
                            "🔴 Rape (Section 375/376 IPC / Section 63-69 BNS):\n"
                            "• Minimum 7 years to life imprisonment; 10 years if victim is under 16.\n"
                            "• Marital rape exception exists (above age 18) but is being challenged.\n"
                            "• Identity of victim cannot be disclosed.\n\n"
                            "🔴 Stalking (Section 354D IPC / Section 78 BNS):\n"
                            "• Following a woman, contacting despite disinterest, monitoring internet usage.\n"
                            "• Up to 3 years imprisonment for first offense; 5 years for repeat.\n\n"
                            "🔴 Voyeurism (Section 354C IPC / Section 77 BNS):\n"
                            "• Watching/capturing images of a woman in private acts without consent.\n"
                            "• Up to 3 years for first offense; 7 years for repeat.\n\n"
                            "🔴 Acid Attack (Section 326A IPC / Section 124 BNS):\n"
                            "• Minimum 10 years to life imprisonment.\n"
                            "• Free medical treatment is a right.\n"
                            "• ₹3 lakh immediate compensation by State government.\n\n"
                            "📌 Filing Process: FIR is mandatory. Police MUST register FIR for cognizable offenses – refusal is itself a crime.\n\n"
                            "💡 You can file a Zero FIR – at ANY police station regardless of where the incident happened."
                        ),
                    },
                ],
            },
            {
                "title": "Cyber Safety for Women",
                "subTopics": [
                    {
                        "title": "Cyber Crime Laws & How to Report",
                        "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
                        "videos": [
                            {"title": "Cyber Safety for Women - Cyber Law India", "url": "https://www.youtube.com/watch?v=hD1igasuX4c"},
                        ],
                        "links": [
                            {"title": "Cyber Crime Portal – Report Online", "url": "https://cybercrime.gov.in/"},
                            {"title": "IT Act 2000 – Key Sections", "url": "https://www.meity.gov.in/content/information-technology-act-2000"},
                        ],
                        "content": (
                            "📜 IT Act, 2000 (amended 2008) + BNS provisions:\n\n"
                            "🔴 Cyber Stalking: Repeated online harassment, threatening messages, unwanted contact = up to 3 years imprisonment.\n"
                            "🔴 Morphing Photos: Creating/sharing fake images – up to 3 years and fine.\n"
                            "🔴 Revenge Porn: Sharing intimate images without consent – up to 5 years imprisonment.\n"
                            "🔴 Online Harassment: Abusive language, threats, trolling targeting gender = punishable offense.\n"
                            "🔴 Sextortion: Threatening to share photos/videos unless demands met = criminal extortion.\n\n"
                            "📋 How to Report:\n"
                            "• National Cyber Crime Portal: www.cybercrime.gov.in\n"
                            "• Cyber Crime Helpline: 1930\n"
                            "• File e-FIR at the portal or visit nearest Cyber Crime Cell.\n"
                            "• Take screenshots of EVERYTHING – messages, profiles, URLs.\n\n"
                            "🛡️ Safety Tips:\n"
                            "• Use strong, unique passwords for every account.\n"
                            "• Enable two-factor authentication.\n"
                            "• Don't share personal photos/information with strangers online.\n"
                            "• Check privacy settings on all social media.\n"
                            "• Block and report harassers immediately.\n\n"
                            "💡 You can report cyber crimes anonymously. Your identity is protected."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 4 – LABOUR & EMPLOYMENT RIGHTS
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-04",
        "title": "Labour & Employment Rights for Women",
        "description": "Know your workplace rights – equal pay, working hours, maternity benefits, safety laws, and protection against exploitation.",
        "icon": "bi-briefcase-fill",
        "color": "#f59e0b",
        "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
        "topics": [
            {
                "title": "Equal Pay & Working Conditions",
                "subTopics": [
                    {
                        "title": "Equal Remuneration Act & Code on Wages",
                        "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
                        "videos": [
                            {"title": "Equal Pay for Equal Work - Know Your Rights India", "url": "https://www.youtube.com/watch?v=LfQ1Uf4ske4"},
                        ],
                        "links": [
                            {"title": "Code on Wages 2019 – Full Text", "url": "https://labour.gov.in/code-wages-2019"},
                            {"title": "Labour Commissioner Portal", "url": "https://clc.gov.in/"},
                        ],
                        "content": (
                            "📜 The Equal Remuneration Act, 1976 (now subsumed under the Code on Wages, 2019):\n\n"
                            "🔑 Core Rights:\n"
                            "• No employer can pay a woman less than a man for the same work or work of similar nature.\n"
                            "• No discrimination in recruitment – cannot deny a job to a woman because of her gender.\n"
                            "• Violation: Up to ₹20,000 fine and 3 months imprisonment.\n\n"
                            "📜 Code on Wages, 2019 (new consolidated law):\n"
                            "• Gender-neutral definition: Prohibits discrimination in wages on grounds of gender for same work.\n"
                            "• Applies to ALL establishments – organized and unorganized sector.\n"
                            "• Floor wage set by Central Government – no state can go below it.\n\n"
                            "📌 If You're Being Paid Less:\n"
                            "1. Document your job description and compare with male colleagues.\n"
                            "2. Approach your ICC or HR department.\n"
                            "3. File a complaint with the Labour Commissioner.\n"
                            "4. File a case in the Labour Court.\n\n"
                            "💡 Even domestic workers, agricultural workers, and self-employed women are covered under the Code on Wages."
                        ),
                    },
                    {
                        "title": "Working Hours, Night Shifts & Safety",
                        "image": "https://images.unsplash.com/photo-1504384764586-bb4cee aecf31?w=600&q=80",
                        "videos": [
                            {"title": "Labour Laws for Women in India", "url": "https://www.youtube.com/watch?v=9Z4oDg-gY6s"},
                        ],
                        "links": [
                            {"title": "Factories Act 1948", "url": "https://labour.gov.in/sites/default/files/factories_act_1948.pdf"},
                            {"title": "Occupational Safety Code 2020", "url": "https://labour.gov.in/code-occupational-safety-health-and-working-conditions-2020"},
                        ],
                        "content": (
                            "📜 Factories Act, 1948 & Occupational Safety Code, 2020:\n\n"
                            "🔑 Working Hours:\n"
                            "• Maximum 9 hours per day, 48 hours per week.\n"
                            "• Overtime must be paid at DOUBLE the regular rate.\n"
                            "• At least 30 minutes rest for every 5 hours of work.\n"
                            "• Weekly holiday (at least 1 day off per week) is mandatory.\n\n"
                            "🔑 Night Shifts:\n"
                            "• Women CAN now work night shifts (after 2023 amendments in many states).\n"
                            "• BUT employers MUST provide: safe transportation, security, CCTV, separate restrooms, women's helpdesk.\n"
                            "• Written consent from the woman is required.\n\n"
                            "🔑 Workplace Safety:\n"
                            "• Separate toilets and washing facilities for women.\n"
                            "• Crèche (childcare) mandatory if 50+ employees.\n"
                            "• First-aid and medical facilities on-site.\n"
                            "• No hazardous work unless safety provisions are met.\n\n"
                            "📌 Penalty: Employers violating these can face up to ₹2 lakh fine and imprisonment up to 6 months.\n\n"
                            "💡 These rights apply to factory workers, office employees, IT professionals, and even gig workers."
                        ),
                    },
                ],
            },
            {
                "title": "Maternity & Childcare Benefits",
                "subTopics": [
                    {
                        "title": "Maternity Benefit Act, 2017 – Complete Guide",
                        "image": "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80",
                        "videos": [
                            {"title": "Maternity Benefit Act 2017 - 26 Weeks Paid Leave", "url": "https://www.youtube.com/watch?v=CtPUnf95DXY"},
                        ],
                        "links": [
                            {"title": "Maternity Benefit Act 2017", "url": "https://labour.gov.in/whatsnew/maternity-benefit-amendment-act2017"},
                            {"title": "ESI Maternity Benefit", "url": "https://www.esic.nic.in/maternity-benefit"},
                        ],
                        "content": (
                            "📜 The Maternity Benefit (Amendment) Act, 2017:\n\n"
                            "🔑 Leave Entitlements:\n"
                            "• 26 weeks paid maternity leave for the first two children.\n"
                            "• 12 weeks for the third child onwards.\n"
                            "• 12 weeks for adoptive mothers (child below 3 months).\n"
                            "• 12 weeks for commissioning mothers (surrogacy).\n"
                            "• Miscarriage/MTP: 6 weeks leave from the date of miscarriage.\n"
                            "• Tubectomy: 2 weeks leave.\n\n"
                            "🔑 Other Benefits:\n"
                            "• Work-from-home option available after 26 weeks (if job permits).\n"
                            "• Two nursing breaks per day until the child is 15 months old.\n"
                            "• Crèche facility must be within 500 meters for establishments with 50+ employees.\n"
                            "• Mother allowed to visit crèche 4 times a day.\n\n"
                            "📌 Important Rules:\n"
                            "• You CANNOT be dismissed during maternity leave.\n"
                            "• If dismissed, employer must pay full salary for the leave period.\n"
                            "• Medical bonus of ₹3,500 if employer doesn't provide free medical care.\n"
                            "• No reduction in salary or conditions during or because of pregnancy.\n\n"
                            "📌 Eligibility: You must have worked at least 80 days in the 12 months before your expected delivery date.\n\n"
                            "💡 Even contractual, temporary, and part-time women workers are entitled to maternity benefits if they meet the 80-day threshold."
                        ),
                    },
                ],
            },
            {
                "title": "Unorganized & Domestic Workers",
                "subTopics": [
                    {
                        "title": "Rights of Domestic Workers & Informal Sector",
                        "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
                        "videos": [
                            {"title": "Government Schemes For Women In India", "url": "https://www.youtube.com/watch?v=kajAiXvPBL4"},
                        ],
                        "links": [
                            {"title": "e-Shram Portal – Register Now", "url": "https://eshram.gov.in/"},
                            {"title": "Unorganised Workers Social Security Act", "url": "https://labour.gov.in/sites/default/files/TheUnorganisedWorkersSocialSecurityAct2008.pdf"},
                        ],
                        "content": (
                            "📜 The Unorganised Workers' Social Security Act, 2008 + relevant state laws:\n\n"
                            "🔑 Who Are Unorganized Workers:\n"
                            "• Domestic helpers (maids, cooks, nannies)\n"
                            "• Agricultural labourers\n"
                            "• Street vendors\n"
                            "• Home-based workers (beedi rolling, tailoring)\n"
                            "• Construction workers\n\n"
                            "🔑 Your Rights:\n"
                            "• Minimum wage – even domestic workers are covered in many states.\n"
                            "• No physical/sexual abuse by employer – criminal offense.\n"
                            "• Weekly day off.\n"
                            "• Social security benefits: insurance, pension, maternity benefit.\n\n"
                            "📜 e-Shram Card (www.eshram.gov.in):\n"
                            "• Free registration for all unorganized workers.\n"
                            "• Accident insurance of ₹2 lakh (death) and ₹1 lakh (partial disability).\n"
                            "• Access to government welfare schemes.\n"
                            "• Can be linked to Aadhaar – no documents needed.\n\n"
                            "📌 State-Level Protections:\n"
                            "• Kerala, Tamil Nadu, Karnataka, Maharashtra have specific Domestic Workers' Welfare Boards.\n"
                            "• Minimum wages for domestic workers range from ₹4,000 to ₹15,000/month depending on the state.\n\n"
                            "💡 Register on e-Shram portal (free) to access all government benefits – over 2.8 crore women have already registered."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 5 – PROPERTY & INHERITANCE RIGHTS
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-05",
        "title": "Property & Inheritance Rights",
        "description": "Learn about women's legal rights to property, inheritance, ancestral land, and financial assets under Indian law.",
        "icon": "bi-house-fill",
        "color": "#10b981",
        "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
        "topics": [
            {
                "title": "Hindu Succession Act & Inheritance",
                "subTopics": [
                    {
                        "title": "Equal Rights as Coparcener (2005 Amendment)",
                        "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
                        "videos": [
                            {"title": "Daughter's Rights Under Hindu Succession Act", "url": "https://www.youtube.com/watch?v=rSHHBxFUmsQ"},
                        ],
                        "links": [
                            {"title": "Hindu Succession Act 1956 (Amended 2005)", "url": "https://legislative.gov.in/actsofparliamentfromtheyear/hindu-succession-act-1956"},
                            {"title": "Vineeta Sharma Judgment – Full Text", "url": "https://main.sci.gov.in/supremecourt/2018/32601/32601_2018_33_1501_23388_Judgement_11-Aug-2020.pdf"},
                        ],
                        "content": (
                            "📜 The Hindu Succession (Amendment) Act, 2005:\n\n"
                            "This landmark amendment gave daughters EQUAL rights as sons in ancestral (coparcenary) property.\n\n"
                            "🔑 What Changed:\n"
                            "Before 2005: Only sons were coparceners (had birthright in Hindu undivided family property).\n"
                            "After 2005: Daughters have the SAME rights by birth – whether married or unmarried.\n\n"
                            "🔑 Your Rights:\n"
                            "• Equal share in father's ancestral property as any son.\n"
                            "• Right to become Karta (head) of the Hindu Undivided Family.\n"
                            "• Right to demand partition of ancestral property.\n"
                            "• These rights apply even if the father died before 2005 (Supreme Court ruling, 2020).\n\n"
                            "📌 Vineeta Sharma v. Rakesh Sharma (2020): Supreme Court confirmed daughters have EQUAL coparcenary rights by birth, regardless of whether the father was alive on September 9, 2005.\n\n"
                            "📌 Self-Acquired vs Ancestral:\n"
                            "• Ancestral property: Equal right by birth.\n"
                            "• Father's self-acquired property: Father can will it to anyone, but if he dies without a will, daughter gets equal share.\n\n"
                            "💡 If your family refuses your share: File a partition suit in the Civil Court. Legal aid is free for women through DLSA."
                        ),
                    },
                    {
                        "title": "Women's Right to Marital Property",
                        "image": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80",
                        "videos": [
                            {"title": "Women's Property Rights in Indian Law", "url": "https://www.youtube.com/watch?v=hZsoDS13sr8"},
                        ],
                        "links": [
                            {"title": "Streedhan – Legal Framework", "url": "https://www.legalserviceindia.com/legal/article-3014-streedhan-rights.html"},
                        ],
                        "content": (
                            "🔑 Right to Matrimonial Home:\n"
                            "• A wife has an absolute right to reside in the matrimonial home – even if it's in the husband's name.\n"
                            "• She CANNOT be evicted from the shared household under the DV Act.\n"
                            "• This right continues even after separation/divorce until a court order.\n\n"
                            "📜 Streedhan – What Belongs to the Wife:\n"
                            "Streedhan includes ALL gifts/assets given to a woman:\n"
                            "• Before marriage (engagement gifts)\n"
                            "• At the time of marriage (wedding gifts from both sides)\n"
                            "• After marriage (gifts from any source)\n"
                            "• Gold, jewelry, cash, property, investments in her name\n\n"
                            "🔑 Important: Streedhan is HER absolute property. Husband or in-laws who take/misuse streedhan commit criminal breach of trust (Section 406 IPC).\n\n"
                            "📌 Supreme Court on Streedhan:\n"
                            "'Husband has no right/control over streedhan. He can use it during distress but MUST return it.' – Pratibha Rani v. Suraj Kumar (1985)\n\n"
                            "💡 Keep a separate list of all your streedhan with photographs and receipts. This is crucial evidence in case of disputes."
                        ),
                    },
                ],
            },
            {
                "title": "Property Rights for Muslim & Christian Women",
                "subTopics": [
                    {
                        "title": "Muslim Women's Property Rights",
                        "image": "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=600&q=80",
                        "videos": [
                            {"title": "Daughters Now Have Equal Property Rights - Hindu Succession Act 2005", "url": "https://www.youtube.com/watch?v=t680XAnXY0U"},
                        ],
                        "links": [
                            {"title": "Muslim Women Protection Act 2019", "url": "https://legislative.gov.in/actsofparliamentfromtheyear/muslim-women-protection-rights-marriage-act-2019"},
                        ],
                        "content": (
                            "📜 Under Muslim Personal Law (Shariat Application Act, 1937):\n\n"
                            "🔑 Inheritance Rules:\n"
                            "• Daughter gets HALF the share of a son.\n"
                            "• Wife gets 1/8th of husband's property if there are children; 1/4th if no children.\n"
                            "• Mother gets 1/6th of deceased son's property.\n\n"
                            "🔑 Mehr (Dower):\n"
                            "• Mehr is the wife's absolute right – payable by husband at the time of marriage or on demand.\n"
                            "• Two types: Prompt Mehr (payable on demand) and Deferred Mehr (payable on divorce or death).\n"
                            "• Wife can refuse to live with husband until prompt mehr is paid.\n"
                            "• Mehr cannot be waived – any agreement to waive it is void.\n\n"
                            "📌 Muslim Women (Protection of Rights on Marriage) Act, 2019:\n"
                            "• Triple Talaq is now a criminal offense – 3 years imprisonment.\n"
                            "• Wife entitled to maintenance for herself and children.\n\n"
                            "💡 Muslim women can also seek maintenance under Section 125 CrPC (Danial Latifi v. Union of India, 2001) – this overrides the Shah Bano controversy."
                        ),
                    },
                    {
                        "title": "Christian & Parsi Women's Property Rights",
                        "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
                        "videos": [
                            {"title": "Do Daughters Have Equal Rights in Ancestral Property", "url": "https://www.youtube.com/watch?v=F4bIMDTZQ3k"},
                        ],
                        "links": [
                            {"title": "Indian Succession Act 1925", "url": "https://legislative.gov.in/actsofparliamentfromtheyear/indian-succession-act-1925"},
                        ],
                        "content": (
                            "📜 Indian Succession Act, 1925 (applicable to Christians, Parsis, and others):\n\n"
                            "🔑 Christian Women:\n"
                            "• If husband dies without a will: Wife gets 1/3rd, children get 2/3rd.\n"
                            "• If no children: Wife gets 1/2, rest goes to husband's relatives.\n"
                            "• If father dies without a will: Daughter and son get equal shares.\n"
                            "• Indian Divorce Act allows wife to claim permanent alimony.\n\n"
                            "🔑 Parsi Women:\n"
                            "• Parsi women get equal share in inheritance as men.\n"
                            "• If a Parsi woman marries outside the community, she earlier lost inheritance rights – this has been challenged.\n\n"
                            "📌 Special Marriage Act Marriages:\n"
                            "• Governed by Indian Succession Act.\n"
                            "• Both husband and wife have equal inheritance rights.\n"
                            "• No religious personal law applies.\n\n"
                            "💡 Regardless of religion, all women can NOW hold property in their own name, open bank accounts, and manage their own finances independently."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 6 – GOVERNMENT SCHEMES & WELFARE
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-06",
        "title": "Government Schemes & Financial Support",
        "description": "Comprehensive guide to all major central and state government schemes providing financial help, education, health, and empowerment for women.",
        "icon": "bi-award-fill",
        "color": "#06b6d4",
        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
        "topics": [
            {
                "title": "Financial Empowerment Schemes",
                "subTopics": [
                    {
                        "title": "Pradhan Mantri Jan Dhan Yojana & Financial Inclusion",
                        "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
                        "videos": [
                            {"title": "Sukanya Samriddhi Yojana and Women Schemes Explained", "url": "https://www.youtube.com/watch?v=F5Ma9XDCUuY"},
                            {"title": "Sukanya Samriddhi Yojana 2024 - SSY Scheme", "url": "https://www.youtube.com/watch?v=FKcs2Wa87_g"},
                        ],
                        "links": [
                            {"title": "PM Jan Dhan Yojana Official", "url": "https://pmjdy.gov.in/"},
                            {"title": "Mudra Yojana Portal", "url": "https://www.mudra.org.in/"},
                            {"title": "Stand Up India Scheme", "url": "https://www.standupmitra.in/"},
                        ],
                        "content": (
                            "📜 PM Jan Dhan Yojana (PMJDY) – Bank Account for Every Woman:\n\n"
                            "🔑 Benefits:\n"
                            "• Zero balance bank account at any bank.\n"
                            "• Free RuPay debit card.\n"
                            "• Accident insurance cover of ₹2 lakh.\n"
                            "• Life insurance cover of ₹30,000 (for accounts opened before Jan 2015).\n"
                            "• Overdraft facility up to ₹10,000 (after 6 months of satisfactory operation).\n"
                            "• Direct Benefit Transfer (DBT) – government benefits credited directly.\n\n"
                            "📜 Pradhan Mantri Mudra Yojana (PMMY) – Loans for Women Entrepreneurs:\n"
                            "• Shishu: Up to ₹50,000 (for starting a business).\n"
                            "• Kishore: ₹50,000 to ₹5 lakh (for growing businesses).\n"
                            "• Tarun: ₹5 lakh to ₹10 lakh (for established businesses).\n"
                            "• NO collateral or guarantor needed.\n"
                            "• Women get priority – over 70% of Mudra loans go to women.\n\n"
                            "📜 Stand Up India Scheme:\n"
                            "• Loan between ₹10 lakh to ₹1 crore for SC/ST and women entrepreneurs.\n"
                            "• For setting up greenfield (new) enterprises in manufacturing, services, or trading.\n\n"
                            "💡 Apply for Mudra loans at any bank branch or through www.mudra.org.in – no middlemen needed."
                        ),
                    },
                    {
                        "title": "Sukanya Samriddhi & Girl Child Welfare",
                        "image": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
                        "videos": [
                            {"title": "Sukanya Samriddhi Yojana 2025 Complete Guide", "url": "https://www.youtube.com/watch?v=JJNISc-HvQs"},
                        ],
                        "links": [
                            {"title": "Sukanya Samriddhi Yojana", "url": "https://www.india.gov.in/sukanya-samriddhi-yojna"},
                            {"title": "Beti Bachao Beti Padhao", "url": "https://wcd.nic.in/bbbp-schemes"},
                        ],
                        "content": (
                            "📜 Sukanya Samriddhi Yojana (SSY):\n\n"
                            "🔑 Features:\n"
                            "• Savings account for girl child (ages 0-10 years).\n"
                            "• Current interest rate: 8.2% (one of the highest government rates).\n"
                            "• Minimum deposit: ₹250/year; Maximum: ₹1.5 lakh/year.\n"
                            "• Tax benefits under Section 80C (up to ₹1.5 lakh deduction).\n"
                            "• Maturity at age 21; partial withdrawal at 18 for marriage/education.\n"
                            "• Open at any post office or designated bank.\n\n"
                            "📜 Beti Bachao, Beti Padhao (BBBP):\n"
                            "• National campaign for girl child survival, protection, and education.\n"
                            "• Focus: improving child sex ratio, education enrollment, and menstrual hygiene.\n"
                            "• Free education support in government schools.\n\n"
                            "📜 CBSE Udaan Scheme:\n"
                            "• Free online classes for girls in Class 11-12 (Science & Math).\n"
                            "• Preparation for IIT-JEE entrance.\n"
                            "• Free study materials and mentoring.\n\n"
                            "💡 Start a Sukanya Samriddhi account with just ₹250 – over ₹15 lakh at maturity if ₹1.5 lakh deposited yearly."
                        ),
                    },
                ],
            },
            {
                "title": "Health & Safety Schemes",
                "subTopics": [
                    {
                        "title": "Ayushman Bharat & Maternal Health",
                        "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
                        "videos": [
                            {"title": "Sukanya Samriddhi Yojana - Secure Future for Girl Child", "url": "https://www.youtube.com/watch?v=phR091RTwqY"},
                        ],
                        "links": [
                            {"title": "Ayushman Bharat – Check Eligibility", "url": "https://mera.pmjay.gov.in/"},
                            {"title": "PM Matru Vandana Yojana", "url": "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana"},
                            {"title": "Janani Suraksha Yojana", "url": "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309"},
                        ],
                        "content": (
                            "📜 Ayushman Bharat – PM Jan Arogya Yojana (PMJAY):\n\n"
                            "🔑 Benefits:\n"
                            "• Health insurance cover of ₹5 lakh/year per family.\n"
                            "• Covers 1,929 medical procedures including surgeries.\n"
                            "• Free treatment at any empaneled hospital – government or private.\n"
                            "• No age limit; covers pre-existing diseases from Day 1.\n"
                            "• Cashless and paperless treatment.\n\n"
                            "📜 Pradhan Mantri Matru Vandana Yojana (PMMVY):\n"
                            "• ₹5,000 direct cash transfer for pregnant and lactating women.\n"
                            "• For first live birth only.\n"
                            "• Paid in 3 installments.\n"
                            "• Eligibility: All pregnant women aged 19+ (except government employees).\n\n"
                            "📜 Janani Suraksha Yojana (JSY):\n"
                            "• Cash assistance for institutional delivery.\n"
                            "• Rural: ₹1,400; Urban: ₹1,000.\n"
                            "• Free ambulance service (108) for transportation to hospital.\n"
                            "• Free medicines and diet during hospital stay.\n\n"
                            "💡 Check if you're eligible for PMJAY at mera.pmjay.gov.in using your ration card or Aadhaar number."
                        ),
                    },
                ],
            },
            {
                "title": "Skill Development & Education",
                "subTopics": [
                    {
                        "title": "Training & Employment Schemes for Women",
                        "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
                        "videos": [
                            {"title": "Sukanya Samriddhi Yojana - Benefits and Rules", "url": "https://www.youtube.com/watch?v=le4jV2sv5PU"},
                        ],
                        "links": [
                            {"title": "NRLM / DAY – SHG Portal", "url": "https://nrlm.gov.in/"},
                            {"title": "PM Kaushal Vikas Yojana", "url": "https://www.pmkvyofficial.org/"},
                            {"title": "Working Women's Hostel Scheme", "url": "https://wcd.nic.in/schemes/working-womens-hostel"},
                        ],
                        "content": (
                            "📜 National Rural Livelihood Mission (NRLM) / DAY-NRLM:\n\n"
                            "🔑 Self Help Groups (SHGs):\n"
                            "• Form a group of 10-20 women.\n"
                            "• Regular savings of ₹10-100/week.\n"
                            "• Access to bank loans at low interest (4-7%).\n"
                            "• Training in livelihood activities – tailoring, food processing, handicrafts.\n"
                            "• Over 9 crore women already in SHGs across India.\n\n"
                            "📜 PM Kaushal Vikas Yojana (PMKVY):\n"
                            "• Free skill training in 40+ sectors.\n"
                            "• Includes: beauty, healthcare, electronics, fashion, retail, IT.\n"
                            "• Certificate recognized by government & industries.\n"
                            "• Stipend provided during training.\n"
                            "• Job placement assistance after certification.\n\n"
                            "📜 Support to Training & Employment Programme (STEP):\n"
                            "• Specifically for women aged 16+.\n"
                            "• Training in agriculture, food processing, handlooms, tailoring.\n"
                            "• Covers 10 traditional sectors.\n"
                            "• Financial assistance up to ₹5 lakh per training unit.\n\n"
                            "📜 Working Women's Hostel Scheme:\n"
                            "• Safe and affordable accommodation in cities for working women.\n"
                            "• With daycare facility for children under 18.\n"
                            "• Subsidized rent (much below market rates).\n\n"
                            "💡 Visit your nearest Aajeevika (NRLM) centre or call 1800-180-5115 (toll free) to join an SHG."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 7 – LEGAL AID & HOW TO ACCESS JUSTICE
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-07",
        "title": "Legal Aid & Access to Justice",
        "description": "Know how to access free legal help, file complaints, approach courts, and use helplines when your rights are violated.",
        "icon": "bi-megaphone-fill",
        "color": "#8b5cf6",
        "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
        "topics": [
            {
                "title": "Free Legal Aid",
                "subTopics": [
                    {
                        "title": "Right to Free Legal Aid – How to Get a Free Lawyer",
                        "image": "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&q=80",
                        "videos": [
                            {"title": "Breaking Barriers - How NALSA Offers Free Legal Support", "url": "https://www.youtube.com/watch?v=fTfmHiCBVdM"},
                        ],
                        "links": [
                            {"title": "NALSA – Free Legal Aid", "url": "https://nalsa.gov.in/"},
                            {"title": "Tele-Law – Free Legal Advice", "url": "https://tele-law.in/"},
                            {"title": "DLSA – Find Your District", "url": "https://nalsa.gov.in/slsa"},
                        ],
                        "content": (
                            "📜 Legal Services Authorities Act, 1987:\n\n"
                            "🔑 Who Can Get Free Legal Aid:\n"
                            "• ALL WOMEN – regardless of income (Section 12(c)).\n"
                            "• SC/ST members.\n"
                            "• Industrial workers.\n"
                            "• Persons with disabilities.\n"
                            "• Victims of trafficking.\n"
                            "• Persons earning less than ₹9,000/month (₹12,000 in some states).\n\n"
                            "📋 How to Get Free Legal Help:\n"
                            "1. Visit your District Legal Services Authority (DLSA).\n"
                            "2. Available in every district court complex.\n"
                            "3. Fill a simple application form.\n"
                            "4. A competent lawyer will be appointed free of cost.\n"
                            "5. All court fees are waived.\n\n"
                            "📜 Lok Adalat (People's Court):\n"
                            "• No court fee.\n"
                            "• Faster resolution through mediation.\n"
                            "• Held regularly in every district.\n"
                            "• Final – no appeal (in agreed settlements).\n"
                            "• Covers: matrimonial disputes, labour cases, motor accident claims, cheque bounce cases.\n\n"
                            "📌 NALSA Helpline: 15100 (toll-free)\n"
                            "📌 Tele-Law: Free legal advice via phone/video call at Common Service Centres.\n\n"
                            "💡 EVERY WOMAN in India is entitled to a FREE LAWYER – regardless of how much she earns."
                        ),
                    },
                ],
            },
            {
                "title": "Important Helplines & Resources",
                "subTopics": [
                    {
                        "title": "Emergency Helplines Every Woman Must Know",
                        "image": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&q=80",
                        "videos": [
                            {"title": "15100 NALSA Toll-Free Legal Helpline", "url": "https://www.youtube.com/watch?v=U73yn1S2T_E"},
                        ],
                        "links": [
                            {"title": "Women Helpline 181", "url": "https://www.india.gov.in/information-women-helpline"},
                            {"title": "NCW – National Commission for Women", "url": "http://ncw.nic.in/"},
                            {"title": "One Stop Centre Locator", "url": "https://wcd.nic.in/schemes/one-stop-centre-scheme-1"},
                        ],
                        "content": (
                            "📞 NATIONAL HELPLINES:\n\n"
                            "🔴 Police Emergency: 100\n"
                            "🔴 Women Helpline: 181 (24x7, free)\n"
                            "🔴 Domestic Violence Helpline: 181\n"
                            "🔴 NCW WhatsApp Helpline: 7827-170-170\n"
                            "🔴 Child Helpline: 1098 (for girls under 18)\n"
                            "🔴 Cyber Crime: 1930\n"
                            "🔴 Emergency Response: 112 (like USA's 911)\n"
                            "🔴 Legal Aid Helpline: 15100 (NALSA – free lawyer)\n"
                            "🔴 Ambulance: 108\n"
                            "🔴 Anti-Harassment (Railway): 182\n\n"
                            "📱 MOBILE APPS:\n"
                            "• Himmat Plus (Delhi Police) – SOS alert with location.\n"
                            "• Shake2Safety – shake phone to send SOS.\n"
                            "• My SafetiPin – rate area safety; find safe routes.\n"
                            "• NCW App – file complaints directly to National Commission for Women.\n"
                            "• Nirbhaya App (various state police).\n\n"
                            "🏢 ONE STOP CENTRES (Sakhi):\n"
                            "• Available in EVERY district (700+ centres nationwide).\n"
                            "• 24x7 service – medical aid, police, legal help, counselling, shelter.\n"
                            "• Free for all women affected by violence.\n"
                            "• Also provides temporary shelter (up to 5 days).\n"
                            "• Run by Ministry of Women and Child Development.\n\n"
                            "💡 Save 181, 112, and 7827-170-170 on speed dial. Share with every woman you know."
                        ),
                    },
                    {
                        "title": "How to File an FIR & Your Police Rights",
                        "image": "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=600&q=80",
                        "videos": [
                            {"title": "Free Legal Aid in India - Article 39A and NALSA", "url": "https://www.youtube.com/watch?v=N5n7BAddD-w"},
                        ],
                        "links": [
                            {"title": "e-FIR Portal (varies by state)", "url": "https://digitalpolice.gov.in/"},
                            {"title": "Know Your Police Rights", "url": "https://www.india.gov.in/topics/law-justice/police"},
                        ],
                        "content": (
                            "📋 Filing an FIR (First Information Report):\n\n"
                            "🔑 Your Rights When Filing an FIR:\n"
                            "• Police MUST register your FIR – refusal is a punishable offense (Section 166A IPC).\n"
                            "• You can file at ANY police station (Zero FIR) – it will be transferred later.\n"
                            "• You can file via email, registered post, or even WhatsApp in some states.\n"
                            "• You have the right to a FREE copy of the FIR.\n"
                            "• You MUST be informed about the progress of investigation.\n\n"
                            "📋 Step by Step:\n"
                            "1. Go to the nearest police station or Women's Help Desk.\n"
                            "2. Narrate the incident clearly; it will be written down by the SHO.\n"
                            "3. Read the FIR carefully before signing.\n"
                            "4. Get your FIR copy immediately – it's your legal right.\n"
                            "5. Note down the FIR number and investigating officer's name.\n\n"
                            "🔑 Special Rules for Women:\n"
                            "• Female complainant can record statement at her home or a place of her choice.\n"
                            "• If it's a sexual offense, statement must be recorded by a woman officer.\n"
                            "• Medical examination must be done by a woman doctor.\n"
                            "• Identity of rape victim CANNOT be disclosed in media.\n"
                            "• A woman cannot be arrested after sunset and before sunrise (except in exceptional cases by a woman officer).\n\n"
                            "📌 If Police Refuse FIR:\n"
                            "• Send a written complaint to the Superintendent of Police (SP).\n"
                            "• File a complaint with the Judicial Magistrate under Section 156(3) CrPC.\n"
                            "• Approach the State/National Human Rights Commission.\n\n"
                            "💡 Always keep two copies of your complaint. Take a witness when filing an FIR."
                        ),
                    },
                ],
            },
        ],
    },

    # ────────────────────────────────────────────────────────
    # MODULE 8 – SPECIAL TOPICS
    # ────────────────────────────────────────────────────────
    {
        "code": "MOD-08",
        "title": "Special Topics: Trafficking, NRI Marriages & More",
        "description": "Advanced legal knowledge on human trafficking, NRI marriage issues, and digital rights for women.",
        "icon": "bi-globe2",
        "color": "#f43f5e",
        "image": "https://images.unsplash.com/photo-1526958097901-5e6d742d3371?w=800&q=80",
        "topics": [
            {
                "title": "Human Trafficking & Bonded Labour",
                "subTopics": [
                    {
                        "title": "Laws Against Trafficking & How to Escape",
                        "image": "https://images.unsplash.com/photo-1590650046871-92c51f0cb463?w=600&q=80",
                        "videos": [
                            {"title": "Immoral Traffic Prevention Act 1956 Explained", "url": "https://www.youtube.com/watch?v=kahcLOXb8-Q"},
                        ],
                        "links": [
                            {"title": "Anti-Human Trafficking Portal", "url": "https://stophumantrafficking-mha.gov.in/"},
                            {"title": "Ujjawala Scheme", "url": "https://wcd.nic.in/schemes/ujjawala-comprehensive-scheme-prevention-trafficking-and-rescue-rehabilitation-and-re"},
                        ],
                        "content": (
                            "📜 Immoral Traffic (Prevention) Act, 1956 (ITPA) + IPC Sections 370-373 (BNS 141-144):\n\n"
                            "🔑 What is Human Trafficking:\n"
                            "• Any person recruited, transported, or harboured by force, fraud, or coercion for exploitation.\n"
                            "• Includes: forced prostitution, forced labor, domestic servitude, organ trafficking, forced begging, forced marriage.\n\n"
                            "🔑 Punishment:\n"
                            "• Trafficking of one person: 7-10 years + fine.\n"
                            "• Trafficking of more than one person: 10 years to life + fine.\n"
                            "• Trafficking of a minor: 10 years to life + fine.\n"
                            "• Trafficking for bonded labour: 3-5 years + ₹2 lakh fine.\n\n"
                            "📋 Where to Report:\n"
                            "• Anti-Trafficking Nodal Cell: State Police\n"
                            "• National Helpline: 1800-419-8588 (Childline Foundation)\n"
                            "• Missing Persons: trackthemissingchild.gov.in\n"
                            "• Anti-Human Trafficking Units (AHTUs) in every state.\n\n"
                            "🛡️ Victim Rehabilitation:\n"
                            "• Ujjawala Scheme: Provides shelter, food, medical care, legal aid, and vocational training.\n"
                            "• Swadhar Greh Scheme: Shelter homes for women in distress.\n"
                            "• Compensation: State victim compensation fund + Criminal Injuries Compensation.\n\n"
                            "💡 If you suspect someone is being trafficked, call 112 or 181 immediately. Even anonymous reports are acted upon."
                        ),
                    },
                ],
            },
            {
                "title": "NRI Marriage Issues",
                "subTopics": [
                    {
                        "title": "Protecting Women in NRI Marriages",
                        "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
                        "videos": [
                            {"title": "Anti Trafficking Bill - Prevention and Rehabilitation", "url": "https://www.youtube.com/watch?v=tG1X3ssaoUs"},
                        ],
                        "links": [
                            {"title": "MADAD Portal – NRI Help", "url": "https://madad.gov.in/"},
                            {"title": "NCW NRI Cell", "url": "http://ncw.nic.in/nri-cell"},
                        ],
                        "content": (
                            "📜 Registration of Marriage of NRI Bill + existing laws:\n\n"
                            "🔴 Common Problems:\n"
                            "• Husband abandons wife after marriage and goes abroad.\n"
                            "• Domestic violence in a foreign country with no support.\n"
                            "• Fraudulent marriages (husband already married abroad).\n"
                            "• Husband hides financial status or divorce from abroad.\n\n"
                            "🔑 Your Protections:\n"
                            "• All Indian criminal and family laws apply to NRI husbands.\n"
                            "• Indian courts have jurisdiction if the marriage was performed in India.\n"
                            "• Passport of NRI husband can be impounded by court.\n"
                            "• Look Out Circular (LOC) can be issued to prevent departure.\n"
                            "• Interpol Red Corner Notice can be issued for fugitive husbands.\n\n"
                            "📋 Before NRI Marriage:\n"
                            "1. Verify husband's background through Indian Embassy.\n"
                            "2. Register marriage under Indian law.\n"
                            "3. Keep copies of husband's passport, visa, and foreign ID.\n"
                            "4. Get details of his foreign address and employer.\n"
                            "5. Know the Indian Embassy contact in the destination country.\n\n"
                            "📌 NRI Commission: complaints@ncw.nic.in\n"
                            "📌 External Affairs Ministry NRI help: madad.gov.in\n\n"
                            "💡 ALWAYS register your marriage with the local registrar before going abroad – this is crucial evidence."
                        ),
                    },
                ],
            },
            {
                "title": "Emerging Rights & Digital Era",
                "subTopics": [
                    {
                        "title": "Women's Digital Rights & Financial Independence",
                        "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
                        "videos": [
                            {"title": "National Legal Services Authority - Free Legal Aid", "url": "https://www.youtube.com/watch?v=AEKDVJ7kA8Q"},
                        ],
                        "links": [
                            {"title": "RTI Online Portal", "url": "https://rtionline.gov.in/"},
                            {"title": "PM SVANidhi Scheme", "url": "https://pmsvanidhi.mohua.gov.in/"},
                            {"title": "Women's Reservation Act 2023", "url": "https://loksabha.nic.in/"},
                        ],
                        "content": (
                            "🔑 Digital Empowerment for Women:\n\n"
                            "📜 Aadhaar & Digital Identity:\n"
                            "• Every woman has the right to her own Aadhaar card.\n"
                            "• Cannot be denied for lack of male guardian's documents.\n"
                            "• Required for: bank accounts, SIM cards, government schemes.\n\n"
                            "📜 Digital Financial Rights:\n"
                            "• Women can independently open bank accounts (no male co-signer needed).\n"
                            "• UPI/PhonePe/GPay: Women can manage their own finances digitally.\n"
                            "• PM SVANidhi: ₹10,000 loan for street vendors (many are women).\n"
                            "• Digital Saksharta Abhiyan: Free digital literacy training.\n\n"
                            "📜 Right to Information (RTI):\n"
                            "• Any woman can file RTI to check government decisions.\n"
                            "• Fee: Just ₹10 (free for BPL families).\n"
                            "• Can be filed online at rtionline.gov.in.\n"
                            "• Useful for checking: pension status, plot allocation, job applications.\n\n"
                            "📜 Electoral Rights:\n"
                            "• Equal right to vote and contest elections.\n"
                            "• 33% reservation in Panchayats and Municipal bodies.\n"
                            "• Women's Reservation Act, 2023: 33% seats reserved in Lok Sabha and State Assemblies (to be implemented after delimitation).\n\n"
                            "💡 Financial independence is the foundation of empowerment. Open your own bank account, learn UPI payments, and file your own income tax."
                        ),
                    },
                ],
            },
        ],
    },
]


def main():
    client = MongoClient(MONGODB_URI)
    db = client["learn-rights"]
    col = db["modules"]

    existing = col.count_documents({})
    if existing:
        ans = input(f"\n⚠️  {existing} modules already exist. Delete and re-seed? (y/N): ").strip().lower()
        if ans != "y":
            print("Aborted.")
            client.close()
            return
        col.delete_many({})
        print(f"🗑️  Deleted {existing} existing modules.\n")

    result = col.insert_many(MODULES)
    print(f"✅ Seeded {len(result.inserted_ids)} modules successfully!\n")
    for i, mid in enumerate(result.inserted_ids):
        m = MODULES[i]
        topics_count = len(m["topics"])
        subtopics_count = sum(len(t["subTopics"]) for t in m["topics"])
        print(f"  {m['code']} | {m['title']}")
        print(f"       {topics_count} topics, {subtopics_count} subtopics")

    client.close()
    print("\n🎉 Done! Restart the backend and refresh the frontend.")


if __name__ == "__main__":
    main()

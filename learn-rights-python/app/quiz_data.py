"""
Comprehensive quiz question bank for all 8 LearnRights modules.
Each module has 10 questions covering its topics. Quizzes pick 8 random
questions per attempt so each try feels fresh.
Keyed by module CODE (MOD-01 … MOD-08) for reliable matching.
"""

QUESTION_BANK = {

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-01  Fundamental Rights & Women in the Constitution
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-01": [
        {
            "question": "Which Article of the Indian Constitution guarantees equality before the law?",
            "options": ["Article 14", "Article 19", "Article 21", "Article 32"],
            "correctAnswer": 0,
        },
        {
            "question": "Article 15(3) allows the State to make special provisions for which group?",
            "options": ["Children only", "Women and children", "Scheduled Castes", "Senior citizens"],
            "correctAnswer": 1,
        },
        {
            "question": "Which Directive Principle directs the State to ensure equal pay for equal work for both men and women?",
            "options": ["Article 38", "Article 39(d)", "Article 41", "Article 44"],
            "correctAnswer": 1,
        },
        {
            "question": "Article 21 protects which fundamental right?",
            "options": ["Right to speech", "Right to life and personal liberty", "Right to property", "Right to vote"],
            "correctAnswer": 1,
        },
        {
            "question": "The Supreme Court held that the right to live with dignity includes protection from sexual harassment in which landmark case?",
            "options": ["Maneka Gandhi v. Union of India", "Vishaka v. State of Rajasthan", "Shah Bano case", "Indra Sawhney case"],
            "correctAnswer": 1,
        },
        {
            "question": "Which article prohibits discrimination on the basis of sex?",
            "options": ["Article 14", "Article 15", "Article 19", "Article 25"],
            "correctAnswer": 1,
        },
        {
            "question": "Article 16 guarantees equality of opportunity in matters of what?",
            "options": ["Education", "Public employment", "Property", "Trade"],
            "correctAnswer": 1,
        },
        {
            "question": "Which constitutional amendment reserved one-third of seats in local self-government for women?",
            "options": ["42nd Amendment", "73rd Amendment", "86th Amendment", "44th Amendment"],
            "correctAnswer": 1,
        },
        {
            "question": "Directive Principles of State Policy are found in which part of the Constitution?",
            "options": ["Part III", "Part IV", "Part V", "Part VI"],
            "correctAnswer": 1,
        },
        {
            "question": "Which article gives the right to constitutional remedies?",
            "options": ["Article 19", "Article 21", "Article 32", "Article 44"],
            "correctAnswer": 2,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-02  Women's Rights in Marriage, Divorce & Family
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-02": [
        {
            "question": "What is the minimum legal age of marriage for women in India?",
            "options": ["16 years", "18 years", "21 years", "25 years"],
            "correctAnswer": 1,
        },
        {
            "question": "Under which act can a woman seek maintenance from her husband after divorce?",
            "options": ["Dowry Prohibition Act", "Section 125 CrPC", "Hindu Marriage Act only", "Companies Act"],
            "correctAnswer": 1,
        },
        {
            "question": "Which act prohibits the practice of dowry in India?",
            "options": ["Dowry Prohibition Act, 1961", "Hindu Marriage Act, 1955", "Special Marriage Act, 1954", "Indian Penal Code, 1860"],
            "correctAnswer": 0,
        },
        {
            "question": "A child marriage in India is one where the girl is below what age?",
            "options": ["14 years", "16 years", "18 years", "21 years"],
            "correctAnswer": 2,
        },
        {
            "question": "Under Hindu Marriage Act, which of the following is NOT a ground for divorce?",
            "options": ["Cruelty", "Desertion for 2+ years", "Mutual consent", "Dowry amount too low"],
            "correctAnswer": 3,
        },
        {
            "question": "The Special Marriage Act, 1954 allows marriage between people of what?",
            "options": ["Same religion only", "Same caste only", "Different religions/castes", "Same state only"],
            "correctAnswer": 2,
        },
        {
            "question": "Muslim women's right to maintenance was upheld in which famous case?",
            "options": ["Vishaka case", "Shah Bano case", "Lata Singh case", "Mary Roy case"],
            "correctAnswer": 1,
        },
        {
            "question": "What is the mandatory cooling-off period for divorce by mutual consent under Hindu Marriage Act?",
            "options": ["3 months", "6 months", "1 year", "2 years"],
            "correctAnswer": 1,
        },
        {
            "question": "Which act specifically deals with the prohibition of child marriages?",
            "options": ["Hindu Marriage Act", "Prohibition of Child Marriage Act, 2006", "Special Marriage Act", "Juvenile Justice Act"],
            "correctAnswer": 1,
        },
        {
            "question": "A woman married under Hindu law has the right to reside in the shared household. This right is protected under?",
            "options": ["Section 498A IPC", "Protection of Women from Domestic Violence Act", "Hindu Succession Act", "Family Courts Act"],
            "correctAnswer": 1,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-03  Safety & Protection from Violence
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-03": [
        {
            "question": "The Protection of Women from Domestic Violence Act was enacted in which year?",
            "options": ["2001", "2003", "2005", "2010"],
            "correctAnswer": 2,
        },
        {
            "question": "What types of abuse are covered under the Domestic Violence Act?",
            "options": ["Physical only", "Physical and verbal", "Physical, emotional, sexual, and economic", "Only sexual"],
            "correctAnswer": 2,
        },
        {
            "question": "The POSH Act (prevention of sexual harassment at workplace) was enacted in which year?",
            "options": ["2005", "2010", "2013", "2017"],
            "correctAnswer": 2,
        },
        {
            "question": "Under the POSH Act, every organization with how many employees must form an Internal Complaints Committee (ICC)?",
            "options": ["5 or more", "10 or more", "20 or more", "50 or more"],
            "correctAnswer": 1,
        },
        {
            "question": "Section 498A of IPC deals with what?",
            "options": ["Murder", "Cruelty by husband or his relatives", "Theft", "Kidnapping"],
            "correctAnswer": 1,
        },
        {
            "question": "What is the national women helpline number in India?",
            "options": ["100", "108", "181", "112"],
            "correctAnswer": 2,
        },
        {
            "question": "Cyber stalking and online harassment of women can be reported under which IT Act section?",
            "options": ["Section 43", "Section 66A (struck down) / Section 67", "Section 10", "Section 80"],
            "correctAnswer": 1,
        },
        {
            "question": "Which order created guidelines against sexual harassment before the POSH Act?",
            "options": ["Nirbhaya guidelines", "Vishaka guidelines", "NALSA guidelines", "Justice Verma guidelines"],
            "correctAnswer": 1,
        },
        {
            "question": "Under Domestic Violence Act, a woman can seek which type of relief?",
            "options": ["Protection orders only", "Protection, residence, monetary relief & custody", "Only monetary relief", "Only custody of children"],
            "correctAnswer": 1,
        },
        {
            "question": "The Criminal Law (Amendment) Act, 2013, which expanded laws against sexual offences, was passed after which incident?",
            "options": ["Bhanwari Devi case", "2012 Delhi gang rape case (Nirbhaya)", "Jessica Lal case", "Priyadarshini Mattoo case"],
            "correctAnswer": 1,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-04  Labour & Employment Rights for Women
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-04": [
        {
            "question": "The Equal Remuneration Act ensures what?",
            "options": ["Free housing for women", "Equal pay for equal work regardless of gender", "Extra pay for women", "Bonuses for married women"],
            "correctAnswer": 1,
        },
        {
            "question": "How many weeks of paid maternity leave are women entitled to under the Maternity Benefit (Amendment) Act, 2017?",
            "options": ["12 weeks", "16 weeks", "26 weeks", "30 weeks"],
            "correctAnswer": 2,
        },
        {
            "question": "The Maternity Benefit Act applies to establishments with how many or more employees?",
            "options": ["5", "10", "20", "50"],
            "correctAnswer": 1,
        },
        {
            "question": "Under the Factories Act, women cannot be required to work during which hours?",
            "options": ["6 AM to 6 PM", "7 PM to 6 AM (night shift restrictions)", "No restrictions", "12 PM to 6 PM"],
            "correctAnswer": 1,
        },
        {
            "question": "Which act provides for crèche facilities for working mothers?",
            "options": ["Factories Act & Maternity Benefit Act", "Companies Act", "Income Tax Act", "Consumer Protection Act"],
            "correctAnswer": 0,
        },
        {
            "question": "Maximum working hours per day for women under Factories Act?",
            "options": ["8 hours", "9 hours", "10 hours", "12 hours"],
            "correctAnswer": 1,
        },
        {
            "question": "The Unorganized Workers' Social Security Act was passed in which year?",
            "options": ["2005", "2008", "2010", "2013"],
            "correctAnswer": 1,
        },
        {
            "question": "Domestic workers in India are primarily covered under?",
            "options": ["Factories Act", "Sexual Harassment of Women at Workplace Act (POSH)", "No specific central legislation", "Companies Act"],
            "correctAnswer": 1,
        },
        {
            "question": "For the second child, maternity leave under the 2017 amendment is?",
            "options": ["26 weeks", "12 weeks", "16 weeks", "8 weeks"],
            "correctAnswer": 1,
        },
        {
            "question": "Who is eligible for maternity benefit under the Maternity Benefit Act?",
            "options": ["Only government employees", "Women who have worked at least 80 days in preceding 12 months", "All women regardless of work period", "Only women earning above minimum wage"],
            "correctAnswer": 1,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-05  Property & Inheritance Rights
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-05": [
        {
            "question": "The Hindu Succession (Amendment) Act, 2005 gave daughters what right?",
            "options": ["Right to vote", "Equal coparcenary rights in ancestral property", "Right to separate residence", "Right to divorce"],
            "correctAnswer": 1,
        },
        {
            "question": "Under Muslim personal law, what share does a daughter inherit compared to a son?",
            "options": ["Equal share", "Half of the son's share", "One-third of the son's share", "No share"],
            "correctAnswer": 1,
        },
        {
            "question": "Christian women's inheritance rights were strengthened by which court case?",
            "options": ["Shah Bano case", "Mary Roy v. State of Kerala", "Vishaka case", "Shayara Bano case"],
            "correctAnswer": 1,
        },
        {
            "question": "A Hindu woman's 'stridhan' (woman's property) belongs to whom?",
            "options": ["Her husband", "Her father-in-law", "The woman herself absolutely", "The joint family"],
            "correctAnswer": 2,
        },
        {
            "question": "Can a married woman own property in her own name in India?",
            "options": ["No, only after age 30", "Yes, under all personal laws", "Only with husband's permission", "Only government property"],
            "correctAnswer": 1,
        },
        {
            "question": "Before the 2005 amendment, who were coparceners in a Hindu joint family?",
            "options": ["All family members", "Only male members (sons, grandsons, great-grandsons)", "Only daughters", "Only the eldest male"],
            "correctAnswer": 1,
        },
        {
            "question": "Under which act can a woman claim her right to residence in the shared household?",
            "options": ["Transfer of Property Act", "Protection of Women from Domestic Violence Act, 2005", "Hindu Adoption Act", "Indian Contract Act"],
            "correctAnswer": 1,
        },
        {
            "question": "A widow under Hindu law inherits the property of her deceased husband in what manner?",
            "options": ["Gets nothing", "Gets a share equal to each son", "Gets only maintenance", "Gets property only if there are no sons"],
            "correctAnswer": 1,
        },
        {
            "question": "The Indian Succession Act primarily governs inheritance for which communities?",
            "options": ["Hindus only", "Muslims only", "Christians, Parsis and those married under Special Marriage Act", "All religions equally"],
            "correctAnswer": 2,
        },
        {
            "question": "Which landmark Supreme Court ruling confirmed daughters' equal coparcenary rights even if the father died before 2005?",
            "options": ["Vineeta Sharma v. Rakesh Sharma (2020)", "Shah Bano case", "Vishaka case", "Danamma v. Amar (2018)"],
            "correctAnswer": 0,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-06  Government Schemes & Financial Support
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-06": [
        {
            "question": "What is the Beti Bachao Beti Padhao scheme about?",
            "options": ["Free food for girls", "Survival, protection and education of the girl child", "Marriage registration", "Women's voting rights"],
            "correctAnswer": 1,
        },
        {
            "question": "Pradhan Mantri Ujjwala Yojana provides what to BPL women?",
            "options": ["Free smartphones", "Free LPG connections", "Free housing", "Free education"],
            "correctAnswer": 1,
        },
        {
            "question": "Sukanya Samriddhi Yojana is a savings scheme for whom?",
            "options": ["Senior women", "Girl children below 10 years", "Widows only", "All women above 18"],
            "correctAnswer": 1,
        },
        {
            "question": "What does NRLM (National Rural Livelihood Mission) aim to do?",
            "options": ["Build highways", "Reduce rural poverty through women's self-help groups", "Provide military training", "Urban infrastructure development"],
            "correctAnswer": 1,
        },
        {
            "question": "Janani Suraksha Yojana promotes what?",
            "options": ["Girl child education", "Institutional (hospital) deliveries for pregnant women", "Old-age pension for women", "Skill training for girls"],
            "correctAnswer": 1,
        },
        {
            "question": "The One Stop Centre (OSC) scheme provides what services to women?",
            "options": ["Shopping discounts", "Integrated support (medical, legal, counseling, shelter) for violence-affected women", "Job placement only", "Free travel"],
            "correctAnswer": 1,
        },
        {
            "question": "Mahila Shakti Kendra scheme works at which level?",
            "options": ["International level", "Community level to empower rural women", "Only in metro cities", "Only in state capitals"],
            "correctAnswer": 1,
        },
        {
            "question": "Stand-Up India scheme provides bank loans to women entrepreneurs for what amount?",
            "options": ["Up to ₹5 lakh", "₹10 lakh to ₹1 crore", "₹50 lakh to ₹5 crore", "Unlimited amount"],
            "correctAnswer": 1,
        },
        {
            "question": "Pradhan Mantri Matru Vandana Yojana provides financial support for?",
            "options": ["Girl child education", "First-time pregnant and lactating mothers", "Women's property purchase", "Women's travel expenses"],
            "correctAnswer": 1,
        },
        {
            "question": "Under MUDRA scheme, what is the maximum loan under Shishu category?",
            "options": ["₹25,000", "₹50,000", "₹2 lakh", "₹5 lakh"],
            "correctAnswer": 1,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-07  Legal Aid & Access to Justice
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-07": [
        {
            "question": "Under the Legal Services Authorities Act, women are entitled to what?",
            "options": ["Only paid legal services", "Free legal aid regardless of income", "Legal aid only in criminal cases", "Legal aid only above age 40"],
            "correctAnswer": 1,
        },
        {
            "question": "NALSA stands for?",
            "options": ["National Arbitration & Legal Services Authority", "National Legal Services Authority", "National Labour & Social Authority", "National Literacy & Sciences Academy"],
            "correctAnswer": 1,
        },
        {
            "question": "The women helpline number 181 provides what type of service?",
            "options": ["Fire service", "24/7 emergency response for women in distress", "Hospital ambulance", "Railway complaint"],
            "correctAnswer": 1,
        },
        {
            "question": "Lok Adalats (People's Courts) provide what advantage?",
            "options": ["Higher punishment", "Free, fast and amicable dispute resolution", "Only property disputes", "International arbitration"],
            "correctAnswer": 1,
        },
        {
            "question": "Which commission investigates complaints of women's rights violations at the national level?",
            "options": ["NHRC", "National Commission for Women (NCW)", "Election Commission", "CAG"],
            "correctAnswer": 1,
        },
        {
            "question": "Family courts in India were established under which act?",
            "options": ["Code of Civil Procedure", "Family Courts Act, 1984", "Hindu Marriage Act", "Criminal Procedure Code"],
            "correctAnswer": 1,
        },
        {
            "question": "Can an FIR be filed online for crimes against women?",
            "options": ["No, never", "Yes, many states allow online FIR/complaint registration", "Only through a lawyer", "Only at High Court"],
            "correctAnswer": 1,
        },
        {
            "question": "Police helpline number for emergencies in India?",
            "options": ["181", "108", "100", "1098"],
            "correctAnswer": 2,
        },
        {
            "question": "Which mobile app was launched by the government for women's safety?",
            "options": ["WhatsApp", "Himmat / She-Box", "Facebook Safety", "Twitter Guard"],
            "correctAnswer": 1,
        },
        {
            "question": "Under Legal Services (Free and Competent Legal Aid) rules, what is the income ceiling for free legal aid for general category?",
            "options": ["No income ceiling for women", "₹1 lakh per annum", "₹5 lakh per annum", "₹50,000 per annum"],
            "correctAnswer": 0,
        },
    ],

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # MOD-08  Special Topics: Trafficking, NRI Marriages & More
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    "MOD-08": [
        {
            "question": "Human trafficking in India is punishable under which IPC section?",
            "options": ["Section 302", "Section 370", "Section 420", "Section 144"],
            "correctAnswer": 1,
        },
        {
            "question": "The Immoral Traffic (Prevention) Act, 1956 primarily addresses what?",
            "options": ["Road traffic violations", "Prevention of trafficking for commercial sexual exploitation", "Air traffic control", "Internet traffic management"],
            "correctAnswer": 1,
        },
        {
            "question": "For NRI marriages, the government has introduced which registration requirement?",
            "options": ["No registration needed", "Compulsory registration of NRI marriages", "Registration only in foreign country", "Only civil marriage allowed"],
            "correctAnswer": 1,
        },
        {
            "question": "Which ministry handles complaints related to NRI marriages?",
            "options": ["Ministry of Defence", "Ministry of External Affairs (MEA)", "Ministry of Finance", "Ministry of Home Affairs"],
            "correctAnswer": 1,
        },
        {
            "question": "The Bonded Labour System (Abolition) Act was enacted in which year?",
            "options": ["1960", "1970", "1976", "1985"],
            "correctAnswer": 2,
        },
        {
            "question": "What is the POCSO Act?",
            "options": ["Prevention of Corruption in Sports Organizations", "Protection of Children from Sexual Offences Act", "Prevention of Cyber Stalking Operations", "Protection of Consumer Service Obligations"],
            "correctAnswer": 1,
        },
        {
            "question": "Which landmark judgment recognized transgender rights in India?",
            "options": ["Vishaka case", "NALSA v. Union of India (2014)", "Shah Bano case", "Maneka Gandhi case"],
            "correctAnswer": 1,
        },
        {
            "question": "Revenge pornography and non-consensual sharing of intimate images is punishable under?",
            "options": ["Motor Vehicles Act", "IT Act Section 66E and IPC Section 354C", "Consumer Protection Act", "Patent Act"],
            "correctAnswer": 1,
        },
        {
            "question": "The Right to Education Act (RTE) benefits girls by ensuring?",
            "options": ["Free and compulsory education for ages 6-14", "Education only for boys", "Higher education scholarships", "Only vocational training"],
            "correctAnswer": 0,
        },
        {
            "question": "What is an important legal remedy available to abandoned NRI wives in India?",
            "options": ["No legal remedy exists", "They can approach Indian courts and the passport of the NRI husband can be impounded", "They must go to the foreign country to file a case", "Only arbitration is available"],
            "correctAnswer": 1,
        },
    ],
}

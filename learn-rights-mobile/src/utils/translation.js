import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';

export const LANGUAGES = [
  { code: 'en',  name: 'English' },
  { code: 'hi',  name: 'हिन्दी (Hindi)' },
  { code: 'te',  name: 'తెలుగు (Telugu)' },
  { code: 'ta',  name: 'தமிழ் (Tamil)' },
  { code: 'kn',  name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml',  name: 'മലയാളം (Malayalam)' },
  { code: 'mr',  name: 'मराठी (Marathi)' },
  { code: 'bn',  name: 'বাংলা (Bengali)' },
  { code: 'gu',  name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa',  name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or',  name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as',  name: 'অসমীয়া (Assamese)' },
  { code: 'ur',  name: 'اردو (Urdu)' },
  { code: 'sa',  name: 'संस्कृतम् (Sanskrit)' },
  { code: 'ne',  name: 'नेपाली (Nepali)' },
  { code: 'sd',  name: 'سنڌي (Sindhi)' },
  { code: 'mai', name: 'मैथिली (Maithili)' },
];

const englishStrings = {
    // App name (brand / logo)
    'app_name': 'Learn Rights',
    'onboarding.slide1.title': 'Know Your Rights',
    'onboarding.slide1.desc': 'Empower yourself with simplified legal knowledge designed for every woman.',
    'onboarding.slide2.title': 'AI Legal Assistant',
    'onboarding.slide2.desc': 'Get instant answers to your legal queries in your preferred language, 24/7.',
    'onboarding.slide3.title': 'Your Safety Hub',
    'onboarding.slide3.desc': 'Access emergency SOS, fake call sims, and safety tracking for ultimate protection.',

    // Navigation & General
    home: 'Home',
    dashboard: 'Dashboard',
    modules: 'Modules',
    quiz: 'Quiz',
    achievements: 'Achievements',
    leaderboard: 'Rankings',
    chatbot: 'Legal Bot',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',

    // Common Headings & UI
    'hero.title': 'Welcome to Learn Rights',
    'hero.subtitle': 'Empowering Women with Legal Knowledge',
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.modules_completed': 'Modules Completed',
    'dashboard.total_points': 'Total Points',
    'dashboard.average_score': 'Avg Quiz Score',
    'dashboard.your_rank': 'Your Rank',
    'dashboard.continue_journey': 'Continue your journey towards legal empowerment',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.continue_learning': 'Continue Learning',
    'dashboard.ask_assistant': 'Ask Legal Bot',
    'dashboard.view_leaderboard': 'View Leaderboard',
    'dashboard.update_profile': 'Update Profile',
    'dashboard.recent_progress': 'Recent Progress',

    'modules.title': 'Learning Modules',
    'modules.subtitle': 'Explore your rights and protections',
    'modules.start': 'Start Module',
    'modules.loading': 'Loading modules...',
    'modules.search_placeholder': 'Search modules...',
    'modules.take_quiz': 'Take Quiz',
    'modules.mark_completed': 'Mark as Completed',

    'chatbot.title': 'Legal Bot',
    'chatbot.welcome': 'Ask me anything about your legal rights',
    'chatbot.placeholder': 'Ask me about your legal rights...',
    'chatbot.disclaimer': 'This AI provides general information only. For legal advice, consult a qualified attorney.',
    'chatbot.suggestion1': 'What are my basic rights?',
    'chatbot.suggestion2': 'How to file a complaint?',
    'chatbot.suggestion3': 'Legal aid services?',

    'profile.title': 'Profile',
    'profile.tabs.personal': 'Info',
    'profile.tabs.progress': 'Progress',
    'profile.tabs.achievements': 'Awards',
    'profile.tabs.certs': 'Certificates',
    'profile.save': 'Save Changes',
    'profile.fields.name': 'Full Name',
    'profile.fields.email': 'Email Address',
    'profile.fields.language': 'Preferred Language',
    'profile.show_on_leaderboard': 'Show on Leaderboard',
    'profile.email_notifications': 'Email Notifications',
    'profile.points': 'Points',
    'profile.modules': 'Modules',
    'profile.badges': 'Badges',
    'profile.certs.title': 'My Certificates',
    'profile.certs.keep_learning': 'Complete 2+ modules with quizzes to earn certificates!',
    'profile.certs.earned_at': 'Earned at',

    'quiz.title': 'Module Quiz',
    'quiz.submit': 'Submit Quiz',
    
    'leaderboard.title': 'Leaderboard',
    'leaderboard.subtitle': 'See how you rank among fellow learners!',

    // Home / Landing features
    'home.features.title': 'Why Choose Learn Rights?',
    'home.features.subtitle': 'Discover the features that make learning legal rights accessible and engaging.',
    'home.features.modules.title': 'Interactive Modules',
    'home.features.modules.description': 'Legal rights explained with real-life examples and interactive multi-language content.',
    'home.features.chatbot.title': 'AI Legal Assistant',
    'home.features.chatbot.description': 'Ask complex legal questions anytime and get instant answers in your own language.',
    'home.features.leaderboard.title': 'Social Rankings',
    'home.features.leaderboard.description': 'Earn points, track your progress, and see how you rank against other learners.',
    
    'dashboard.cta.title': 'Need Legal Help?',
    'dashboard.cta.description': 'Our AI powered Legal Assistant is here to help you understand your rights instantly.',
    'dashboard.cta.button': 'Talk to Assistant',

    'dashboard.stats.learners': 'Learners',
    'dashboard.stats.modules': 'Modules',
    'dashboard.stats.langs': 'Langs',

    // Leaderboard Levels
    'leaderboard.level.master': 'Master',
    'leaderboard.level.expert': 'Expert',
    'leaderboard.level.advanced': 'Advanced',
    'leaderboard.level.intermediate': 'Intermediate',
    'leaderboard.level.beginner': 'Beginner',

    // Home Quotes
    'home.quote.1': 'Knowledge is power. Learn your rights to empower yourself.',
    'home.quote.2': 'Every woman deserves to know her legal rights and protections.',
    'home.quote.3': 'Your rights are your shield. Know them, use them, protect them.',
    'home.quote.4': 'Empowered women empower communities.',

    // Welcome Screen
    'welcome.title': 'Empower Yourself',
    'welcome.subtitle': 'Simple, Multilingual, AI-powered learning platform designed to understand and exercise your legal rights.',
    'welcome.get_started': 'Get Started',
    'welcome.login': 'Log In to Account',
    'welcome.feat.multilang': 'Multi-language',
    'welcome.feat.interactive': 'Interactive',
    'welcome.feat.progress': 'Track Progress',
    'welcome.feat.ai': 'AI Assistant',

    // Auth Screens
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to continue your journey',
    'auth.login.forgot': 'Forgot Password?',
    'auth.login.submit': 'Sign In',
    'auth.login.no_account': "Don't have an account?",
    'auth.signup.title': 'Create Account',
    'auth.signup.subtitle': 'Join our community of legal learners',
    'auth.signup.have_account': 'Already have an account?',
    'auth.signup.submit': 'Create Account',
    'auth.fields.email': 'Email Address',
    'auth.fields.password': 'Password',
    'auth.fields.name': 'Full Name',
    'auth.fields.confirm_password': 'Confirm Password',
    'auth.fields.lang_hint': 'Preferred Language (e.g. en, hi)',

    // Admin Screens
    'admin.dashboard.title': 'Admin Panel',
    'admin.dashboard.subtitle': 'Unified Management Platform',
    'admin.stats.users': 'Users',
    'admin.stats.modules': 'Modules',
    'admin.stats.langs': 'Langs',
    'admin.menu.users.title': 'User Management',
    'admin.menu.users.sub': 'Manage all learners',
    'admin.menu.modules.title': 'Module Content',
    'admin.menu.modules.sub': 'Manage learning modules',
    'admin.menu.bot.title': 'AI Bot Settings',
    'admin.menu.bot.sub': 'Configure legal assistant',
    'admin.menu.stats.title': 'System Analytics',
    'admin.menu.stats.sub': 'Platform usage stats',
    'admin.users.search': 'Search users...',
    'admin.users.none': 'No users found.',
    'admin.users.error': 'Failed to load users.',
    'admin.retry': 'Retry',

    // Admin Games
    'admin.menu.games.title': 'AI Game Management',
    'admin.menu.games.sub': 'Monitor & refresh AI games',
    'admin.games.title': 'AI Game Management',
    'admin.games.stats': 'Game Statistics',
    'admin.games.cache': 'AI Content Cache',
    'admin.games.cache_desc': 'AI content is cached for 24 hours to improve performance. Clearing the cache forces new content generation.',
    'admin.games.clear_cache': 'Clear AI Cache',
    'admin.games.cache_cleared': 'AI cache cleared successfully.',
    'admin.games.test_gen': 'Test AI Generation',
    'admin.games.gen_result': 'Generation Result',
    'admin.games.total_plays': 'Total Plays',
    'admin.games.avg_score': 'Avg Score',
    'admin.games.no_stats': 'No game statistics available yet.',

    // Chatbot Screen
    'chatbot.title': 'Legal Assistant',
    'chatbot.status': 'Online • AI Powered',
    'chatbot.welcome': 'How can I help you today?',
    'chatbot.welcome_sub': 'Ask me anything about your legal rights in India.',
    'chatbot.listening': 'Listening...',
    'chatbot.placeholder': 'Ask a question...',
    'chatbot.error': "Sorry, I'm having trouble connecting.",
    'chatbot.clear_history': 'Clear History',

    // Modules Screen
    'modules.reading_required': 'Minimum Reading Time Required',
    'modules.reading_complete': 'Reading Complete!',
    'modules.remaining': 'remaining',
    'modules.watch_learn': 'Watch & Learn',
    'modules.reference_links': 'Reference Links',
    'modules.completed': 'Completed',
    'modules.lessons': 'Lessons',
    'modules.take_quiz': 'Take Module Quiz',
    'modules.reading_note': 'Each lesson requires 5 mins reading to unlock the quiz.',
    'modules.connection_error': 'Connection Error',
    'modules.connection_error_sub': 'Failed to reach the server. Please check your internet or retry.',
    'modules.retry_connection': 'Retry Connection',
    'modules.no_modules': 'No modules found.',
    'modules.percentage_complete': '% Complete',

    // Newest / Sync Keys
    'home.newest_modules': 'Newest Modules',
    'home.sync_now': 'Sync Now',
    'home.syncing': 'Syncing your progress...',
    'home.pending_sync': 'items waiting to sync',
    'welcome.footer_join': 'Join thousands of users learning their legal rights',
    'view_all': 'View All',

    // Onboarding Slides
    'onboarding.slide1.title': 'Know Your Rights',
    'onboarding.slide1.desc': 'Empowering you with legal knowledge and tools to protect your future.',
    'onboarding.slide2.title': 'Join the Community',
    'onboarding.slide2.desc': 'Share your perspectives, react to others, and connect with a global movement.',
    'onboarding.slide3.title': 'Be Inspired',
    'onboarding.slide3.desc': 'Read stories of courage and participate in competitions to change the world.',

    // Auth
    'auth.or': 'OR',
    'auth.login.google': 'Continue with Google',
    'auth.signup.google': 'Sign up with Google',

    // Community
    'community.title': 'Community Hub',
    'community.subtitle': 'Connect & Share Perspectives',
    'community.empty': 'No posts yet. Be the first to share!',
    'community.create_post': 'New Post',
    'community.post_placeholder': 'What are your thoughts on today\'s rights?',
    'community.publish': 'Post to Community',
    'community.add_comment': 'Add a comment...',

    // Stories
    'stories.title': 'Inspiring Stories',
    'stories.subtitle': 'Voices of Changemakers',
    'stories.read_full': 'Read Full Story',

    // Competitions
    'comp.title': 'Competitions',
    'comp.subtitle': 'Participate & Earn Points',
    'comp.success_title': 'Entry Submitted!',
    'comp.success_msg': 'We have received your entry. You earned 50 participation points!',
    'comp.essay_placeholder': 'Write your perspective here...',
    'comp.submit': 'Submit Entry',
    'back_to_comp': 'Back to Challenges',

    // Lawyers
    'lawyers.title': 'Legal Aid Directory',
    'lawyers.subtitle': 'Connect with verified civil rights lawyers',
    'lawyers.search': 'Search specialization or name...',
    'lawyers.register': 'Register as Lawyer',
    'lawyers.my_profile': 'My Lawyer Profile',
    'lawyers.verified': 'Verified Professional',
    'lawyers.pending': 'Verification Pending',
    'lawyers.contact': 'Contact for Help',
    'lawyers.exp': '{n} Years Experience',
    'lawyers.fields.name': 'Full Name',
    'lawyers.fields.specialization': 'Specialization (e.g. Civil Rights)',
    'lawyers.fields.experience': 'Years of Experience',
    'lawyers.fields.bio': 'Professional Bio',
    'lawyers.fields.office': 'Office Address',
    'lawyers.fields.phone': 'Phone Number',
    'lawyers.fields.email': 'Email Address',
    'lawyers.success': 'Profile submitted! Our team will verify it shortly.',
    
    // Safety Hub / Home Additions
    'safety.contacts_active': 'Contacts Active',
    'safety.hub': 'Safety Hub',
    'home.game_center': 'Game Center',
    'home.join_competitions': 'Join Challenges',
    'home.syncing': 'Syncing...',
    'home.daily_goal': 'Daily Progress',
    'home.goal_desc': 'Complete {n} lessons today',
    'home.lessons': 'Lessons',

    // Home Discover
    'home.discover_stories': 'Discover Stories',
    'home.join_competitions': 'Join Challenges',

    // Phase 13 & 14 Additions
    'home.game_center': 'Game Center',
    'home.game_center_sub': 'Learn through play & earn rewards',
    'home.daily_streak': 'Daily Streak',
    'home.latest_activity': 'Latest Activity',
    'home.rights_match': 'Rights Match',
    'home.rights_match_sub': 'Memory card challenge',
    'home.legal_detective': 'Legal Detective',
    'home.legal_detective_sub': 'Analyze case studies',
    'home.lightning_quiz': 'Lightning Quiz',
    'home.lightning_quiz_sub': 'Fast-paced legal trivia',
    
    'game.moves': 'Moves',
    'game.solved': 'Solved',
    'game.victory': 'Victory!',
    'game.play_again': 'Play Again',
    'game.next_case': 'Next Case',
    'game.view_result': 'View Result',
    'game.case_closed': 'Case Closed!',
    'game.review_facts': 'Review Legal Facts',
    'game.no_cards': 'No cards found. Try refreshing.',
    'game.win_moves': 'You completed it in {moves} moves',
    'game.match_win_limit': 'You matched all rights! (Daily limit reached)',
    'game.match_win_points': 'You matched all rights! +{points} Points earned.',
    'game.excellent_choice': 'Excellent Choice!',
    'game.room_improvement': 'Room for Improvement',
    'game.legal_insight': 'Legal Insight',
    'game.challenge_n_of_m': 'Challenge {n} of {m}',
    'game.question_n_of_m': 'Question {n} of {m}',
    'game.choose_path': 'Choose the best legal path:',
    'game.no_scenarios': 'No scenarios found. Please try again later.',
    'game.daily_xp_cap': 'Daily XP Cap',
    'game.daily_xp_cap_msg': 'You reached the daily XP limit for this game. Come back tomorrow!',
    'game.ai_gen_challenge': 'AI Generated Challenge',
    'game.learn_why': 'Learn Why',
    'game.finish': 'Finish',
    'game.next': 'Next',
    'game.game_over': 'Game Over!',
    'game.earned_points': 'You earned {score} points',
    'game.no_questions': 'No questions found for this topic. Try again or check your language settings.',
    
    // Weekly Challenge Specific
    'game.weekly.generating': 'Generating your tough challenge...',
    'game.weekly.title': 'Weekly Expert Challenge',
    'game.weekly.desc': 'You have exactly 10 minutes to answer 5 highly difficult legal questions generated by our AI.',
    'game.weekly.start': 'Start Challenge',
    'game.weekly.back': 'Back to Game Hub',
    'game.weekly.masterful': 'Masterful!',
    'game.weekly.good_effort': 'Good Effort!',
    'game.weekly.correct': 'Correct',
    'game.weekly.return': 'Return to Games',
    'game.weekly.legal_explanation': 'Legal Explanation',
    'game.weekly.next_q': 'Next Question',
    'game.weekly.view_results': 'View Results',
    'game.weekly.timeout_msg': 'You have already completed the Weekly Challenge recently! Come back later for more points.',
    'game.weekly.complete_msg': 'Challenge Complete! You scored {score}/{total} and earned {points} XP!',

    // Game Center Strings
    'home.ai_refresh_note': 'AI Challenges refresh every 24h',
    'home.next_reset': 'Next Daily Reset in:',
    'home.weekly_challenge_badge': 'WEEKLY CHALLENGE',
    'home.ai_mastery_title': 'AI Mastery Tournament',
    'home.ai_mastery_desc': 'Solve 5 advanced scenarios to prove your legal expertise!',
    'home.daily_games': 'Daily Games',
    'home.ai_generated_badge': 'AI GENERATED',
    'home.midnight_refresh_note': 'New challenges every day at midnight',

    // Safety Hub Strings
    'safety.active_status': 'SAFETY MODE ACTIVE',
    'safety.trigger_sos': 'TRIGGER SOS',
    'safety.sending_sos': 'SENDING...',
    'safety.fake_call': 'Fake Call',
    'safety.fake_call_sub': 'Simulate incoming call',
    'safety.safe_havens': 'Safe Havens',
    'safety.safe_havens_sub': 'Find nearest safe zones',
    'safety.power_saver': 'Power Saver',
    'safety.power_saver_sub': 'Simulated low power state',
    'safety.emergency_note': 'Always call 100 in case of immediate danger.',
    'safety.sos_sent_title': 'SOS Sent',
    'safety.sos_sent_msg': 'Your emergency contacts have been notified with your live location.',
    'safety.exit_title': 'Deactivate Safety Mode?',
    'safety.exit_msg': 'Your contacts will stop receiving location updates.',
    'safety.exit_cancel': 'Stay Safe',
    'safety.exit_confirm': 'Exit',

    // Fake Call Strings
    'fake_call.incoming': 'Mobile... Calling',
    'fake_call.decline': 'Decline',
    'fake_call.accept': 'Accept',
    'fake_call.mute': 'Mute',
    'fake_call.keypad': 'Keypad',
    'fake_call.speaker': 'Speaker',
    'fake_call.caller_name': 'Dad',
    'fake_call.alert_body': "A fake 'Incoming Call' will trigger in 10 seconds. Use this as an excuse to leave Safely.",

    // Safety Context Alerts
    'safety.low_battery_title': 'Low Battery Detected',
    'safety.low_battery_msg': 'Your battery is below 15%. Would you like to activate Safety Mode for your security?',
    'safety.activate_now': 'Activate',
    'safety.not_now': 'Not Now',
    'safety.perm_needed': 'Permission Needed',
    'safety.perm_msg': 'Background location is required for Safety Mode to keep your contacts updated.',
    'safety.no_contacts_title': 'No Contacts',
    'safety.no_contacts_msg': "You don't have any emergency contacts saved in your profile.",
    'safety.sms_unavailable_title': 'SMS Unavailable',
    'safety.sms_unavailable_msg': 'This device cannot send SMS messages.',
    'safety.sos_failed_msg': 'Could not reach emergency services. Please call 100 directly.',
    'safety.auto_activate_msg': 'Safety Mode Activated due to low battery.',
    'safety.shake_trigger': 'Shake to Trigger SOS',
    'safety.shake_trigger_sub': 'Vigorously shake your phone to send SOS instantly.',
    'safety.enabled': '(Enabled)',
    'safety.disabled': '(Disabled)',
    'safety.added': '(Added)',
    'safety.missing': '(Missing)',
    'safety.voice_trigger': 'Voice Command Trigger',
    'safety.contacts': 'Emergency Contacts',
    'safety.shake_detected': 'Shake Detected! Sending SOS...',
    'safety.default_sos_msg': 'EMERGENCY HELP NEEDED! I am in danger.',

    // Chatbot Nuances
    'chatbot.listening': 'Listening...',
    'chatbot.placeholder': 'Ask anything...',
    'chatbot.welcome_sub': 'I can help you understand your legal rights, find help, or discuss safety scenarios.',
    'chatbot.suggestion1': 'What are my basic rights?',
    'chatbot.suggestion2': 'How to file a complaint?',
    'chatbot.suggestion3': 'Legal aid services?',

    'notif.title': 'Notifications',
    'notif.mark_read': 'Mark all as read',
    'notif.empty_title': 'All caught up!',
    'notif.empty_sub': 'No new notifications at this time.',
    'notif.activity.points': 'Points Earned',
    'notif.activity.module': 'Module Master',
    'home.sync_now': 'Sync Now',
    'home.emergency_sos': 'EMERGENCY SOS',
    'home.new_badge': 'NEW',
    'home.done': 'Done',
    'home.points_earned': 'Points Earned',
    'home.points_earned_msg': 'You earned {n} points for your progress!',
    'home.module_master': 'Module Master',
    'home.module_master_msg': "You've successfully completed {n} modules.",
    'home.activity_start': 'Start learning to see your activity feed!',
    'home.today': 'Today',
    'home.recent': 'Recent',
    'modules.topics_count': '{n} Topics',

    // App Tour
    'tour.welcome.title': 'Welcome to Learn Rights',
    'tour.welcome.desc': 'Let us show you how to navigate your journey towards legal empowerment.',
    'tour.modules.title': 'Interactive Modules',
    'tour.modules.desc': 'Access simplified legal knowledge organized into easy-to-read modules and quizzes.',
    'tour.bot.title': 'AI Legal Assistant',
    'tour.bot.desc': 'Got a specific question? Ask our AI Legal Bot for instant guidance in your language.',
    'tour.safety.title': 'Safety First',
    'tour.safety.desc': 'Use the Safety Hub to trigger SOS, find safe zones, or simulate fake calls for protection.',
    'tour.community.title': 'Community & Stories',
    'tour.community.desc': 'Connect with others, share your perspectives, and read inspiring stories of change.',
    'tour.finish': 'Start Learning',
    'tour.next': 'Next',
    'tour.skip': 'Skip Tour',
    'tour.step': 'Step {n} of {total}',
};

let cachedTranslations = {};
let currentLanguage = 'en';
let listeners = [];

export const initTranslation = async () => {
    try {
        currentLanguage = await AsyncStorage.getItem('language') || 'en';
        const stored = await AsyncStorage.getItem(`translations_${currentLanguage}`);
        if (stored) {
            cachedTranslations = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Translation init error", e);
    }
};

export const getLanguage = () => currentLanguage;

export const t = (key, options) => {
    if (currentLanguage === 'en') {
        return englishStrings[key] || (options && options.defaultValue) || key;
    }
    return (cachedTranslations && cachedTranslations[key]) || englishStrings[key] || (options && options.defaultValue) || key;
};

export const loadTranslations = async (lang) => {
    if (lang === 'en') {
        currentLanguage = 'en';
        await AsyncStorage.setItem('language', 'en');
        listeners.forEach(l => l(lang));
        return true;
    }

    try {
        const response = await API.get(`/language/translate/${lang}`);
        const { translations } = response.data;
        if (translations) {
            cachedTranslations = translations;
            await AsyncStorage.setItem(`translations_${lang}`, JSON.stringify(translations));
            await AsyncStorage.setItem('language', lang);
            currentLanguage = lang;
            listeners.forEach(l => l(lang));
            return true;
        }
    } catch (err) {
        console.error("Load translations error", err);
    }
    return false;
};

export const onTranslationChange = (fn) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
};

export const getCurrentLanguage = () => currentLanguage;

export const broadcastChange = (lang) => {
    listeners.forEach(l => l(lang));
};

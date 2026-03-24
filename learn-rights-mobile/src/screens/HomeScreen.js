import React, { useState, useEffect } from 'react'; // Refined Onboarding & SOS
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight, ZoomIn, FadeInDown } from 'react-native-reanimated';
import { BookOpen, Bot, Trophy, LogOut, Users, Languages, Star, ChevronRight, Play, Award, User, Zap, RefreshCcw, AlertCircle, ShieldCheck, ArrowRight, Compass, Flame, Gamepad2, Bell, ShieldAlert, Gavel, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { useSafety } from '../contexts/SafetyModeContext';
import { t } from '../utils/translation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable } from 'react-native';

const { width, height } = Dimensions.get('window');

const MOD_COLORS = {
  "MOD-01": "#7c3aed", "MOD-02": "#ec4899", "MOD-03": "#ef4444",
  "MOD-04": "#f59e0b", "MOD-05": "#10b981", "MOD-06": "#06b6d4",
  "MOD-07": "#8b5cf6", "MOD-08": "#f43f5e",
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, user, language, progress, modules, logout, loading: ctxLoading, refreshUserData, hasConnectionError, syncStatus, triggerSync } = useUser();
  const { shakeEnabled, toggleShakeTrigger, isVoiceTriggerEnabled, toggleVoiceTrigger } = useSafety();
  const [publicStats, setPublicStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [userRank, setUserRank] = useState('...');
  const [streak, setStreak] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0); 
  const [showSOSPrompt, setShowSOSPrompt] = useState(false);
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    const checkTour = async () => {
      if (!userId) return;
      const hasSeenTour = await AsyncStorage.getItem(`has_seen_tour_${userId}`);
      if (!hasSeenTour) {
        setShowTour(true);
      }
    };
    checkTour();
  }, [userId]);

  useEffect(() => {
    const checkSOSPrompt = async () => {
      // 1. Check if everything is already configured
      const hasContacts = user?.emergencyContacts?.some(c => c.name && c.mobile);
      const isConfigured = shakeEnabled && isVoiceTriggerEnabled && hasContacts;
      
      if (!isConfigured) {
        // Only show once per session (to avoid annoying the user)
        const hasSeenThisSession = await AsyncStorage.getItem(`sos_prompt_session_${userId}`);
        if (!hasSeenThisSession) {
          setShowSOSPrompt(true);
        }
      }
    };
    
    if (userId && !ctxLoading && !showTour) {
      checkSOSPrompt();
    }
  }, [userId, ctxLoading, shakeEnabled, isVoiceTriggerEnabled, user, showTour]);

  const handleActivateSOS = async () => {
    if (!shakeEnabled) await toggleShakeTrigger();
    if (!isVoiceTriggerEnabled) await toggleVoiceTrigger(); 
    setShowSOSPrompt(false);
    await AsyncStorage.setItem(`sos_prompt_session_${userId}`, 'true');
  };

  const handleDismissSOS = async () => {
    setShowSOSPrompt(false);
    await AsyncStorage.setItem(`sos_prompt_session_${userId}`, 'true');
  };

  const motivationalQuotes = [
    t('home.quote.1'),
    t('home.quote.2'),
    t('home.quote.3'),
    t('home.quote.4')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    if (!userId) return;
    try {
        const [statsRes, lbRes, streakRes] = await Promise.all([
          API.get("/admin/public-stats"),
          API.get("/leaderboard/top"),
          API.get(`/games/streak/${userId}`)
        ]);
        setPublicStats(statsRes.data);
        setStreak(streakRes.data.streak || 0);
        
        // Find user rank
        const rank = lbRes.data.findIndex(u => u._id === userId);
        if (rank !== -1) {
          setUserRank(`#${rank + 1}`);
        } else {
          setUserRank('> 10');
        }

        // Check if already checked in today
        const todayStr = new Date().toISOString().split('T')[0];
        if (user?.lastCheckIn === todayStr) {
            setCheckedInToday(true);
        }

        // Auto-update streak if not done today
        const lastActive = streakRes.data.lastActive;
        if (!lastActive || !lastActive.startsWith(todayStr)) {
            await API.post('/games/streak/update', { userId });
        }
    } catch (err) {
        console.error("Home stats error:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (checkedInToday || isCheckinLoading || !userId) return;
    setIsCheckinLoading(true);
    try {
        const res = await API.post("/profile/daily-checkin-reward", { userId });
        if (res.data.success) {
            setCheckedInToday(true);
            await refreshUserData(); // Update points in context
            Alert.alert("🎉 "+t('game.victory'), res.data.message);
        } else {
            setCheckedInToday(true);
            Alert.alert("Info", res.data.message);
        }
    } catch (err) {
        alert("Check-in failed. Please try again.");
        console.error("Check-in error:", err);
    } finally {
        setIsCheckinLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUserData(), fetchStats()]);
    // Mock daily goal progress for now
    setCompletedLessons(progress?.completedSubTopics?.length || 0);
    setRefreshing(false);
  };

  if (ctxLoading || (loading && !refreshing)) return <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />;

  const completedCount = progress?.completedModules?.length || 0;
  const totalPoints = user?.points || 0;
  const avgScore = user?.quizzes?.length ? Math.round(user.quizzes.reduce((s, q) => s + (q.score || 0), 0) / user.quizzes.length) : 0;

  const metrics = [
    { icon: Flame, label: t('home.daily_streak'), value: `${streak} Days`, color: '#f97316' },
    { icon: Star, label: t('dashboard.total_points'), value: totalPoints, color: '#ec4899' },
    { icon: Award, label: t('dashboard.average_score'), value: `${avgScore}%`, color: '#0ea5e9' },
    { icon: Trophy, label: t('dashboard.your_rank'), value: userRank, color: '#f59e0b' },
  ];

  const quickActions = [
    { icon: Play, label: t('dashboard.continue_learning'), path: 'Modules', color: '#7c3aed' },
    { icon: Bot, label: t('dashboard.ask_assistant'), path: 'Bot', color: '#ec4899' },
    { icon: Trophy, label: t('dashboard.view_leaderboard'), path: 'Rankings', color: '#f59e0b' },
    { icon: ShieldCheck, label: t('safety.hub'), path: 'SafetyHub', color: '#ef4444' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
      
      {/* Background Orbs */}
      <Animated.View entering={ZoomIn.delay(200)} style={[styles.orb, { top: -50, left: -50, width: 250, height: 250, backgroundColor: 'rgba(124, 58, 237, 0.1)' }]} />
      <Animated.View entering={ZoomIn.delay(500)} style={[styles.orb, { bottom: 100, right: -100, width: 300, height: 300, backgroundColor: 'rgba(236, 72, 153, 0.05)' }]} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
      >
        {hasConnectionError && (
            <Animated.View entering={FadeInUp} style={styles.errorBanner}>
                <AlertCircle size={18} color="#ef4444" />
                <Text style={styles.errorText}>Connection Issues. Data may be outdated.</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <RefreshCcw size={16} color="#7c3aed" />
                </TouchableOpacity>
            </Animated.View>
        )}

        {syncStatus.itemCount > 0 && (
            <Animated.View entering={FadeInUp} style={[styles.errorBanner, { backgroundColor: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.2)' }]}>
                {syncStatus.isSyncing ? <ActivityIndicator size="small" color="#38bdf8" /> : <RefreshCcw size={18} color="#38bdf8" />}
                <Text style={[styles.errorText, { color: '#38bdf8' }]}>
                    {syncStatus.isSyncing ? t('home.syncing') : `${syncStatus.itemCount} ${t('home.pending_sync')}`}
                </Text>
                {!syncStatus.isSyncing && (
                    <TouchableOpacity onPress={triggerSync} style={styles.syncBtn}>
                        <Text style={styles.syncBtnText}>{t('home.sync_now')}</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        )}
        {/* Welcome Banner */}
        <Animated.View entering={FadeInUp} style={styles.header}>
            <View>
                <Text style={styles.greeting}>{t('dashboard.welcome')},</Text>
                <Text style={styles.userName}>{user?.name || 'Learner'}! 👋</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => navigation.navigate('LawyersDirectory')} style={styles.bellBtn}>
                    <Gavel size={22} color="#7c3aed" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
                    <Bell size={24} color="#7c3aed" />
                    <View style={styles.bellDot} />
                </TouchableOpacity>
            </View>
        </Animated.View>

        {/* Emergency SOS Quick Trigger */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.emergencySosBtn}>
            <TouchableOpacity 
                style={styles.sosInner} 
                onPress={() => navigation.navigate('SafetyHub')}
            >
                <LinearGradient colors={['#ef4444', '#991b1b']} style={styles.sosGradient}>
                    <ShieldAlert size={20} color="white" />
                    <Text style={styles.sosBtnText}>{t('home.emergency_sos')}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.banner}>
             <Text style={styles.bannerQuote}>"{motivationalQuotes[currentQuote]}"</Text>
        </Animated.View>

        {/* Daily Mission & Progress - Only for logged in users */}
        {userId ? (
        <Animated.View entering={FadeInUp.delay(150)} style={styles.goalCard}>
            <LinearGradient colors={['rgba(124, 58, 237, 0.1)', 'rgba(124, 58, 237, 0.03)']} style={styles.goalInner}>
                <View style={styles.goalHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.goalTitle}>{checkedInToday ? "Daily Mission Complete!" : "Daily Check-in Reward"}</Text>
                        <Text style={styles.goalSub}>
                            {checkedInToday ? "You've claimed your 10 points! Keep learning to earn more." : "Claim your 10 daily points and keep your learning streak alive!"}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.checkInBtn, checkedInToday && styles.checkedInBtn]} 
                        onPress={handleCheckIn}
                        disabled={checkedInToday || isCheckinLoading}
                    >
                        {isCheckinLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Zap size={14} color="white" fill={checkedInToday ? "white" : "transparent"} />
                                <Text style={styles.checkInText}>{checkedInToday ? "Done" : "Claim"}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={styles.goalProgressContainer}>
                    <View style={styles.goalHeaderRow}>
                        <Text style={styles.progressLabel}>Learning Progress</Text>
                        <Text style={styles.progressVal}>{Math.min(completedLessons, 2)}/2 subtopics</Text>
                    </View>
                    <View style={styles.goalBarBg}>
                        <Animated.View 
                            style={[styles.goalBarFill, { width: `${(Math.min(completedLessons, 2) / 2) * 100}%` }]} 
                        />
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
        ) : null}

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
            {metrics.map((m, i) => (
                <Animated.View entering={FadeInDown.springify().delay(200 + i * 100)} key={i} style={styles.metricCard}>
                    <View style={[styles.metricIcon, { backgroundColor: m.color + '20' }]}>
                        <m.icon size={20} color={m.color} />
                    </View>
                    <Text style={styles.metricValue}>{m.value}</Text>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                </Animated.View>
            ))}
        </View>

        {/* Newest Modules Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <BookOpen size={20} color="#7c3aed" />
                <Text style={styles.sectionTitle}>{t('home.newest_modules', { defaultValue: 'Newest Modules' })}</Text>
                <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('Main', { screen: 'Modules' })}>
                    <Text style={styles.viewAllText}>{t('view_all', { defaultValue: 'Explore' })}</Text>
                    <ChevronRight size={14} color="#7c3aed" />
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
                {(modules || []).slice(-4).reverse().map((m, i) => {
                    const color = MOD_COLORS[m.code] || "#7c3aed";
                    const isCompleted = progress?.completedModules?.some(id => id.toString() === m._id.toString());
                    const totalSub = m.topics?.reduce((acc, top) => acc + (top.subTopics?.length || 0), 0) || 0;
                    const doneSub = progress?.completedSubTopics?.filter(id => m.topics?.some(topic => topic.subTopics?.some(sub => (sub._id || sub.title) === id))).length || 0;
                    const pct = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;
                    
                    return (
                        <TouchableOpacity key={m._id} style={styles.newModCard} onPress={() => navigation.navigate('Modules', { moduleId: m._id })}>
                             <View style={[styles.newModAccent, { backgroundColor: color }]} />
                             <View style={styles.cardHeaderRow}>
                                <View style={[styles.newModIcon, { backgroundColor: color + '15' }]}>
                                    <BookOpen size={16} color={color} />
                                </View>
                                {i === 0 && (
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newBadgeText}>{t('home.new_badge')}</Text>
                                    </View>
                                )}
                             </View>
                             <Text style={styles.newModCode}>{m.code}</Text>
                             <Text style={styles.newModTitle} numberOfLines={2}>{m.title}</Text>
                             
                             <View style={styles.modProgressContainer}>
                                <View style={styles.miniProgBarBg}>
                                    <View style={[styles.miniProgBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                                </View>
                                <Text style={styles.miniProgText}>{isCompleted ? t('modules.completed') : `${pct}% ${t('home.done')}`}</Text>
                             </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>

        {/* Latest Activity Feed */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Zap size={20} color="#7c3aed" />
                <Text style={styles.sectionTitle}>{t('home.latest_activity')}</Text>
            </View>
            <View style={styles.activityFeed}>
                {user?.points > 0 ? (
                    <Animated.View entering={FadeInRight} style={styles.activityItem}>
                        <View style={[styles.activityIconBox, { backgroundColor: '#10b98115' }]}>
                            <Star size={18} color="#10b981" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityLabel}>{t('home.points_earned')}</Text>
                            <Text style={styles.activitySub}>{t('home.points_earned_msg', { n: user.points })}</Text>
                        </View>
                        <Text style={styles.activityTime}>{t('home.today')}</Text>
                    </Animated.View>
                ) : null}
                {progress?.completedModules?.length > 0 ? (
                    <Animated.View entering={FadeInRight.delay(100)} style={styles.activityItem}>
                        <View style={[styles.activityIconBox, { backgroundColor: '#7c3aed15' }]}>
                            <Award size={18} color="#7c3aed" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityLabel}>{t('home.module_master')}</Text>
                            <Text style={styles.activitySub}>{t('home.module_master_msg', { n: progress.completedModules.length })}</Text>
                        </View>
                        <Text style={styles.activityTime}>{t('home.recent')}</Text>
                    </Animated.View>
                ) : (
                    <View style={styles.emptyActivity}>
                        <Text style={styles.emptyActivityText}>{t('home.activity_start')}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Zap size={20} color="#fbbf24" />
                <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
            </View>
            <View style={styles.actionsGrid}>
                {quickActions.map((action, i) => (
                    <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(action.path)}>
                        <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                            <action.icon size={22} color={action.color} />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Recent Progress */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <RefreshCcw size={18} color="#7c3aed" />
                <Text style={styles.sectionTitle}>{t('dashboard.recent_progress')}</Text>
            </View>
            <View style={styles.progressContainer}>
                {(modules || [])
                    .map(m => {
                        const isCompleted = progress?.completedModules?.some(id => id.toString() === m._id.toString());
                        const totalSub = m.topics?.reduce((acc, top) => acc + (top.subTopics?.length || 0), 0) || 0;
                        const doneSub = progress?.completedSubTopics?.filter(id => m.topics?.some(topic => topic.subTopics?.some(sub => (sub._id || sub.title) === id))).length || 0;
                        const pct = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;
                        return { ...m, pct, isCompleted, totalSub, doneSub };
                    })
                    .filter(m => m.pct > 0 && !m.isCompleted) // Only show active modules
                    .sort((a, b) => b.pct - a.pct) // Show most progressed first
                    .slice(0, 2)
                    .map((m, idx) => (
                        <TouchableOpacity key={m._id} style={styles.progCard} onPress={() => navigation.navigate('Main', { screen: 'Modules' })}>
                            <View style={styles.progHeader}>
                                <Text style={styles.progName} numberOfLines={1}>{m.title}</Text>
                                <Text style={styles.progStatus}>{m.pct}%</Text>
                            </View>
                            <View style={styles.progBarBg}>
                                <View style={[styles.progBarFill, { width: `${m.pct}%`, backgroundColor: '#7c3aed' }]} />
                            </View>
                            <Text style={styles.progSub}>{m.doneSub}/{m.totalSub} subtopics</Text>
                        </TouchableOpacity>
                    ))}
                {(!modules || modules.filter(m => {
                    const totalSub = m.topics?.reduce((acc, top) => acc + (top.subTopics?.length || 0), 0) || 0;
                    const doneSub = progress?.completedSubTopics?.filter(id => m.topics?.some(topic => topic.subTopics?.some(sub => (sub._id || sub.title) === id))).length || 0;
                    const isCompleted = progress?.completedModules?.some(id => id.toString() === m._id.toString());
                    return (totalSub > 0 && Math.round((doneSub / totalSub) * 100) > 0 && !isCompleted);
                }).length === 0) && (
                    <View style={styles.emptyRecent}>
                         <Compass size={30} color="rgba(124, 58, 237, 0.2)" />
                         <Text style={styles.emptyRecentText}>{t('dashboard.no_recent', { defaultValue: 'Start a module to see progress!' })}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Discovery & Inspiration Row */}
        <View style={styles.discoveryRow}>
             <TouchableOpacity style={styles.discoverCard} onPress={() => navigation.navigate('GameCenter')}>
                 <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.discoverGradient}>
                     <Gamepad2 size={24} color="white" />
                     <Text style={styles.discoverTitle}>{t('home.game_center')}</Text>
                     <ChevronRight size={16} color="white" style={styles.discoverChevron} />
                 </LinearGradient>
             </TouchableOpacity>

             <TouchableOpacity style={styles.discoverCard} onPress={() => navigation.navigate('Competition')}>
                 <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.discoverGradient}>
                     <Trophy size={24} color="white" />
                     <Text style={styles.discoverTitle}>{t('home.join_competitions')}</Text>
                     <ChevronRight size={16} color="white" style={styles.discoverChevron} />
                 </LinearGradient>
             </TouchableOpacity>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Award size={22} color="#f59e0b" />
                <Text style={styles.sectionTitle}>{t('achievements')}</Text>
                <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('Main', { screen: 'Profile' })}>
                    <Text style={styles.viewAllText}>{t('view_all')}</Text>
                    <ChevronRight size={14} color="#7c3aed" />
                </TouchableOpacity>
            </View>
            <View style={styles.achievementsCard}>
                {user?.badges?.length > 0 ? (
                    <View style={styles.badgeList}>
                        {user.badges.slice(0, 4).map((badge, i) => (
                            <Animated.View entering={ZoomIn.delay(i * 100)} key={i} style={styles.badge}>
                                <Trophy size={16} color="#fbbf24" />
                                <Text style={styles.badgeText}>{badge}</Text>
                            </Animated.View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyAch}>
                        <Award size={30} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyAchText}>{t('dashboard.no_achievements', { defaultValue: 'Complete modules to earn badges!' })}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Why Choose Learn Rights Features Section */}
        <View style={styles.section}>
            <LinearGradient colors={['rgba(124, 58, 237, 0.05)', 'rgba(124, 58, 237, 0.01)']} style={styles.featuresOutline}>
                <View style={styles.sectionHeader}>
                    <ShieldCheck size={22} color="#7c3aed" />
                    <Text style={styles.sectionTitle}>{t('home.features.title')}</Text>
                </View>
                <Text style={styles.sectionSub}>{t('home.features.subtitle')}</Text>
                
                <View style={styles.featuresGrid}>
                    {[
                        { title: t('home.features.modules.title'), desc: t('home.features.modules.description'), icon: BookOpen, color: '#7c3aed', path: 'Modules' },
                        { title: t('home.features.chatbot.title'), desc: t('home.features.chatbot.description'), icon: Bot, color: '#ec4899', path: 'Bot' },
                        { title: t('home.features.leaderboard.title'), desc: t('home.features.leaderboard.description'), icon: Trophy, color: '#fbbf24', path: 'Rankings' }
                    ].map((feat, i) => (
                        <Animated.View entering={FadeInRight.delay(i * 150)} key={i} style={styles.premiumFeatCard}>
                            <View style={[styles.featIcon, { backgroundColor: feat.color + '15' }]}>
                                <feat.icon size={22} color={feat.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.featTitle}>{feat.title}</Text>
                                <Text style={styles.featDesc}>{feat.desc}</Text>
                                <TouchableOpacity 
                                    style={styles.featBtn} 
                                    onPress={() => {
                                        const tabScreens = ['Home', 'Modules', 'Community', 'Rankings', 'Profile', 'Admin'];
                                        if (tabScreens.includes(feat.path)) {
                                            navigation.navigate('Main', { screen: feat.path });
                                        } else {
                                            navigation.navigate(feat.path);
                                        }
                                    }}
                                >
                                    <View style={styles.featBtnPill}>
                                        <Text style={[styles.featBtnText, { color: feat.color }]}>{t('view_all')}</Text>
                                        <ChevronRight size={12} color={feat.color} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </LinearGradient>
        </View>

        {/* CTA Section */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.ctaCard}>
            <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.ctaTextContent}>
                    <Text style={styles.ctaTitle}>{t('dashboard.cta.title')}</Text>
                    <Text style={styles.ctaDesc}>{t('dashboard.cta.description')}</Text>
                    <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Bot')}>
                        <Text style={styles.ctaBtnText}>{t('dashboard.cta.button')}</Text>
                        <ArrowRight size={18} color="#7c3aed" />
                    </TouchableOpacity>
                </View>
                <Bot size={80} color="rgba(255,255,255,0.15)" style={styles.ctaBotIcon} />
            </LinearGradient>
        </Animated.View>

        <View style={styles.footer}>
             <Text style={styles.footerText}>Learn Rights Mobile v1.0</Text>
             <View style={styles.publicStats}>
                <Text style={styles.statLine}>
                    {publicStats.totalUsers || 0} {t('dashboard.stats.learners')} • {publicStats.totalModules || 0} {t('dashboard.stats.modules')} • {publicStats.totalLanguages || 17} {t('dashboard.stats.langs')}
                </Text>
             </View>
        </View>
      </ScrollView>

      {/* App Tour Modal */}
      <Modal visible={showTour} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <Animated.View entering={ZoomIn} key={tourStep} style={styles.tourCard}>
                  <LinearGradient colors={['#1e1b4b', '#0f0c29']} style={styles.tourInner}>
                      <View style={styles.tourHeader}>
                          <Text style={styles.tourStepText}>
                              {t('tour.step', { defaultValue: 'Step {n} of 5', n: tourStep + 1, total: 5 }).replace('{n}', tourStep + 1).replace('{total}', 5)}
                          </Text>
                          <TouchableOpacity onPress={async () => {
                              setShowTour(false);
                              await AsyncStorage.setItem(`has_seen_tour_${userId}`, 'true');
                          }}>
                              <Text style={styles.tourSkipText}>{t('tour.skip')}</Text>
                          </TouchableOpacity>
                      </View>

                      {tourStep === 0 && (
                          <View style={styles.tourContent}>
                              <View style={styles.tourIconCircle}>
                                  <Compass size={40} color="#7c3aed" />
                              </View>
                              <Text style={styles.tourTitle}>{t('tour.welcome.title')}</Text>
                              <Text style={styles.tourDesc}>{t('tour.welcome.desc')}</Text>
                          </View>
                      )}

                      {tourStep === 1 && (
                          <View style={styles.tourContent}>
                              <View style={[styles.tourIconCircle, { backgroundColor: '#7c3aed20' }]}>
                                  <BookOpen size={40} color="#7c3aed" />
                              </View>
                              <Text style={styles.tourTitle}>{t('tour.modules.title')}</Text>
                              <Text style={styles.tourDesc}>{t('tour.modules.desc')}</Text>
                          </View>
                      )}

                      {tourStep === 2 && (
                          <View style={styles.tourContent}>
                              <View style={[styles.tourIconCircle, { backgroundColor: '#ec489920' }]}>
                                  <Bot size={40} color="#ec4899" />
                              </View>
                              <Text style={styles.tourTitle}>{t('tour.bot.title')}</Text>
                              <Text style={styles.tourDesc}>{t('tour.bot.desc')}</Text>
                          </View>
                      )}

                      {tourStep === 3 && (
                          <View style={styles.tourContent}>
                              <View style={[styles.tourIconCircle, { backgroundColor: '#ef444420' }]}>
                                  <ShieldAlert size={40} color="#ef4444" />
                              </View>
                              <Text style={styles.tourTitle}>{t('tour.safety.title')}</Text>
                              <Text style={styles.tourDesc}>{t('tour.safety.desc')}</Text>
                          </View>
                      )}

                      {tourStep === 4 && (
                          <View style={styles.tourContent}>
                              <View style={[styles.tourIconCircle, { backgroundColor: '#fbbf2420' }]}>
                                  <Users size={40} color="#fbbf24" />
                              </View>
                              <Text style={styles.tourTitle}>{t('tour.community.title')}</Text>
                              <Text style={styles.tourDesc}>{t('tour.community.desc')}</Text>
                          </View>
                      )}

                      <TouchableOpacity 
                          style={styles.tourBtn} 
                          onPress={async () => {
                              if (tourStep < 4) {
                                  setTourStep(tourStep + 1);
                              } else {
                                  setShowTour(false);
                                  await AsyncStorage.setItem(`has_seen_tour_${userId}`, 'true');
                              }
                          }}
                      >
                          <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.tourBtnGradient}>
                              <Text style={styles.tourBtnText}>{tourStep === 4 ? t('tour.finish') : t('tour.next')}</Text>
                              <ChevronRight size={18} color="white" />
                          </LinearGradient>
                      </TouchableOpacity>
                  </LinearGradient>
              </Animated.View>
          </View>
      </Modal>

      {/* Floating Action Button (AI Bot) */}
      <Animated.View entering={ZoomIn.delay(800)} style={styles.fabContainer}>
          <TouchableOpacity 
              style={styles.fab} 
              onPress={() => navigation.navigate('Bot')}
              activeOpacity={0.8}
          >
              <LinearGradient 
                  colors={['#7c3aed', '#5b21b6']} 
                  style={styles.fabGradient}
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }}
              >
                  <Bot size={28} color="white" />
                  <View style={styles.fabBadge} />
              </LinearGradient>
          </TouchableOpacity>
      </Animated.View>

      {/* SOS Onboarding Prompt Modal */}
      <Modal visible={showSOSPrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <Animated.View entering={ZoomIn} style={styles.sosModalCard}>
                <LinearGradient colors={['#1e1b4b', '#0f0c29']} style={styles.sosModalInner}>
                    <View style={styles.sosModalIcon}>
                        <ShieldAlert size={40} color="#ef4444" />
                    </View>
                    <Text style={styles.sosModalTitle}>{t('safety.setup_needed', { defaultValue: 'Security Setup Needed' })}</Text>
                    <Text style={styles.sosModalDesc}>
                        {t('safety.setup_desc', { defaultValue: 'To ensure your safety, please enable the following features:' })}
                    </Text>

                    <View style={styles.sosChecklist}>
                        <View style={styles.checkItem}>
                            {shakeEnabled ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
                            <Text style={[styles.checkText, shakeEnabled && styles.checkTextDone]}>
                                {t('safety.shake_trigger')} {shakeEnabled ? t('safety.enabled') : t('safety.disabled')}
                            </Text>
                        </View>
                        <View style={styles.checkItem}>
                            {isVoiceTriggerEnabled ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
                            <Text style={[styles.checkText, isVoiceTriggerEnabled && styles.checkTextDone]}>
                                {t('safety.voice_trigger')} {isVoiceTriggerEnabled ? t('safety.enabled') : t('safety.disabled')}
                            </Text>
                        </View>
                        <View style={styles.checkItem}>
                            {user?.emergencyContacts?.some(c => c.name && c.mobile) ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
                            <Text style={[styles.checkText, user?.emergencyContacts?.some(c => c.name && c.mobile) && styles.checkTextDone]}>
                                {t('safety.contacts')} {user?.emergencyContacts?.some(c => c.name && c.mobile) ? t('safety.added') : t('safety.missing')}
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.sosModalBtn} onPress={handleActivateSOS}>
                        <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.sosModalBtnGradient}>
                            <Text style={styles.sosModalBtnText}>{t('safety.enable_all', { defaultValue: 'Enable Quick Triggers' })}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.sosModalBtn, { marginTop: 0, marginBottom: 15 }]} 
                        onPress={() => {
                            setShowSOSPrompt(false);
                            navigation.navigate('Main', { screen: 'Profile', params: { tab: 'safety' } });
                        }}
                    >
                        <View style={[styles.sosModalBtnGradient, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                            <Text style={styles.sosModalBtnText}>{t('safety.go_to_settings', { defaultValue: 'Configure Contacts' })}</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <Pressable onPress={handleDismissSOS} style={styles.sosModalSkip}>
                        <Text style={styles.sosModalSkipText}>{t('maybe_later', { defaultValue: 'Maybe Later' })}</Text>
                    </Pressable>
                </LinearGradient>
            </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  orb: { position: 'absolute', borderRadius: 150 },
  scrollContent: { paddingTop: 20, paddingBottom: 100, paddingHorizontal: 20 },
  header: { marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 },
  userName: { color: 'white', fontSize: 26, fontWeight: '800' },
  bellBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  bellDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed', borderWidth: 1.5, borderColor: '#0f0c29' },
  banner: { padding: 22, backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 25, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)', height: 100, justifyContent: 'center' },
  bannerQuote: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  metricCard: { width: (width - 55) / 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 22, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  metricIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricValue: { color: 'white', fontSize: 22, fontWeight: '800' },
  metricLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 35 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: '700', flex: 1 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { color: '#7c3aed', fontSize: 13, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  actionCard: { width: (width - 52) / 2, height: 100, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 22, padding: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  actionIcon: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { color: 'white', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  progressContainer: { gap: 12 },
  progCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progName: { color: 'white', fontSize: 16, fontWeight: '700', flex: 1 },
  progStatus: { fontSize: 14, fontWeight: '800' },
  progBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 10 },
  progBarFill: { height: '100%', borderRadius: 3 },
  progSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  achievementsCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 25, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  badgeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' },
  badgeText: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
  emptyAch: { alignItems: 'center', paddingVertical: 10 },
  emptyAchText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 10 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statLine: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 5 },
  featuresGrid: { gap: 12, marginTop: 10 },
  featureCard: { flexDirection: 'row', gap: 15, padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  featIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  featTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  featDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4, lineHeight: 18 },
  featBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  featBtnText: { fontSize: 12, fontWeight: '700' },
  sectionSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 15, lineHeight: 20 },
  ctaCard: { marginBottom: 40, borderRadius: 30, overflow: 'hidden', elevation: 12, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  ctaGradient: { padding: 30, flexDirection: 'row', alignItems: 'center' },
  ctaTextContent: { flex: 1, zIndex: 1 },
  ctaTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 10, letterSpacing: 0.5 },
  ctaDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 25, lineHeight: 22, fontWeight: '500' },
  ctaBtn: { backgroundColor: 'white', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 12, elevation: 5 },
  ctaBtnText: { color: '#7c3aed', fontSize: 16, fontWeight: '800' },
  ctaBotIcon: { position: 'absolute', right: -15, bottom: -20, opacity: 0.2 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, marginBottom: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  errorText: { color: 'white', fontSize: 12, flex: 1, fontWeight: '600' },
  horizScroll: { paddingRight: 20, gap: 15, paddingVertical: 10 },
  newModCard: { width: 160, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  newModAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  newModIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  newBadge: { backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newBadgeText: { color: 'white', fontSize: 8, fontWeight: '900' },
  newModCode: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  newModTitle: { color: 'white', fontSize: 14, fontWeight: '700', lineHeight: 18, height: 36 },
  modProgressContainer: { marginTop: 15 },
  miniProgBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 6 },
  miniProgBarFill: { height: '100%', borderRadius: 2 },
  miniProgText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600' },
  emptyRecent: { padding: 30, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 25, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  emptyRecentText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 10, textAlign: 'center' },
  discoveryRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
  discoverCard: { flex: 1, height: 120, borderRadius: 25, overflow: 'hidden', elevation: 5 },
  discoverGradient: { flex: 1, padding: 20, justifyContent: 'space-between' },
  discoverTitle: { color: 'white', fontSize: 15, fontWeight: '800' },
  discoverChevron: { alignSelf: 'flex-end' },
  featuresOutline: { padding: 20, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.1)' },
  premiumFeatCard: { flexDirection: 'row', gap: 15, padding: 18, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center', marginBottom: 10 },
  featBtnPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  syncBtn: { backgroundColor: '#38bdf8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  syncBtnText: { color: '#0f172a', fontSize: 11, fontWeight: '800' },
  fabContainer: { position: 'absolute', bottom: 30, right: 20, zIndex: 1000 },
  fab: { 
      width: 60, 
      height: 60, 
      borderRadius: 30, 
      elevation: 8, 
      shadowColor: '#7c3aed', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.4, 
      shadowRadius: 10 
  },
  fabGradient: { 
      width: '100%', 
      height: '100%', 
      borderRadius: 30, 
      justifyContent: 'center', 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  fabBadge: { 
      position: 'absolute', 
      top: 15, 
      right: 15, 
      width: 10, 
      height: 10, 
      borderRadius: 5, 
      backgroundColor: '#10b981', 
      borderWidth: 2, 
      borderColor: 'white' 
  },
  activityFeed: { gap: 12 },
  activityItem: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activityIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  activityLabel: { color: 'white', fontSize: 14, fontWeight: '700' },
  activitySub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  activityTime: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '700' },
  emptyActivity: { padding: 20, alignItems: 'center' },
  emptyActivityText: { color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: '600' },
  // SOS Home Button
  emergencySosBtn: { marginBottom: 20 },
  sosInner: { height: 50, borderRadius: 15, overflow: 'hidden', elevation: 5 },
  sosGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  sosBtnText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  // Goal Card Styles
  goalCard: { marginBottom: 25, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  goalInner: { padding: 20 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  goalTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  goalSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  goalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  goalBadgeText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
  goalProgressContainer: { gap: 10 },
  goalBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  goalBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#7c3aed' },
  progressLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  progressVal: { color: '#7c3aed', fontSize: 13, fontWeight: '800' },
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  checkInBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7c3aed', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, elevation: 5 },
  checkedInBtn: { backgroundColor: '#10b981' },
  checkInText: { color: 'white', fontWeight: '800', fontSize: 13 },
  // SOS Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  sosModalCard: { width: '100%', borderRadius: 35, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  sosModalInner: { padding: 35, alignItems: 'center' },
  sosModalIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  sosModalTitle: { color: 'white', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  sosModalDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  sosModalBtn: { width: '100%', height: 60, borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  sosModalBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sosModalBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  sosModalSkip: { padding: 10 },
  sosModalSkipText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  sosChecklist: { width: '100%', marginBottom: 30, gap: 12 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 15 },
  checkText: { color: 'white', fontSize: 14, fontWeight: '600' },
  checkTextDone: { color: 'rgba(255,255,255,0.4)', textDecorationLine: 'line-through' },
  // Tour Styles
  tourCard: { width: width * 0.85, borderRadius: 30, overflow: 'hidden', elevation: 20 },
  tourInner: { padding: 30 },
  tourHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tourStepText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
  tourSkipText: { color: '#7c3aed', fontSize: 13, fontWeight: '700' },
  tourContent: { alignItems: 'center', marginVertical: 20 },
  tourIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(124, 58, 237, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  tourTitle: { color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  tourDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  tourBtn: { height: 55, borderRadius: 15, overflow: 'hidden', marginTop: 10 },
  tourBtnGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  tourBtnText: { color: 'white', fontSize: 16, fontWeight: '800' }
});

export default HomeScreen;

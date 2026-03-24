import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Gamepad2, Brain, Search, Trophy, Zap, Star, Clock } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const GameCenterScreen = ({ navigation }) => {
    const [timeLeft, setTimeLeft] = React.useState('');

    React.useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow - now;
            
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const games = [
        {
            id: 'match',
            title: t('home.rights_match'),
            subtitle: t('home.rights_match_sub'),
            icon: Brain,
            color: '#7c3aed',
            points: '50 XP',
            screen: 'RightsMatch',
            isDaily: true
        },
        {
            id: 'scenario',
            title: t('home.legal_detective'),
            subtitle: t('home.legal_detective_sub'),
            icon: Search,
            color: '#ec4899',
            points: '100 XP',
            screen: 'ScenarioGame',
            isDaily: true
        },
        {
            id: 'quiz',
            title: t('home.lightning_quiz'),
            subtitle: t('home.lightning_quiz_sub'),
            icon: Zap,
            color: '#f59e0b',
            points: '30 XP',
            screen: 'LightningQuiz',
            isDaily: true
        }
    ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('home.game_center')}</Text>
                    <Text style={styles.headerSub}>{t('home.ai_refresh_note')}</Text>
                </View>
                <View style={styles.headerIcon}>
                    <Gamepad2 size={24} color="#7c3aed" />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp} style={styles.timerCard}>
                    <LinearGradient colors={['rgba(124, 58, 237, 0.1)', 'rgba(0,0,0,0)']} style={styles.timerGradient}>
                        <Clock size={16} color="#a78bfa" />
                        <Text style={styles.timerLabel}>{t('home.next_reset')}</Text>
                        <Text style={styles.timerValue}>{timeLeft}</Text>
                    </LinearGradient>
                </Animated.View>

                <Animated.View entering={FadeInUp} style={styles.featuredCard}>
                    <TouchableOpacity onPress={() => navigation.navigate('WeeklyChallenge')}>
                        <LinearGradient colors={['#f59e0b', '#b45309']} style={styles.featuredGradient}>
                            <View style={styles.featuredInfo}>
                                <View style={styles.featuredBadge}>
                                    <Trophy size={12} color="#f59e0b" fill="#f59e0b" />
                                    <Text style={styles.featuredBadgeText}>{t('home.weekly_challenge_badge')}</Text>
                                </View>
                                <Text style={styles.featuredTitle}>{t('home.ai_mastery_title')}</Text>
                                <Text style={styles.featuredDesc}>{t('home.ai_mastery_desc')}</Text>
                                <View style={styles.progressRow}>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: '100%', backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                                    </View>
                                    <Text style={styles.progressText}>250 XP Prize</Text>
                                </View>
                            </View>
                            <Trophy size={60} color="rgba(255,255,255,0.2)" style={styles.trophyBg} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('home.daily_games')}</Text>
                    <View style={styles.aiBadge}>
                        <Brain size={12} color="#7c3aed" />
                        <Text style={styles.aiBadgeText}>{t('home.ai_generated_badge')}</Text>
                    </View>
                </View>

                <View style={styles.gameGrid}>
                    {games.map((game, index) => (
                        <Animated.View key={game.id} entering={FadeInRight.delay(index * 100)}>
                            <TouchableOpacity 
                                style={styles.gameCard}
                                onPress={() => navigation.navigate(game.screen)}
                            >
                                <View style={[styles.iconBox, { backgroundColor: game.color + '15' }]}>
                                    <game.icon size={28} color={game.color} />
                                </View>
                                <View style={styles.gameInfo}>
                                    <View style={styles.gameTitleRow}>
                                        <Text style={styles.gameTitle}>{game.title}</Text>
                                        {game.isDaily && (
                                            <View style={styles.dailyDot} />
                                        )}
                                    </View>
                                    <Text style={styles.gameSub}>{game.subtitle}</Text>
                                </View>
                                <View style={styles.pointBadge}>
                                    <Star size={10} color="#fbbf24" fill="#fbbf24" />
                                    <Text style={styles.pointText}>{game.points}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.footerNote}>
                    <Text style={styles.footerText}>{t('home.midnight_refresh_note')}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7c3aed15', borderRadius: 12 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    timerCard: { marginBottom: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.2)' },
    timerGradient: { paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
    timerLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
    timerValue: { color: '#a78bfa', fontSize: 12, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    featuredCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 30, elevation: 5 },
    featuredGradient: { padding: 24, flexDirection: 'row', alignItems: 'center' },
    featuredInfo: { flex: 1 },
    featuredBadge: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
    featuredBadgeText: { color: '#b45309', fontSize: 10, fontWeight: '900' },
    featuredTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
    featuredDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 5, lineHeight: 18 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 3 },
    progressBarFill: { height: '100%', backgroundColor: 'white', borderRadius: 3 },
    progressText: { color: 'white', fontSize: 11, fontWeight: '700' },
    trophyBg: { position: 'absolute', right: 10, bottom: -10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(124, 58, 237, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    aiBadgeText: { color: '#a78bfa', fontSize: 10, fontWeight: '800' },
    gameGrid: { gap: 15 },
    gameCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    iconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    gameInfo: { flex: 1, marginLeft: 16 },
    gameTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dailyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
    gameTitle: { color: 'white', fontSize: 17, fontWeight: '700' },
    gameSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
    pointBadge: { backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
    pointText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
    footerNote: { alignItems: 'center', marginTop: 40 },
    footerText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: '600' }
});

export default GameCenterScreen;

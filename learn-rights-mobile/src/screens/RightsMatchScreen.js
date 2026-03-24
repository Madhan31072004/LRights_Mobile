import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Brain, RefreshCw, Star, Trophy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, withSequence, withSpring, FadeInUp, ZoomIn } from 'react-native-reanimated';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';
import AIExplanationModal from '../components/AIExplanationModal';

const { width } = Dimensions.get('window');

// Initial static cards as fallback
const STATIC_CARDS = [
    { id: 1, type: 'right', content: 'Right to Education', matchId: 101 },
    { id: 101, type: 'desc', content: 'Ensures free & compulsory primary school', matchId: 1 },
    { id: 2, type: 'right', content: 'Equal Pay', matchId: 102 },
    { id: 102, type: 'desc', content: 'No wage discrimination based on gender', matchId: 2 },
    { id: 3, type: 'right', content: 'Inheritance', matchId: 103 },
    { id: 103, type: 'desc', content: 'Equal share in ancestral property', matchId: 3 },
    { id: 4, type: 'right', content: 'Maternity Benefit', matchId: 104 },
    { id: 104, type: 'desc', content: 'Paid leave during and after pregnancy', matchId: 4 },
    { id: 5, type: 'right', content: 'Cyber Safety', matchId: 105 },
    { id: 105, type: 'desc', content: 'Protection against online harassment', matchId: 5 },
    { id: 6, type: 'right', content: 'Domestic Peace', matchId: 106 },
    { id: 106, type: 'desc', content: 'Legal protection from household abuse', matchId: 6 },
];

const Card = ({ item, isFlipped, isSolved, onPress }) => {
    const flipAnim = useSharedValue(0);
    const scaleAnim = useSharedValue(1);

    useEffect(() => {
        flipAnim.value = withTiming(isFlipped || isSolved ? 180 : 0, { duration: 300 });
    }, [isFlipped, isSolved]);

    useEffect(() => {
        if (isSolved) {
            scaleAnim.value = withSequence(
                withTiming(1.1, { duration: 150 }),
                withTiming(1, { duration: 150 })
            );
        }
    }, [isSolved]);

    const frontStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${flipAnim.value}deg` }, { scale: scaleAnim.value }],
        backfaceVisibility: 'hidden',
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${flipAnim.value - 180}deg` }, { scale: scaleAnim.value }],
        backfaceVisibility: 'hidden',
    }));

    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={isFlipped || isSolved}
            style={styles.cardContainer}
        >
            <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
                <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.cardGradient}>
                    <Brain size={24} color="rgba(255,255,255,0.4)" />
                </LinearGradient>
            </Animated.View>
            <Animated.View style={[styles.card, styles.cardBack, isSolved && styles.solvedCard, backStyle]}>
                <Text style={styles.cardText}>{item.content}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const MODULE_VARIETY = [
    'domestic-violence', 'workplace-harassment', 'property-rights', 
    'paternity-rights', 'marriage-laws', 'cyber-safety', 'education-rights',
    'maternity-benefits', 'equal-pay-act', 'criminal-law-amendments',
    'inheritance-laws', 'consumer-protection', 'labor-rights-for-women'
];

const RightsMatchScreen = ({ navigation, route }) => {
    const { userId, language } = useUser();
    const routeModuleId = route?.params?.moduleId;
    const [shuffledCards, setShuffledCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [solvedIds, setSolvedIds] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [saving, setSaving] = useState(false);
    const [wonPoints, setWonPoints] = useState(0);

    const [loading, setLoading] = useState(true);
    const [explanationModalVisible, setExplanationModalVisible] = useState(false);
    const [explanationText, setExplanationText] = useState('');
    const [explanationLoading, setExplanationLoading] = useState(false);

    const initGame = async () => {
        setLoading(true);
        setGameOver(false);
        setFlippedIndices([]);
        setSolvedIds([]);
        setMoves(0);
        
        try {
            const randomModule = MODULE_VARIETY[Math.floor(Math.random() * MODULE_VARIETY.length)];
            const activeModule = routeModuleId || randomModule;

            const res = await API.post('/ai/game/match', {
                moduleId: activeModule,
                lang: language || 'en'
            });
            const cards = Array.isArray(res.data) ? res.data : [];
            if (cards.length === 0) throw new Error("No cards returned");
            
            // Limit to 12 cards (6 pairs)
            const limitedCards = cards.slice(0, 12);
            const shuffled = [...limitedCards].sort(() => Math.random() - 0.5);
            setShuffledCards(shuffled);
        } catch (err) {
            console.error("Failed to fetch AI match cards:", err);
            const shuffled = [...STATIC_CARDS].sort(() => Math.random() - 0.5);
            setShuffledCards(shuffled);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            initGame();
        }, [routeModuleId])
    );

    const handlePress = (index) => {
        if (flippedIndices.length === 2) return;
        if (flippedIndices.includes(index)) return;

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const firstCard = shuffledCards[newFlipped[0]];
            const secondCard = shuffledCards[newFlipped[1]];

            if (firstCard.matchId === secondCard.id) {
                setSolvedIds([...solvedIds, firstCard.id, secondCard.id]);
                setFlippedIndices([]); // Reset so next pair can be flipped
                if (solvedIds.length + 2 === shuffledCards.length) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setGameOver(true);
                    completeGame();
                } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
            } else {
                setTimeout(() => setFlippedIndices([]), 1000);
            }
        }
    };

    const completeGame = async () => {
        setSaving(true);
        try {
            const res = await API.post('/games/score', {
                userId,
                gameType: 'memory_match',
                score: 100
            });
            if (res.data.dailyLimitReached) {
                setWonPoints(0);
            } else {
                setWonPoints(res.data.pointsAdded || 10);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleLearnMore = async () => {
        setExplanationModalVisible(true);
        setExplanationLoading(true);
        try {
            const context = `The user just matched several legal rights in a memory game. 
Rights involved: ${shuffledCards.filter(c => c.type === 'right').map(c => c.content).join(', ')}.
Provide a summary of these rights and their importance in Indian Law.`;
            
            const res = await API.post('/ai/game/explain', {
                message: context,
                lang: language || 'en'
            });
            setExplanationText(res.data.explanation);
        } catch (err) {
            console.error("Failed to fetch AI explanation:", err);
            setExplanationText(t('chatbot.error'));
        } finally {
            setExplanationLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('home.rights_match')}</Text>
                    <Text style={styles.headerSub}>{t('home.rights_match_sub')}</Text>
                </View>
                <TouchableOpacity onPress={initGame} style={styles.refreshBtn}>
                    <RefreshCw size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.statsRow}>
                    <View style={styles.statChip}>
                        <Text style={styles.statLabel}>{t('game.moves')}:</Text>
                        <Text style={styles.statVal}>{moves}</Text>
                    </View>
                    <View style={styles.statChip}>
                        <Text style={styles.statLabel}>{t('game.solved')}:</Text>
                        <Text style={styles.statVal}>{solvedIds.length / 2} / {Math.max(1, shuffledCards.length / 2)}</Text>
                    </View>
                </View>

                <View style={styles.gameBoard}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#7c3aed" />
                    ) : shuffledCards.length === 0 ? (
                        <Text style={styles.emptyText}>{t('game.no_cards')}</Text>
                    ) : (
                        shuffledCards.map((item, index) => (
                            <Card 
                                key={`${item.id}-${index}`}
                                item={item}
                                isFlipped={flippedIndices.includes(index)}
                                isSolved={solvedIds.includes(item.id)}
                                onPress={() => handlePress(index)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {gameOver && (
                <Modal visible={gameOver} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={ZoomIn.duration(600).springify()} style={styles.winModalCard}>
                            <LinearGradient colors={['#1e1b4b', '#0f0c29']} style={styles.winModalInner}>
                                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.trophyContainer}>
                                    <View style={styles.trophyGlow} />
                                    <Trophy size={80} color="#fbbf24" style={styles.trophyIcon} />
                                </Animated.View>

                                <Text style={styles.winTitle}>{t('game.victory')}</Text>
                                <Text style={styles.winSubText}>
                                    {t('game.win_moves', { defaultValue: 'Solved in {moves} moves', moves: moves }).replace('{moves}', moves)}
                                </Text>

                                <View style={styles.pointsCard}>
                                    <Text style={styles.pointsLabel}>{t('dashboard.total_points')}</Text>
                                    <View style={styles.pointsRow}>
                                        <Star size={24} color="#fbbf24" fill="#fbbf24" />
                                        <Text style={styles.pointsValue}>+{wonPoints}</Text>
                                    </View>
                                    {wonPoints === 0 && <Text style={styles.limitText}>{t('game.match_win_limit')}</Text>}
                                </View>

                                <View style={styles.winActions}>
                                    <TouchableOpacity style={styles.primaryBtn} onPress={initGame}>
                                        <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.btnGradient}>
                                            <RefreshCw size={20} color="white" />
                                            <Text style={styles.btnText}>{t('game.play_again')}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
                                        <Text style={styles.secondaryBtnText}>{t('game.weekly.back')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.learnMoreLink} onPress={handleLearnMore}>
                                        <Brain size={18} color="#7c3aed" />
                                        <Text style={styles.learnMoreLinkText}>{t('game.review_facts')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    </View>
                </Modal>
            )}

            {saving && <ActivityIndicator style={styles.saver} color="#7c3aed" />}

            <AIExplanationModal 
                visible={explanationModalVisible}
                onClose={() => setExplanationModalVisible(false)}
                explanation={explanationText}
                loading={explanationLoading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    refreshBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginVertical: 20 },
    statChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
    statVal: { color: '#7c3aed', fontSize: 15, fontWeight: '800' },
    emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, textAlign: 'center', marginTop: 50, width: '100%' },
    gameBoard: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15, 
        paddingBottom: 40,
        gap: 10 
    },
    scrollContent: { paddingTop: 10 },
    cardContainer: { width: (width - 40) / 2, height: (width - 40) / 2.5 },
    card: { width: '100%', height: '100%', borderRadius: 20, position: 'absolute', justifyContent: 'center', alignItems: 'center', padding: 10 },
    cardFront: { backgroundColor: '#1a1744', borderWidth: 2, borderColor: '#7c3aed40' },
    cardGradient: { width: '100%', height: '100%', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    cardBack: { backgroundColor: '#7c3aed', borderWidth: 2, borderColor: 'white' },
    solvedCard: { opacity: 0.6, borderColor: '#10b981' },
    cardText: { color: 'white', fontSize: 13, fontWeight: '800', textAlign: 'center' },
    summaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
    saver: { position: 'absolute', bottom: 40, alignSelf: 'center' },
    // Win Modal Styles
    winModalCard: { width: width * 0.9, borderRadius: 35, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
    winModalInner: { padding: 30, alignItems: 'center' },
    trophyContainer: { marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
    trophyGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(251, 191, 36, 0.15)', blur: 20 },
    trophyIcon: { zIndex: 1 },
    winTitle: { color: 'white', fontSize: 28, fontWeight: '900', textAlign: 'center' },
    winSubText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, marginTop: 8, textAlign: 'center' },
    pointsCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 25, padding: 20, width: '100%', alignItems: 'center', marginVertical: 25, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    pointsLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10 },
    pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pointsValue: { color: '#fbbf24', fontSize: 36, fontWeight: '900' },
    limitText: { color: '#ef4444', fontSize: 11, marginTop: 10, fontWeight: '600' },
    winActions: { width: '100%', gap: 12 },
    primaryBtn: { height: 60, borderRadius: 20, overflow: 'hidden', elevation: 8 },
    btnGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    btnText: { color: 'white', fontSize: 16, fontWeight: '800' },
    secondaryBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    secondaryBtnText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, fontWeight: '700' },
    learnMoreLink: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 10 },
    learnMoreLinkText: { color: '#7c3aed', fontSize: 14, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default RightsMatchScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Scale, ShieldCheck, Star, ArrowRight, Trophy, Brain } from 'lucide-react-native';
import { t } from '../utils/translation';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import AIExplanationModal from '../components/AIExplanationModal';

const { width } = Dimensions.get('window');

const MODULE_VARIETY = [
    'domestic-violence', 'workplace-harassment', 'property-rights', 
    'cyber-safety', 'family-law', 'public-safety', 'police-procedures',
    'fundamental-rights', 'directive-principles', 'equal-opportunity'
];

const ScenarioGameScreen = ({ navigation, route }) => {
    const { userId, language } = useUser();
    const routeModuleId = route?.params?.moduleId;
    const [scenarios, setScenarios] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [explanationModalVisible, setExplanationModalVisible] = useState(false);
    const [explanationText, setExplanationText] = useState('');
    const [explanationLoading, setExplanationLoading] = useState(false);

    const current = scenarios[currentIndex];

    const fetchScenarios = async () => {
        setLoading(true);
        try {
            const randomModule = MODULE_VARIETY[Math.floor(Math.random() * MODULE_VARIETY.length)];
            const activeModule = routeModuleId || randomModule;

            const res = await API.post('/ai/game/scenario', {
                moduleId: activeModule,
                lang: language || 'en'
            });
            if (Array.isArray(res.data)) {
                setScenarios(res.data);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Failed to fetch AI scenarios:", err);
            Alert.alert('Error', 'Failed to load AI scenarios. Using fallback.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchScenarios();
        }, [routeModuleId])
    );

    const handleOptionSelect = (option) => {
        if (selectedOption) return;
        setSelectedOption(option);
        setShowFeedback(true);
        setScore(prev => prev + option.points);
    };

    const nextScenario = () => {
        if (currentIndex + 1 < scenarios.length) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            setGameOver(true);
            saveFinalScore();
        }
    };

    const resetGame = async () => {
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
        setShowFeedback(false);
        setGameOver(false);
        await fetchScenarios();
    };

    const handleLearnMore = async () => {
        setExplanationModalVisible(true);
        setExplanationLoading(true);
        try {
            const context = `Scenario: ${current.title}\nDescription: ${current.description}\nUser Picked: ${selectedOption.text}\nFeedback given: ${selectedOption.feedback}`;
            
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

    const saveFinalScore = async () => {
        try {
            const res = await API.post('/games/score', {
                userId,
                gameType: 'scenario_challenge',
                score: score
            });
            if (res.data.dailyLimitReached) {
                Alert.alert(t('game.daily_xp_cap'), t('game.daily_xp_cap_msg'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator color="#7c3aed" /></View>;


    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('home.legal_detective')}</Text>
                    <Text style={styles.headerSub}>{t('home.legal_detective_sub')}</Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.scoreText}>{score}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {scenarios.length === 0 && !loading ? (
                    <View style={styles.gameOverCard}>
                        <Text style={styles.gameOverSub}>{t('game.no_scenarios')}</Text>
                        <TouchableOpacity style={styles.playAgainBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.playAgainText}>{t('welcome.get_started')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : !gameOver ? (
                    <Animated.View entering={FadeInUp} key={currentIndex}>
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressLabel}>{t('game.challenge_n_of_m', { n: currentIndex + 1, m: scenarios.length })}</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / scenarios.length) * 100}%` }]} />
                            </View>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Scale size={24} color="#7c3aed" />
                                <Text style={styles.cardTitle}>{current.title}</Text>
                            </View>
                            <Text style={styles.description}>{current.description}</Text>
                        </View>

                        <Text style={styles.instruction}>{t('game.choose_path')}</Text>

                        <View style={styles.optionsList}>
                            {current.options.map((option, idx) => {
                                const isSelected = selectedOption === option;
                                const isCorrect = option.points >= 50;
                                return (
                                    <TouchableOpacity 
                                        key={idx} 
                                        style={[
                                            styles.optionBtn,
                                            isSelected && (isCorrect ? styles.correctOption : styles.incorrectOption)
                                        ]}
                                        onPress={() => handleOptionSelect(option)}
                                        disabled={!!selectedOption}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{option.text}</Text>
                                        {isSelected && (
                                            <ShieldCheck size={20} color="white" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {showFeedback && (
                            <Animated.View entering={FadeIn} style={styles.feedbackBox}>
                                <Text style={styles.feedbackTitle}>{selectedOption.points >= 50 ? t('game.excellent_choice') : t('game.room_improvement')}</Text>
                                <Text style={styles.feedbackText}>{selectedOption.feedback}</Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.learnMoreBtn} onPress={handleLearnMore}>
                                        <Brain size={18} color="#7c3aed" />
                                        <Text style={styles.learnMoreText}>{t('game.legal_insight')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.nextBtnSmall} onPress={nextScenario}>
                                        <Text style={styles.nextBtnText}>{currentIndex + 1 === scenarios.length ? t('game.view_result') : t('game.next_case')}</Text>
                                        <ArrowRight size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInUp} style={styles.gameOverCard}>
                        <Trophy size={80} color="#fbbf24" style={{ marginBottom: 20 }} />
                        <Text style={styles.winTitle}>{t('game.case_closed')}</Text>
                        <Text style={styles.winSub}>Performance: {score >= 100 ? 'Expert Detective' : 'Junior Investigator'}</Text>
                        
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryText}>Total Legal Points: {score}</Text>
                            <Text style={styles.summaryText}>Efficiency: {Math.round((score / (scenarios.length * 50)) * 100)}%</Text>
                        </View>

                        <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
                            <Text style={styles.playAgainText}>{t('game.play_again')}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.playAgainBtn, { backgroundColor: 'rgba(255,255,255,0.05)', marginTop: 15 }]} onPress={() => navigation.goBack()}>
                            <Text style={styles.playAgainText}>{t('game.weekly.back')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </ScrollView>

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
    scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    scoreText: { color: '#fbbf24', fontWeight: '800' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    progressContainer: { marginBottom: 25 },
    progressLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', marginBottom: 8 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3 },
    progressBarFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 3 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 25 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
    cardTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    description: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 24 },
    instruction: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 15, marginLeft: 5 },
    optionsList: { gap: 12 },
    optionBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    optionText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600', flex: 1 },
    selectedOptionText: { color: 'white' },
    correctOption: { backgroundColor: '#10b981', borderColor: '#10b981' },
    incorrectOption: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    feedbackBox: { marginTop: 30, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
    feedbackTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 8 },
    feedbackText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22 },
    nextBtn: { marginTop: 20, backgroundColor: '#7c3aed', borderRadius: 15, height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    nextBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    learnMoreBtn: { flex: 1, backgroundColor: 'rgba(124,58,237,0.1)', height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
    learnMoreText: { color: '#7c3aed', fontWeight: '800', fontSize: 15 },
    nextBtnSmall: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 15, height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    gameOverCard: { alignItems: 'center', marginTop: 50, padding: 30 },
    gameOverTitle: { color: 'white', fontSize: 32, fontWeight: '900', marginTop: 20 },
    gameOverSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', marginTop: 10, lineHeight: 24 },
    finishBtn: { marginTop: 40, backgroundColor: '#10b981', paddingHorizontal: 30, paddingVertical: 18, borderRadius: 20 },
    finishBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    summaryBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 15, marginVertical: 20, width: '100%', alignItems: 'center', gap: 8 },
    summaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29' }
});

export default ScenarioGameScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Zap, Trophy, RefreshCcw, Star, Brain } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn, withSpring } from 'react-native-reanimated';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';
import AIExplanationModal from '../components/AIExplanationModal';

const { width } = Dimensions.get('window');

const MODULE_VARIETY = [
    'rights-and-duties', 'constitution', 'criminal-laws', 'consumer-rights', 
    'labor-laws', 'environmental-law', 'digital-rights', 'electoral-laws',
    'human-rights-commissions', 'legal-aid-services'
];

const LightningQuizScreen = ({ navigation, route }) => {
    const { userId, language } = useUser();
    const routeModuleId = route?.params?.moduleId;
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [explanationModalVisible, setExplanationModalVisible] = useState(false);
    const [explanationText, setExplanationText] = useState('');
    const [explanationLoading, setExplanationLoading] = useState(false);

    const q = questions[currentQ];

    const fetchQuestions = async () => {
        setLoading(true);
        setGameOver(false);
        setCurrentQ(0);
        setScore(0);
        setAnswered(false);
        setSelectedIdx(null);
        
        try {
            const randomModule = MODULE_VARIETY[Math.floor(Math.random() * MODULE_VARIETY.length)];
            const activeModule = routeModuleId || randomModule;

            const res = await API.post('/ai/game/lightning-quiz', {
                moduleId: activeModule,
                lang: language || 'en'
            });
            if (Array.isArray(res.data)) {
                setQuestions(res.data);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Failed to fetch AI lightning questions:", err);
            // Fallback would be handled by backend, but let's ensure we have something
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchQuestions();
        }, [routeModuleId])
    );

    const handleAnswer = (idx) => {
        if (answered) return;
        setSelectedIdx(idx);
        setAnswered(true);
        if (idx === questions[currentQ].correctAnswer) {
            setScore(s => s + 10);
        }
    };

    const nextQuestion = () => {
        if (currentQ + 1 < questions.length) {
            setCurrentQ(currentQ + 1);
            setAnswered(false);
            setSelectedIdx(null);
        } else {
            setGameOver(true);
            saveScore();
        }
    };

    const handleLearnMore = async () => {
        setExplanationModalVisible(true);
        setExplanationLoading(true);
        try {
            const currentQuestion = questions[currentQ];
            const context = `Question: ${currentQuestion.question}\nOptions: ${currentQuestion.options.join(', ')}\nUser Answer: ${currentQuestion.options[selectedIdx]}\nCorrect Answer: ${currentQuestion.options[currentQuestion.correctAnswer]}`;
            
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

    const saveScore = async () => {
        try {
            const res = await API.post('/games/score', {
                userId,
                gameType: 'lightning_quiz',
                score: score
            });
            if (res.data.dailyLimitReached) {
                Alert.alert(t('game.daily_xp_cap'), t('game.daily_xp_cap_msg'));
            }
        } catch (err) {
            console.error("Score save error:", err);
        }
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator color="#f59e0b" size="large" /></View>;


    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('home.lightning_quiz')}</Text>
                    <Text style={styles.headerSub}>{t('game.ai_gen_challenge')}</Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.scoreText}>{score}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {questions.length === 0 && !loading ? (
                    <View style={styles.winOverlay}>
                        <Text style={styles.winSub}>{t('game.no_questions')}</Text>
                        <TouchableOpacity style={styles.playAgainBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.playAgainText}>{t('game.weekly.back')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : !gameOver ? (
                    <Animated.View entering={FadeInUp} key={currentQ}>
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressLabel}>{t('game.question_n_of_m', { n: currentQ + 1, m: questions.length })}</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Zap size={30} color="#f59e0b" style={{ marginBottom: 15 }} />
                            <Text style={styles.questionText}>{q.question}</Text>
                        </View>

                        <View style={styles.optionsList}>
                            {q.options.map((opt, idx) => {
                                const isSelected = selectedIdx === idx;
                                const isCorrect = idx === q.correctAnswer;
                                return (
                                    <TouchableOpacity 
                                        key={idx}
                                        style={[
                                            styles.optionBtn,
                                            answered && isCorrect && styles.correctOption,
                                            answered && isSelected && !isCorrect && styles.incorrectOption
                                        ]}
                                        onPress={() => handleAnswer(idx)}
                                        disabled={answered}
                                    >
                                        <Text style={[styles.optionText, answered && (isSelected || isCorrect) && { color: 'white' }]}>{opt}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {answered && (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.learnMoreBtn} onPress={handleLearnMore}>
                                    <Brain size={18} color="#7c3aed" />
                                    <Text style={styles.learnMoreText}>{t('game.learn_why')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.nextBtnSmall} onPress={nextQuestion}>
                                    <Text style={styles.nextBtnText}>{currentQ + 1 === questions.length ? t('game.finish') : t('game.next')}</Text>
                                    <ChevronRight size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInUp} style={styles.winOverlay}>
                        <Trophy size={80} color="#f59e0b" style={{ marginBottom: 20 }} />
                        <Text style={styles.winTitle}>{score === questions.length * 10 ? 'Legal Prodigy!' : t('game.game_over')}</Text>
                        <Text style={styles.winSub}>
                            {score === questions.length * 10 
                                ? 'You answered every question correctly! You\'ve mastered this topic.' 
                                : t('game.earned_points', { score: score })}
                        </Text>
                        
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryText}>Challenge: {routeModuleId || 'General Knowledge'}</Text>
                            <Text style={styles.summaryText}>Correct: {score / 10} / {questions.length}</Text>
                        </View>

                        <TouchableOpacity style={styles.playAgainBtn} onPress={fetchQuestions}>
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
    scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    scoreText: { color: '#f59e0b', fontWeight: '800' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    progressContainer: { marginBottom: 25 },
    progressLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', marginBottom: 8 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3 },
    progressBarFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 3 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 25, alignItems: 'center' },
    questionText: { color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
    optionsList: { gap: 12 },
    optionBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    optionText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '600' },
    correctOption: { backgroundColor: '#10b981', borderColor: '#10b981' },
    incorrectOption: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    nextBtn: { marginTop: 30, backgroundColor: '#f59e0b', borderRadius: 15, height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    nextBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    winOverlay: { alignItems: 'center', marginTop: 50 },
    winTitle: { color: 'white', fontSize: 32, fontWeight: '900' },
    winSub: { color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 10 },
    playAgainBtn: { marginTop: 40, backgroundColor: '#f59e0b', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
    playAgainText: { color: 'white', fontWeight: '800', fontSize: 16 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 30 },
    learnMoreBtn: { flex: 1, backgroundColor: 'rgba(124,58,237,0.1)', height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
    learnMoreText: { color: '#7c3aed', fontWeight: '800', fontSize: 15 },
    nextBtnSmall: { flex: 1, backgroundColor: '#f59e0b', borderRadius: 15, height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    summaryBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 15, marginVertical: 20, width: '100%', alignItems: 'center', gap: 8 },
    summaryText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29' }
});

export default LightningQuizScreen;

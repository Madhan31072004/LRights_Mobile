import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeOutLeft, ZoomIn } from 'react-native-reanimated';
import { ChevronLeft, Trophy, Clock, Target, AlertCircle, RefreshCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const WeeklyChallengeScreen = () => {
    const navigation = useNavigation();
    const { language, user, updateProgressLocally } = useUser();
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes for 5 hard questions
    const [isFinished, setIsFinished] = useState(false);
    const [isStarting, setIsStarting] = useState(true);

    const fetchChallenge = async () => {
        setLoading(true);
        try {
            const res = await API.post('/ai/game/challenge', { lang: language, moduleId: 'weekly-challenge' });
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert(t('chatbot.error'), t('game.weekly.timeout_msg'));
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChallenge();
        }, [language])
    );

    // Timer Logic
    useEffect(() => {
        let timer;
        if (!isStarting && !isFinished && !loading) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        finishChallenge();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isStarting, isFinished, loading]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (opt) => {
        if (selectedOpt) return;
        setSelectedOpt(opt);
        setShowExplanation(true);
        const current = questions[currentQ];
        if (opt === current.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
            setSelectedOpt(null);
            setShowExplanation(false);
        } else {
            finishChallenge();
        }
    };

    const finishChallenge = async () => {
        setIsFinished(true);
        // Simple 50 points per correct answer for the challenge
        const pointsEarned = score * 50; 
        if (pointsEarned > 0 && user?._id) {
            try {
                const res = await API.post('/progress/update', { userId: user._id, pointsEarned: pointsEarned, gameType: 'weekly_challenge' });
                
                if (res.data.dailyLimitReached) {
                    Alert.alert(t('game.weekly.timeout_msg'), t('game.weekly.timeout_msg'));
                } else {
                    Alert.alert(t('game.weekly.title'), t('game.weekly.complete_msg', { score: score, total: questions.length, points: res.data.pointsEarned }));
                }
                
                updateProgressLocally({ 
                    points: res.data.progress.points,
                    badges: res.data.progress.badges,
                    certificates: res.data.progress.certificates
                });
            } catch (e) { console.error(e); }
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <LinearGradient colors={['#0f0c29', '#1a1744']} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text style={styles.loadingText}>{t('game.weekly.generating')}</Text>
            </View>
        );
    }

    if (isStarting) {
        return (
            <View style={[styles.container, styles.center]}>
                <LinearGradient colors={['#0f0c29', '#1a1744']} style={StyleSheet.absoluteFill} />
                <Animated.View entering={FadeInUp} style={styles.startCard}>
                     <Trophy size={60} color="#f59e0b" style={{ alignSelf: 'center', marginBottom: 20 }} />
                     <Text style={styles.startTitle}>{t('game.weekly.title')}</Text>
                     <Text style={styles.startDesc}>{t('game.weekly.desc')}</Text>
                     
                     <View style={styles.startInfo}>
                         <View style={styles.infoPill}><Clock size={16} color="#fbbf24" /><Text style={styles.infoText}>10:00</Text></View>
                         <View style={styles.infoPill}><Target size={16} color="#fbbf24" /><Text style={styles.infoText}>{t('game.question_n_of_m', { n: 5, m: 5 })}</Text></View>
                         <View style={styles.infoPill}><Trophy size={16} color="#fbbf24" /><Text style={styles.infoText}>250 XP Max</Text></View>
                     </View>

                     <TouchableOpacity style={styles.startBtn} onPress={() => setIsStarting(false)}>
                         <Text style={styles.startBtnText}>{t('game.weekly.start')}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                         <Text style={styles.cancelBtnText}>{t('game.weekly.back')}</Text>
                     </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    if (isFinished) {
        const pct = Math.round((score / questions.length) * 100) || 0;
        return (
            <View style={[styles.container, styles.center]}>
                <LinearGradient colors={['#0f0c29', '#1a1744']} style={StyleSheet.absoluteFill} />
                <Animated.View entering={ZoomIn} style={styles.resultCard}>
                    <Trophy size={80} color={pct >= 80 ? '#fbbf24' : '#94a3b8'} style={{ alignSelf: 'center' }} />
                    <Text style={styles.resultTitle}>{pct >= 80 ? t('game.weekly.masterful') : t('game.weekly.good_effort')}</Text>
                    <Text style={styles.resultScore}>{t('game.question_n_of_m', { n: score, m: questions.length })}</Text>
                    <Text style={styles.resultPoints}>+{score * 50} XP Earned</Text>
                    
                    <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('GameCenter')}>
                        <Text style={styles.doneBtnText}>{t('game.weekly.return')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    const current = questions[currentQ];

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.timerBox}>
                    <Clock size={16} color={timeLeft < 60 ? '#ef4444' : '#fbbf24'} />
                    <Text style={[styles.timerText, timeLeft < 60 && { color: '#ef4444' }]}>{formatTime(timeLeft)}</Text>
                </View>
                <View style={styles.scoreBox}>
                    <Trophy size={16} color="#fbbf24" />
                    <Text style={styles.scoreText}>{score * 50} XP</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollArea}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressText}>{t('game.question_n_of_m', { n: currentQ + 1, m: questions.length })}</Text>
                    <View style={styles.progBg}>
                        <View style={[styles.progFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
                    </View>
                </View>

                <Animated.View key={`q-${currentQ}`} entering={FadeInRight} exiting={FadeOutLeft} style={styles.questionCard}>
                     <View style={styles.diffBadge}><Text style={styles.diffText}>EXPERT</Text></View>
                     <Text style={styles.questionText}>{current?.question}</Text>
                     
                     <View style={styles.optionsList}>
                         {current?.options?.map((opt, i) => {
                             let bg = 'rgba(255,255,255,0.05)';
                             let border = 'rgba(255,255,255,0.1)';
                             let icon = null;

                             if (selectedOpt) {
                                 if (opt === current.correctAnswer) {
                                     bg = 'rgba(16, 185, 129, 0.1)';
                                     border = '#10b981';
                                 } else if (opt === selectedOpt) {
                                     bg = 'rgba(239, 68, 68, 0.1)';
                                     border = '#ef4444';
                                 }
                             }

                             return (
                                 <TouchableOpacity 
                                    key={i} 
                                    style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}
                                    onPress={() => handleAnswer(opt)}
                                    disabled={!!selectedOpt}
                                 >
                                     <Text style={[styles.optText, selectedOpt && opt === current.correctAnswer && { color: '#10b981', fontWeight: 'bold' }]}>{opt}</Text>
                                 </TouchableOpacity>
                             )
                         })}
                     </View>
                </Animated.View>

                {showExplanation && (
                    <Animated.View entering={FadeInUp} style={styles.explanationBox}>
                         <View style={styles.expHeader}>
                             <AlertCircle size={20} color="#3b82f6" />
                             <Text style={styles.expTitle}>{t('game.weekly.legal_explanation')}</Text>
                         </View>
                         <Text style={styles.expText}>{current?.explanation}</Text>
                         
                         <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
                             <Text style={styles.nextBtnText}>{currentQ < questions.length - 1 ? t('game.weekly.next_q') : t('game.weekly.view_results')}</Text>
                         </TouchableOpacity>
                    </Animated.View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { color: 'rgba(255,255,255,0.6)', marginTop: 20, fontSize: 16 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    timerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    timerText: { color: 'white', fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
    scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    scoreText: { color: '#fbbf24', fontSize: 14, fontWeight: '800' },
    scrollArea: { padding: 20 },
    progressRow: { marginBottom: 20 },
    progressText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    progBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
    progFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 3 },
    questionCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    diffBadge: { position: 'absolute', top: -12, right: 20, backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    diffText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    questionText: { color: 'white', fontSize: 18, fontWeight: '700', lineHeight: 28, marginTop: 10, marginBottom: 25 },
    optionsList: { gap: 12 },
    optBtn: { padding: 16, borderRadius: 16, borderWidth: 1, borderLeftWidth: 4 },
    optText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22 },
    explanationBox: { marginTop: 25, backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    expHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    expTitle: { color: '#3b82f6', fontSize: 16, fontWeight: '700' },
    expText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22, marginBottom: 20 },
    nextBtn: { backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    nextBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
    startCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 30, borderRadius: 30, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    startTitle: { color: 'white', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
    startDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
    startInfo: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginVertical: 30 },
    infoPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    infoText: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
    startBtn: { backgroundColor: '#f59e0b', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
    startBtnText: { color: '#451a03', fontSize: 16, fontWeight: '800' },
    cancelBtn: { paddingVertical: 12, alignItems: 'center' },
    cancelBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
    resultCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 30, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    resultTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginTop: 20, marginBottom: 5 },
    resultScore: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: '600', marginBottom: 10 },
    resultPoints: { color: '#fbbf24', fontSize: 16, fontWeight: '800', marginBottom: 30 },
    doneBtn: { backgroundColor: 'white', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16, width: '100%', alignItems: 'center' },
    doneBtnText: { color: '#0f0c29', fontSize: 16, fontWeight: '800' }
});

export default WeeklyChallengeScreen;

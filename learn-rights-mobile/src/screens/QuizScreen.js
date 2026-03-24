import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, withRepeat, withSequence } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Star, Award, RotateCcw, Check, X, LayoutGrid } from 'lucide-react-native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const QuizScreen = ({ route, navigation }) => {
  const { moduleId } = route.params;
  const { user, refreshUserData, language } = useUser();
  const [questions, setQuestions] = React.useState([]);
  const [currentQ, setCurrentQ] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [showReview, setShowReview] = React.useState(false);

  const confettiOpacity = useSharedValue(0);

  React.useEffect(() => {
    API.get(`/quizzes/module?moduleId=${moduleId}&lang=${language}`)
      .then(res => {
        setQuestions(res.data[0]?.questions || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [moduleId, language]);

  const handleAnswer = (idx) => {
    setAnswers({ ...answers, [currentQ]: idx });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correctCount++;
    });
    const score = correctCount * 10;
    
    try {
      const res = await API.post('/progress/submit-quiz', {
        userId: user._id,
        moduleId,
        score,
        totalQuestions: questions.length
      });
      setResult({
        score,
        correct: correctCount,
        total: questions.length,
        passed: score >= (questions.length * 10 * 0.6),
        pointsEarned: res.data.pointsEarned,
        answers: { ...answers }
      });
      if (score >= (questions.length * 10 * 0.6)) {
        confettiOpacity.value = withTiming(1, { duration: 500 });
      }
      refreshUserData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />;

  if (result) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0c29', '#302b63']} style={styles.background} />
        
        {!showReview ? (
          <Animated.View entering={FadeInUp} style={styles.resultCard}>
              <View style={styles.confettiContainer}>
                  {[...Array(20)].map((_, i) => (
                    <ConfettiPiece key={i} index={i} opacity={confettiOpacity} />
                  ))}
              </View>
              <Award size={80} color={result.passed ? "#fbbf24" : "#94a3b8"} />
              <Text style={styles.resultTitle}>{result.passed ? t('quiz.congratulations', { defaultValue: "Congratulations!" }) : t('quiz.keep_trying', { defaultValue: "Keep Trying!" })}</Text>
              <Text style={styles.resultScore}>{result.score} / {result.total * 10}</Text>
              <Text style={styles.resultSub}>{result.correct} correct out of {result.total}</Text>
              
              {result.pointsEarned > 0 && (
                  <View style={styles.pointsBadge}>
                      <Star size={16} color="white" />
                      <Text style={styles.pointsText}>+{result.pointsEarned} {t('quiz.points_earned', { defaultValue: 'Points' })}</Text>
                  </View>
              )}

              <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.reviewBtn} onPress={() => setShowReview(true)}>
                      <LayoutGrid size={20} color="white" />
                      <Text style={styles.reviewBtnText}>{t('quiz.review_answers', { defaultValue: 'Review Answers' })}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
                      <Text style={styles.doneBtnText}>{t('modules.back_to_modules', { defaultValue: 'Back to Modules' })}</Text>
                  </TouchableOpacity>
              </View>
          </Animated.View>
        ) : (
          <View style={{ flex: 1 }}>
              <View style={styles.reviewHeader}>
                  <TouchableOpacity onPress={() => setShowReview(false)} style={styles.backBtn}>
                      <ChevronLeft size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.reviewHeaderTitle}>{t('quiz.review_answers', { defaultValue: 'Review' })}</Text>
              </View>
              <ScrollView style={styles.reviewList}>
                  {questions.map((q, i) => {
                      const userAns = result.answers[i];
                      const isCorrect = userAns === q.correctAnswer;
                      return (
                          <View key={i} style={[styles.reviewItem, { borderColor: isCorrect ? '#10b98140' : '#ef444440' }]}>
                              <View style={styles.reviewItemTitleRow}>
                                  <Text style={styles.reviewQNum}>Q{i+1}</Text>
                                  {isCorrect ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                              </View>
                              <Text style={styles.reviewQText}>{q.question}</Text>
                              <View style={styles.reviewAnsRow}>
                                  <Text style={[styles.reviewAnsLabel, { color: isCorrect ? '#10b981' : '#ef4444' }]}>
                                      {isCorrect ? 'Correct:' : 'Your Answer:'}
                                  </Text>
                                  <Text style={styles.reviewAnsVal}>{q.options[userAns] || 'Skipped'}</Text>
                              </View>
                              {!isCorrect && (
                                  <View style={styles.reviewAnsRow}>
                                      <Text style={styles.reviewAnsLabel}>Correct Answer:</Text>
                                      <Text style={[styles.reviewAnsVal, { color: '#10b981' }]}>{q.options[q.correctAnswer]}</Text>
                                  </View>
                              )}
                          </View>
                      )
                  })}
              </ScrollView>
          </View>
        )}
      </View>
    );
  }

  const ConfettiPiece = ({ index, opacity }) => {
    const startX = Math.random() * width;
    const endX = startX + (Math.random() - 0.5) * 200;
    const duration = 2000 + Math.random() * 1000;
    const delay = Math.random() * 1000;
    const color = ['#7c3aed', '#ec4899', '#38bdf8', '#fbbf24', '#10b981'][index % 5];
    
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: withRepeat(withSequence(withTiming(-50, { duration: 0 }), withDelay(delay, withTiming(800, { duration }))), -1) },
                { translateX: withRepeat(withSequence(withTiming(startX, { duration: 0 }), withDelay(delay, withTiming(endX, { duration }))), -1) },
                { rotate: withRepeat(withTiming('360deg', { duration: duration / 2 }), -1) }
            ]
        };
    });

    return <Animated.View style={[styles.confetti, { backgroundColor: color }, animatedStyle]} />;
  };

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
      
      <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('modules.take_quiz', { defaultValue: 'Module Quiz' })}</Text>
          <Text style={styles.qCount}>{currentQ + 1} / {questions.length}</Text>
      </View>

      <View style={styles.progBarBg}><View style={[styles.progBarFill, { width: `${progress}%` }]} /></View>

      <View style={styles.dotsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dotsScroll}>
              {questions.map((_, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[
                        styles.dot, 
                        currentQ === i && styles.dotActive,
                        answers[i] !== undefined && styles.dotAnswered
                    ]}
                    onPress={() => setCurrentQ(i)}
                  >
                      <Text style={[styles.dotText, currentQ === i && { color: 'white' }]}>{i + 1}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.quizBody}>
          <Text style={styles.question}>{q?.question}</Text>
          <View style={styles.options}>
              {q?.options.map((opt, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.optCard, answers[currentQ] === i && styles.optSelected]}
                    onPress={() => handleAnswer(i)}
                  >
                      <View style={[styles.optCircle, answers[currentQ] === i && styles.optCircleActive]}>
                         <Text style={styles.optLetter}>{String.fromCharCode(65 + i)}</Text>
                      </View>
                      <Text style={[styles.optText, answers[currentQ] === i && { color: 'white' }]}>{opt}</Text>
                  </TouchableOpacity>
              ))}
          </View>
      </ScrollView>

      <View style={styles.navFooter}>
          <TouchableOpacity 
            style={[styles.navBtn, currentQ === 0 && { opacity: 0.3 }]} 
            onPress={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
          >
              <ChevronLeft size={20} color="white" />
              <Text style={styles.navBtnText}>Prev</Text>
          </TouchableOpacity>

          {currentQ < questions.length - 1 ? (
              <TouchableOpacity 
                style={[styles.nextBtn, answers[currentQ] === undefined && { opacity: 0.5 }]} 
                onPress={() => setCurrentQ(prev => prev + 1)}
                disabled={answers[currentQ] === undefined}
              >
                  <Text style={styles.nextBtnText}>Next</Text>
                  <ChevronRight size={20} color="white" />
              </TouchableOpacity>
          ) : (
              <TouchableOpacity 
                style={[styles.submitBtn, (answers[currentQ] === undefined || submitting) && { opacity: 0.5 }]} 
                onPress={handleSubmit}
                disabled={answers[currentQ] === undefined || submitting}
              >
                  {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Submit Quiz</Text>}
              </TouchableOpacity>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  quizHeader: { height: 100, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  qCount: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  progBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
  progBarFill: { height: '100%', backgroundColor: '#7c3aed' },
  quizBody: { padding: 25, paddingTop: 40 },
  question: { color: 'white', fontSize: 22, fontWeight: '700', lineHeight: 30, marginBottom: 40 },
  options: { gap: 12 },
  optCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optSelected: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: '#7c3aed' },
  optCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optCircleActive: { backgroundColor: '#7c3aed' },
  optLetter: { color: 'white', fontWeight: '700' },
  optText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, flex: 1 },
  navFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 40, backgroundColor: 'rgba(15, 12, 41, 0.8)' },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  navBtnText: { color: 'white', fontWeight: '600' },
  nextBtn: { height: 50, paddingHorizontal: 25, backgroundColor: '#7c3aed', borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextBtnText: { color: 'white', fontWeight: '700' },
  submitBtn: { height: 50, paddingHorizontal: 25, backgroundColor: '#10b981', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: '700' },
  resultCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  resultTitle: { color: 'white', fontSize: 32, fontWeight: '800', marginTop: 20 },
  resultScore: { color: '#7c3aed', fontSize: 48, fontWeight: '900', marginTop: 10 },
  resultSub: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 5 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fbbf24', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 20 },
  pointsText: { color: 'white', fontWeight: '700' },
  resultActions: { width: '100%', gap: 15, marginTop: 40 },
  reviewBtn: { height: 60, width: '100%', backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#7c3aed40' },
  reviewBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  doneBtn: { height: 60, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  doneBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '700' },
  dotsContainer: { backgroundColor: 'rgba(255,255,255,0.02)', paddingVertical: 15, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dotsScroll: { paddingHorizontal: 20, gap: 10 },
  dot: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dotActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  dotAnswered: { borderColor: '#7c3aed' },
  dotText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '700' },
  confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
  confetti: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  reviewHeader: { height: 100, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  reviewHeaderTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  reviewList: { padding: 20 },
  reviewItem: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1 },
  reviewItemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reviewQNum: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '800' },
  reviewQText: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 15, lineHeight: 22 },
  reviewAnsRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  reviewAnsLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', width: 100 },
  reviewAnsVal: { color: 'white', fontSize: 13, fontWeight: '500', flex: 1 }
});

export default QuizScreen;

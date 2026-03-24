import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Trophy, Award, PenTool, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const CompetitionScreen = () => {
    const { user, language } = useUser();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedComp, setSelectedComp] = useState(null);
    const [essay, setEssay] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const fetchCompetitions = async () => {
        try {
            const res = await API.get(`/competitions?lang=${language}`);
            setCompetitions(res.data);
            if (res.data.length > 0) setSelectedComp(res.data[0]);
            else {
                // Fallback dummy if none in DB
                const dummy = {
                    _id: 'c1',
                    title: 'Gender Equality in 2026',
                    type: 'Essay Writing',
                    period: 'Monthly (March)',
                    reward: '500 Points + Premium Badge',
                    description: 'Analyze the progress of gender equality laws in your region over the last decade.',
                    prompt: 'What legal reform would have the biggest impact on women in your community today?',
                    rules: [
                        'Minimum 300 words, Maximum 1000 words.',
                        'Must be original content.',
                        'Submission deadline: 30th March.'
                    ]
                };
                setCompetitions([dummy]);
                setSelectedComp(dummy);
            }
        } catch (error) {
            console.error("Error fetching competitions:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, [language]);

    const handleSubmit = async () => {
        if (!essay.trim()) return;
        setSubmitting(true);
        try {
            const res = await API.post(`/competitions/${selectedComp._id}/submit`, {
                userId: user._id,
                username: user.name || 'Learner',
                competitionId: selectedComp._id,
                essayContent: essay
            });
            setSuccessData(res.data);
        } catch (error) {
            alert("Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
            </View>
        );
    }

    if (successData) {
        return (
            <View style={styles.loadingContainer}>
                <Animated.View entering={ZoomIn} style={styles.successCard}>
                    <CheckCircle2 size={60} color="#10b981" />
                    <Text style={styles.successTitle}>{t('comp.success_title') || 'AI Evaluated!'}</Text>
                    
                    {successData.score !== undefined ? (
                        <>
                            <View style={styles.scoreBadge}>
                                <Text style={styles.scoreTextVal}>{successData.score}/100</Text>
                                <Text style={styles.scoreTextLbl}>Your Score</Text>
                            </View>
                            <Text style={styles.aiFeedbackText}>"{successData.feedback}"</Text>
                            
                            {successData.breakdown && (
                                <View style={styles.resBreakdown}>
                                    {Object.entries(successData.breakdown).map(([k, v], i) => (
                                        <View key={i} style={styles.resBreakdownItem}>
                                            <Text style={styles.resBreakdownLbl}>{k}</Text>
                                            <Text style={styles.resBreakdownVal}>{v}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            
                            <Text style={styles.successMsg}>{successData.message}</Text>
                        </>
                    ) : (
                        <Text style={styles.successMsg}>{successData.message || 'Your entry has been submitted for review.'}</Text>
                    )}
                    
                    <TouchableOpacity style={styles.backBtn} onPress={() => {setSuccessData(null); setEssay('');}}>
                        <Text style={styles.backBtnText}>{t('back_to_comp') || 'View More Challenges'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{t('comp.title') || 'Global Competitions'}</Text>
                    <Text style={styles.headerSubtitle}>{t('comp.subtitle') || 'Compete, Learn & Get Recognized'}</Text>
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchCompetitions();}} tintColor="#f59e0b" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Competition Tabs */}
                <View style={styles.tabs}>
                    {competitions.map(comp => (
                        <TouchableOpacity 
                            key={comp._id} 
                            style={[styles.tab, selectedComp?._id === comp._id && styles.activeTab]}
                            onPress={() => setSelectedComp(comp)}
                        >
                            <Text style={[styles.tabText, selectedComp?._id === comp._id && styles.activeTabText]}>
                                {comp.period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedComp && (
                    <Animated.View entering={FadeInUp} style={styles.compCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.awardIcon}>
                                <Trophy color="#f59e0b" size={28} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.compTitle}>{selectedComp.title}</Text>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeBadgeText}>{selectedComp.type.toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Calendar size={14} color="rgba(255,255,255,0.4)" />
                                <Text style={styles.infoItemText}>{selectedComp.period}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Award size={14} color="#f59e0b" />
                                <Text style={[styles.infoItemText, { color: '#f59e0b' }]}>{selectedComp.reward}</Text>
                            </View>
                        </View>

                        <Text style={styles.desc}>{selectedComp.description}</Text>
                        
                        {selectedComp.rules && (
                            <View style={styles.rulesBox}>
                                <Text style={styles.rulesTitle}>Submission Guidelines:</Text>
                                {selectedComp.rules.map((rule, ri) => (
                                    <View key={ri} style={styles.ruleItem}>
                                        <View style={styles.ruleDot} />
                                        <Text style={styles.ruleText}>{rule}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.promptBox}>
                            <LinearGradient colors={['rgba(167,139,250,0.1)', 'rgba(167,139,250,0.05)']} style={styles.promptGradient}>
                                <View style={styles.promptHeader}>
                                    <PenTool size={18} color="#a78bfa" />
                                    <Text style={styles.promptTitle}>THE PROMPT</Text>
                                </View>
                                <Text style={styles.promptText}>{selectedComp.prompt}</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.inputSection}>
                            <View style={styles.inputHeader}>
                                <Text style={styles.inputTitle}>Your Submission</Text>
                                <Text style={styles.wordCount}>{essay.trim() ? essay.trim().split(/\s+/).length : 0} words</Text>
                            </View>
                            <View style={styles.inputWrap}>
                                <TextInput
                                    style={styles.essayInput}
                                    placeholder={t('comp.essay_placeholder') || "Share your profound thoughts and analysis here..."}
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    multiline
                                    value={essay}
                                    onChangeText={setEssay}
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitBtn, (!essay.trim() || submitting) && styles.submitBtnDisabled]} 
                            onPress={handleSubmit}
                            disabled={submitting || !essay.trim()}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View style={styles.submitBtnContent}>
                                    <Text style={styles.submitBtnText}>{t('comp.submit') || 'Submit for 50 Points'}</Text>
                                    <ChevronRight size={18} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0c29' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29', padding: 30 },
    header: { height: 140, justifyContent: 'flex-end', paddingBottom: 25, paddingHorizontal: 20 },
    headerTitle: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500', marginTop: 4 },
    scrollContent: { padding: 16, paddingBottom: 100 },
    tabs: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    activeTab: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
    tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '800' },
    activeTabText: { color: 'white' },
    compCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 20 },
    awardIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(245,158,11,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
    compTitle: { color: 'white', fontSize: 20, fontWeight: '900', lineHeight: 26 },
    typeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
    typeBadgeText: { color: '#f59e0b', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    infoGrid: { flexDirection: 'row', gap: 20, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoItemText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
    desc: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 24, marginBottom: 25 },
    rulesBox: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    rulesTitle: { color: 'white', fontWeight: '800', fontSize: 14, marginBottom: 12 },
    ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    ruleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#f59e0b' },
    ruleText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },
    promptBox: { borderRadius: 24, overflow: 'hidden', marginBottom: 30 },
    promptGradient: { padding: 20 },
    promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    promptTitle: { color: '#a78bfa', fontWeight: '900', fontSize: 12, letterSpacing: 2 },
    promptText: { color: 'white', fontSize: 16, fontWeight: '700', lineHeight: 24 },
    inputSection: { marginBottom: 25 },
    inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    inputTitle: { color: 'white', fontSize: 15, fontWeight: '800' },
    wordCount: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },
    inputWrap: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    essayInput: { color: 'white', fontSize: 16, minHeight: 250, textAlignVertical: 'top', lineHeight: 24 },
    submitBtn: { backgroundColor: '#f59e0b', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
    submitBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.05)', elevation: 0 },
    submitBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    successCard: { backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 40, padding: 40, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
    successTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginTop: 20 },
    successMsg: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 12, lineHeight: 24, fontSize: 15 },
    backBtn: { marginTop: 30, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    backBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
    scoreBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15, marginVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b' },
    scoreTextVal: { color: '#f59e0b', fontSize: 24, fontWeight: '900' },
    scoreTextLbl: { color: 'rgba(245,158,11,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
    aiFeedbackText: { color: 'white', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24, marginBottom: 15, paddingHorizontal: 10 },
    resBreakdown: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
    resBreakdownItem: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, minWidth: '45%', alignItems: 'center' },
    resBreakdownLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    resBreakdownVal: { color: '#f59e0b', fontSize: 18, fontWeight: '900' }
});

export default CompetitionScreen;

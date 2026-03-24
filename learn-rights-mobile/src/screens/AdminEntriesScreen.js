import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CheckCircle2, XCircle, Clock, User, Award, FileText, Bot } from 'lucide-react-native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';

const AdminEntriesScreen = ({ navigation }) => {
    const { user } = useUser();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchEntries = async () => {
        try {
            const res = await API.get('/competitions/entries');
            setEntries(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch entries');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const updateStatus = async (status) => {
        if (!selectedEntry) return;
        setUpdating(true);
        try {
            await API.post(`/competitions/entries/${selectedEntry._id}/status`, {
                status,
                feedback
            });
            setEntries(prev => prev.map(e => e._id === selectedEntry._id ? { ...e, status, feedback } : e));
            setSelectedEntry(null);
            setFeedback('');
            Alert.alert('Success', `Entry ${status} successfully`);
        } catch (err) {
            Alert.alert('Error', `Failed to ${status} entry`);
        } finally {
            setUpdating(false);
        }
    };
    const handleAIEvaluate = async () => {
        if (!selectedEntry) return;
        setUpdating(true);
        try {
            const res = await API.post(`/competitions/entries/${selectedEntry._id}/ai-evaluate`);
            setEntries(prev => prev.map(e => e._id === selectedEntry._id ? { ...e, ...res.data, status: 'reviewed' } : e));
            setSelectedEntry(prev => ({ ...prev, ...res.data, status: 'reviewed' }));
            Alert.alert('AI Success', 'Evaluation completed successfully');
        } catch (err) {
            Alert.alert('AI Error', 'Failed to run AI evaluation. Please try again later.');
        } finally {
            setUpdating(false);
        }
    };

    const EntryItem = ({ item }) => (
        <TouchableOpacity style={styles.entryCard} onPress={() => setSelectedEntry(item)}>
            <View style={styles.entryHeader}>
                <View style={styles.userHead}>
                    <View style={styles.avatar}>
                        <User size={16} color="white" />
                    </View>
                    <Text style={styles.username}>{item.username}</Text>
                </View>
                <View style={[styles.statusBadge, 
                    item.status === 'approved' ? styles.approvedBadge : 
                    item.status === 'rejected' ? styles.rejectedBadge : styles.pendingBadge
                ]}>
                    <Text style={[styles.statusText, 
                        item.status === 'approved' ? styles.approvedText : 
                        item.status === 'rejected' ? styles.rejectedText : styles.pendingText
                    ]}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.preview} numberOfLines={2}>{item.essayContent}</Text>
            <View style={styles.entryFooter}>
                <View style={styles.footerItem}>
                    <Clock size={12} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.footerText}>{new Date(item.submittedAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Award size={12} color="#f59e0b" />
                    <Text style={styles.footerText}>ID: {item.competitionId.substring(0, 8)}...</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Review Submissions</Text>
                    <Text style={styles.headerSub}>{entries.filter(e => e.status === 'pending').length} Pending</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <EntryItem item={item} />}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntries(); }} tintColor="#7c3aed" />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <FileText size={48} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>No submissions yet</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={!!selectedEntry} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Review Essay</Text>
                            <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                                <XCircle size={24} color="rgba(255,255,255,0.3)" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={[1]}
                            renderItem={() => (
                                <>
                                    <View style={styles.authorSection}>
                                        <Text style={styles.authorLabel}>Author: <Text style={styles.authorName}>{selectedEntry?.username}</Text></Text>
                                        <Text style={styles.submittedDate}>Submitted on {selectedEntry && new Date(selectedEntry.submittedAt).toLocaleString()}</Text>
                                    </View>

                                    {selectedEntry?.score !== undefined && (
                                        <View style={styles.aiReviewSection}>
                                            <View style={styles.aiHeader}>
                                                <Bot size={18} color="#7c3aed" />
                                                <Text style={styles.aiTitle}>AI Evaluation: {selectedEntry.score}/100</Text>
                                            </View>
                                            <Text style={styles.aiFeedback}>"{selectedEntry.feedback}"</Text>
                                            
                                            {selectedEntry.breakdown && Object.keys(selectedEntry.breakdown).length > 0 && (
                                                <View style={styles.breakdownGrid}>
                                                    {Object.entries(selectedEntry.breakdown).map(([criterion, val], idx) => (
                                                        <View key={idx} style={styles.breakdownItem}>
                                                            <Text style={styles.breakdownLabel}>{criterion}</Text>
                                                            <Text style={styles.breakdownVal}>{val}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    <TouchableOpacity 
                                        style={[styles.aiReviewBtn, { marginBottom: 20 }]} 
                                        onPress={handleAIEvaluate}
                                        disabled={updating}
                                    >
                                        <Bot size={20} color="white" />
                                        <Text style={styles.actionBtnText}>
                                            {selectedEntry?.score !== undefined ? 'Re-run AI Evaluation' : 'Run AI Evaluation'}
                                        </Text>
                                    </TouchableOpacity>

                                    <Text style={styles.essayText}>{selectedEntry?.essayContent}</Text>
                                    
                                    <View style={styles.reviewForm}>
                                        <Text style={styles.inputLabel}>Feedback (Optional)</Text>
                                        <TextInput
                                            style={styles.feedbackInput}
                                            placeholder="Great work! Maintain this depth..."
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            multiline
                                            value={feedback}
                                            onChangeText={setFeedback}
                                        />
                                        
                                        <View style={styles.actionBtns}>
                                            <TouchableOpacity 
                                                style={[styles.actionBtn, styles.rejectBtn]} 
                                                onPress={() => updateStatus('rejected')}
                                                disabled={updating}
                                            >
                                                <XCircle size={20} color="white" />
                                                <Text style={styles.actionBtnText}>Reject</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity 
                                                style={[styles.actionBtn, styles.approveBtn]} 
                                                onPress={() => updateStatus('approved')}
                                                disabled={updating}
                                            >
                                                <CheckCircle2 size={20} color="white" />
                                                <Text style={styles.actionBtnText}>Approve</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                            keyExtractor={() => "modal"}
                            contentContainerStyle={{ padding: 20 }}
                        />
                    </View>
                </View>
            </Modal>
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
    list: { padding: 20, gap: 15, paddingBottom: 100 },
    entryCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, borderLeftWidth: 4, borderColor: '#7c3aed' },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    userHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
    username: { color: 'white', fontWeight: '700', fontSize: 14 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
    approvedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    rejectedBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
    statusText: { fontSize: 9, fontWeight: '900' },
    pendingText: { color: '#f59e0b' },
    approvedText: { color: '#10b981' },
    rejectedText: { color: '#ef4444' },
    preview: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18, marginBottom: 12 },
    entryFooter: { flexDirection: 'row', gap: 15 },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { height: '85%', backgroundColor: '#1a1744', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    authorSection: { marginBottom: 20 },
    authorLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    authorName: { color: '#7c3aed', fontWeight: '700' },
    submittedDate: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
    essayText: { color: 'white', fontSize: 15, lineHeight: 24, marginBottom: 30 },
    reviewForm: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
    inputLabel: { color: 'white', fontSize: 14, fontWeight: '700', marginBottom: 10 },
    feedbackInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, color: 'white', height: 100, textAlignVertical: 'top' },
    actionBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
    actionBtn: { flex: 1, height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    approveBtn: { backgroundColor: '#10b981' },
    rejectBtn: { backgroundColor: '#ef4444' },
    actionBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 16, fontWeight: '600', marginTop: 15 },
    aiReviewBtn: { backgroundColor: '#7c3aed', height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    aiReviewSection: { backgroundColor: 'rgba(124, 58, 237, 0.08)', borderRadius: 20, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    aiTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
    aiFeedback: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontStyle: 'italic', marginBottom: 12 },
    breakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    breakdownItem: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: '48%' },
    breakdownLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    breakdownVal: { color: '#7c3aed', fontSize: 14, fontWeight: '800', marginTop: 2 }
});

export default AdminEntriesScreen;

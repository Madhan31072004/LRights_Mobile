import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CheckCircle, XCircle, User, Briefcase, Info } from 'lucide-react-native';
import API from '../api/axios';
import { t } from '../utils/translation';

const AdminLawyersScreen = ({ navigation }) => {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingLawyers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/lawyers?verified_only=false');
            // Only show unverified ones
            setLawyers(res.data.filter(l => !l.verified));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPendingLawyers();
        }, [])
    );

    const handleVerify = async (id, status) => {
        try {
            await API.patch(`/lawyers/${id}/verify`, { verified: status });
            Alert.alert('Updated', status ? 'Lawyer verified successfully!' : 'Lawyer removed.');
            fetchPendingLawyers();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to update status.');
        }
    };

    const renderLawyerRequest = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.spec}>{item.specialization} • {item.experience} Years</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Info size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.infoText}>{item.bio}</Text>
            </View>

            <View style={styles.contactDetails}>
                <Text style={styles.contactLabel}>Email: {item.email}</Text>
                <Text style={styles.contactLabel}>Phone: {item.phone}</Text>
                <Text style={styles.contactLabel}>Office: {item.officeAddress}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleVerify(item._id, true)}
                >
                    <CheckCircle size={18} color="white" />
                    <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleVerify(item._id, false)}
                >
                    <XCircle size={18} color="white" />
                    <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View style={{ marginLeft: 15 }}>
                    <Text style={styles.headerTitle}>Lawyer Verifications</Text>
                    <Text style={styles.headerSub}>Review Professional Credentials</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loading}><ActivityIndicator color="#10b981" /></View>
            ) : (
                <FlatList 
                    data={lawyers}
                    renderItem={renderLawyerRequest}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No pending verification requests.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    list: { padding: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(124, 58, 237, 0.1)', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#7c3aed', fontSize: 20, fontWeight: '800' },
    name: { color: 'white', fontSize: 18, fontWeight: '700' },
    spec: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    infoRow: { flexDirection: 'row', gap: 10, marginVertical: 10 },
    infoText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18, flex: 1 },
    contactDetails: { marginTop: 10, padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 15 },
    contactLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 4 },
    actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    actionBtn: { flex: 1, height: 45, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    approveBtn: { backgroundColor: '#10b981' },
    rejectBtn: { backgroundColor: '#ef4444' },
    btnText: { color: 'white', fontWeight: '800', fontSize: 14 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16 }
});

export default AdminLawyersScreen;

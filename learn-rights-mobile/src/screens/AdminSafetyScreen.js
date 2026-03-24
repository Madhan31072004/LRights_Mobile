import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Shield, Video, Mic, MapPin, Calendar, Clock, ExternalLink } from 'lucide-react-native';
import API from '../api/axios';
import { t } from '../utils/translation';

const AdminSafetyScreen = ({ navigation }) => {
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecordings = async () => {
        try {
            const res = await API.get('/safety/admin/all');
            setRecordings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecordings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecordings();
    };

    const RecordingCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'video' ? '#ef4444' : '#3b82f6' }]}>
                    {item.type === 'video' ? <Video size={14} color="white" /> : <Mic size={14} color="white" />}
                    <Text style={styles.typeText}>{item.type?.toUpperCase()}</Text>
                </View>
                <Text style={styles.timestamp}>{new Date(item.timestamp * 1000).toLocaleString()}</Text>
            </View>
            
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.userName || 'Anonymous User'}</Text>
                <Text style={styles.userId}>ID: {item.userId}</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.actionBtn} 
                    onPress={() => Linking.openURL(item.url)}
                >
                    <ExternalLink size={16} color="#7c3aed" />
                    <Text style={styles.actionText}>View Recording</Text>
                </TouchableOpacity>

                {item.location && (
                    <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={() => {
                            const url = `https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`;
                            Linking.openURL(url);
                        }}
                    >
                        <MapPin size={16} color="#10b981" />
                        <Text style={[styles.actionText, { color: '#10b981' }]}>Location</Text>
                    </TouchableOpacity>
                )}
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
                <View>
                    <Text style={styles.headerTitle}>Safety Audit Logs</Text>
                    <Text style={styles.headerSub}>SOS Recordings & Event Data</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />
            ) : (
                <FlatList 
                    data={recordings}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <RecordingCard item={item} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No safety events recorded yet.</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    list: { padding: 20, gap: 15, paddingBottom: 50 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    typeText: { color: 'white', fontSize: 10, fontWeight: '900' },
    timestamp: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
    userInfo: { marginBottom: 20 },
    userName: { color: 'white', fontSize: 18, fontWeight: '800' },
    userId: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },
    footer: { flexDirection: 'row', gap: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
    actionText: { color: '#7c3aed', fontSize: 14, fontWeight: '700' },
    empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 50 }
});

export default AdminSafetyScreen;

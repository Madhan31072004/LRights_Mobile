import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Zap, Target, Brain, RefreshCw, Trash2, BarChart3, Info } from 'lucide-react-native';
import { t } from '../utils/translation';
import API from '../api/axios';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AdminGamesScreen = ({ navigation }) => {
    const [stats, setStats] = useState([]);
    const [cacheInfo, setCacheInfo] = useState({ count: 0 });
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, cacheRes] = await Promise.all([
                API.get('/admin/game-stats'),
                API.post('/admin/ai/clear-cache') // Trigger a status check or just clear
            ]);
            setStats(statsRes.data);
            setCacheInfo(cacheRes.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch game management data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleClearCache = async () => {
        Alert.alert(
            t('admin.games.clear_cache'),
            t('admin.games.cache_desc'),
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: async () => {
                        setClearing(true);
                        try {
                            const res = await API.post('/admin/ai/clear-cache');
                            Alert.alert('Success', t('admin.games.cache_cleared'));
                            fetchData();
                        } catch (err) {
                            console.error(err);
                            Alert.alert('Error', 'Failed to clear cache.');
                        } finally {
                            setClearing(false);
                        }
                    }
                }
            ]
        );
    };

    const handleTestGen = async (type) => {
        setLoading(true);
        try {
            let endpoint = '';
            if (type === 'scenario') endpoint = '/ai/game/scenario';
            else if (type === 'match') endpoint = '/ai/game/match';
            else if (type === 'lightning') endpoint = '/ai/game/lightning-quiz';

            const res = await API.post(endpoint, { moduleId: 'general', lang: 'en' });
            Alert.alert(t('admin.games.gen_result'), JSON.stringify(res.data[0], null, 2));
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'AI generation test failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !refreshing) {
        return <View style={styles.loading}><ActivityIndicator color="#f59e0b" /></View>;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('admin.games.title')}</Text>
                    <Text style={styles.headerSub}>{t('admin.menu.games.sub')}</Text>
                </View>
                <View style={styles.badge}>
                    <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.badgeText}>BETA</Text>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
            >
                {/* Cache Management Section */}
                <Animated.View entering={FadeInUp} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <RefreshCw size={20} color="#f59e0b" />
                        <Text style={styles.sectionTitle}>{t('admin.games.cache')}</Text>
                    </View>
                    <View style={styles.cacheCard}>
                        <View style={styles.cacheInfoRow}>
                            <Text style={styles.cacheCount}>{cacheInfo.count}</Text>
                            <Text style={styles.cacheLabel}>Cached Files</Text>
                        </View>
                        <Text style={styles.cacheDesc}>{t('admin.games.cache_desc')}</Text>
                        <TouchableOpacity 
                            style={styles.clearBtn} 
                            onPress={handleClearCache}
                            disabled={clearing}
                        >
                            {clearing ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Trash2 size={18} color="white" />
                                    <Text style={styles.clearBtnText}>{t('admin.games.clear_cache')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Stats Section */}
                <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <BarChart3 size={20} color="#10b981" />
                        <Text style={styles.sectionTitle}>{t('admin.games.stats')}</Text>
                    </View>
                    
                    {stats.length === 0 ? (
                        <View style={styles.emptyStats}>
                            <Info size={24} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyStatsText}>{t('admin.games.no_stats')}</Text>
                        </View>
                    ) : (
                        stats.map((item, idx) => (
                            <View key={idx} style={styles.statRow}>
                                <View style={styles.statTypeBox}>
                                    <Text style={styles.statType}>{item._id?.replace('_', ' ').toUpperCase()}</Text>
                                    <Text style={styles.statPlays}>{item.totalPlays} {t('admin.games.total_plays')}</Text>
                                </View>
                                <View style={styles.statScoreBox}>
                                    <Text style={styles.statScoreVal}>{item.avgScore?.toFixed(1) || 0}</Text>
                                    <Text style={styles.statScoreLabel}>{t('admin.games.avg_score')}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </Animated.View>

                {/* Tool Section */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Brain size={20} color="#7c3aed" />
                        <Text style={styles.sectionTitle}>{t('admin.games.test_gen')}</Text>
                    </View>
                    <View style={styles.toolGrid}>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => handleTestGen('match')}>
                            <Target size={20} color="#7c3aed" />
                            <Text style={styles.toolBtnText}>Match</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => handleTestGen('scenario')}>
                            <BarChart3 size={20} color="#7c3aed" />
                            <Text style={styles.toolBtnText}>Scenario</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.toolBtn} onPress={() => handleTestGen('lightning')}>
                            <Zap size={20} color="#7c3aed" />
                            <Text style={styles.toolBtnText}>Trivia</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
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
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    badgeText: { color: '#f59e0b', fontSize: 10, fontWeight: '900' },
    scrollContent: { padding: 20, paddingBottom: 50 },
    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
    cacheCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cacheInfoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
    cacheCount: { color: 'white', fontSize: 32, fontWeight: '900' },
    cacheLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
    cacheDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 20, marginBottom: 20 },
    clearBtn: { backgroundColor: '#ef4444', height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    clearBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
    statRow: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statTypeBox: { flex: 1 },
    statType: { color: 'white', fontSize: 14, fontWeight: '800', marginBottom: 4 },
    statPlays: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
    statScoreBox: { alignItems: 'flex-end' },
    statScoreVal: { color: '#10b981', fontSize: 20, fontWeight: '900' },
    statScoreLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
    emptyStats: { alignItems: 'center', padding: 40, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20 },
    emptyStatsText: { color: 'rgba(255,255,255,0.3)', marginTop: 10, fontSize: 14 },
    toolGrid: { flexDirection: 'row', gap: 10 },
    toolBtn: { flex: 1, backgroundColor: 'rgba(124,58,237,0.1)', height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
    toolBtnText: { color: '#7c3aed', fontSize: 12, fontWeight: '800' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29' }
});

export default AdminGamesScreen;

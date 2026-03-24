import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Users, Shield, Star, CheckCircle2, Settings, BookOpen, Sparkles, MessageSquare, ShieldCheck, BarChart3, Gavel, ChevronRight } from 'lucide-react-native';
// Added legacy icons for safety just in case any older version references them
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const fetchStats = async () => {
    try {
        const res = await API.get("/admin/stats");
        setStats(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <View style={styles.loading}><ActivityIndicator color="#7c3aed" /></View>;

  const StatCard = ({ title, val, icon: Icon, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
            <Icon size={20} color={color} />
        </View>
        <View>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLabel}>{title}</Text>
        </View>
    </View>
  );

  const menuItems = [
    { title: t('admin.menu.users.title'), subtitle: t('admin.menu.users.sub'), icon: Users, color: '#3b82f6', screen: 'AdminUsers' },
    { title: 'Manage Modules', subtitle: 'Add/Remove modules or content', icon: BookOpen, color: '#10b981', screen: 'AdminModules' },
    { title: 'AI Game Management', subtitle: 'Variety & Cache controls', icon: Sparkles, color: '#fbbf24', screen: 'AdminGames' },
    { title: 'Community & Reports', subtitle: 'Moderate posts & flags', icon: Shield, color: '#ef4444', screen: 'AdminCommunity' },
    { title: 'Competition Entries', subtitle: 'Review & Evaluate essays', icon: Star, color: '#f59e0b', screen: 'AdminEntries' },
    { title: 'Verify Lawyers', subtitle: 'Profile approvals', icon: CheckCircle2, color: '#06b6d4', screen: 'AdminLawyers' },
    { title: 'AI Chatbot Settings', subtitle: 'Configure bot personality', icon: Settings, color: '#8b5cf6', screen: 'AdminBotSettings' },
    { title: 'Safety Audit Logs', subtitle: 'Review SOS recordings', icon: ShieldCheck, color: '#ef4444', screen: 'AdminSafety' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <ShieldCheck size={40} color="#7c3aed" />
            <Text style={styles.title}>{t('admin.dashboard.title')}</Text>
            <Text style={styles.subtitle}>{t('admin.dashboard.subtitle')}</Text>
        </View>

        <View style={styles.statsGrid}>
            <StatCard title="Users" val={stats.totalUsers || 0} icon={Users} color="#3b82f6" />
            <StatCard title="Modules" val={stats.totalModules || 0} icon={BookOpen} color="#10b981" />
            <StatCard title="Posts" val={stats.totalPosts || 0} icon={MessageSquare} color="#ef4444" />
            <StatCard title="Entries" val={stats.totalEntries || 0} icon={Star} color="#f59e0b" />
        </View>

        {stats.recentReports?.length > 0 && (
            <View style={styles.recentReports}>
                <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Recent Reports</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminCommunity')}>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>
                {stats.recentReports.map((report) => (
                    <View key={report._id} style={styles.reportCard}>
                        <View style={styles.reportInfo}>
                            <Text style={styles.reportText} numberOfLines={1}>{report.content}</Text>
                            <Text style={styles.reportMeta}>by {report.authorName || 'User'}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.dismissBtnSmall}
                            onPress={async () => {
                                try {
                                    await API.patch(`/admin/community/posts/${report._id}/dismiss-report`);
                                    fetchStats();
                                } catch (err) { console.error(err); }
                            }}
                        >
                            <Text style={styles.dismissTextSmall}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        )}

        <View style={styles.menu}>
            {menuItems.map((item, i) => (
                <TouchableOpacity key={i} style={styles.menuCard} onPress={() => navigation.navigate(item.screen)}>
                    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                        <item.icon size={22} color={item.color} />
                    </View>
                    <View style={styles.menuText}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSub}>{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 25 },
  title: { color: 'white', fontSize: 22, fontWeight: '800', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  statCard: { width: (width - 50) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statVal: { color: 'white', fontSize: 18, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  recentReports: { marginBottom: 25, backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: 24, padding: 15, borderWidth: 1, borderColor: 'rgba(239,68,68,0.1)' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 5 },
  sectionTitle: { color: '#ef4444', fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  viewAll: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 15, padding: 12, marginBottom: 8, gap: 10 },
  reportInfo: { flex: 1 },
  reportText: { color: 'white', fontSize: 13 },
  reportMeta: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  dismissBtnSmall: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  dismissTextSmall: { color: 'white', fontSize: 11, fontWeight: '700' },
  menu: { gap: 10 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 15, gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  cardTitle: { color: 'white', fontSize: 15, fontWeight: '700' },
  cardSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  loading: { flex: 1, backgroundColor: '#0f0c29', justifyContent: 'center', alignItems: 'center' }
});

export default AdminDashboardScreen;

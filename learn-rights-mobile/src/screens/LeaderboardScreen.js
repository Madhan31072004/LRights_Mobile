import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Dimensions, Image, RefreshControl } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInLeft, ZoomIn } from 'react-native-reanimated';
import { Trophy, Award, Star, Gem, BookOpen, User as UserIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';
import { useUser } from "../contexts/UserContext";
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const LeaderboardScreen = () => {
  const { user: contextUser, language } = useUser();
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isOffline, setIsOffline] = React.useState(false);

  const fetchLB = async () => {
    try {
        const res = await API.get("/leaderboard/top");
        setLeaderboard(res.data);
        setIsOffline(false);
        await AsyncStorage.setItem('cached_leaderboard', JSON.stringify(res.data));
    } catch (err) {
        console.error(err);
        const cached = await AsyncStorage.getItem('cached_leaderboard');
        if (cached) {
            setLeaderboard(JSON.parse(cached));
            setIsOffline(true);
        }
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchLB();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLB();
  };

  const getLeague = (points) => {
    if (points >= 1000) return { name: 'Diamond', color: '#0ea5e9', icon: '💎', bg: 'rgba(14, 165, 233, 0.1)' };
    if (points >= 500) return { name: 'Platinum', color: '#a78bfa', icon: '🛡️', bg: 'rgba(167, 139, 250, 0.1)' };
    if (points >= 250) return { name: 'Gold', color: '#fbbf24', icon: '🥇', bg: 'rgba(251, 191, 36, 0.1)' };
    if (points >= 100) return { name: 'Silver', color: '#94a3b8', icon: '🥈', bg: 'rgba(148, 163, 184, 0.1)' };
    return { name: 'Bronze', color: '#cd7f32', icon: '🥉', bg: 'rgba(205, 127, 50, 0.1)' };
  };

  const getLevel = (points) => {
    if (points >= 500) return { name: t('leaderboard.level.master'), color: "#f43f5e", bg: "rgba(244,63,94,0.15)" };
    if (points >= 300) return { name: t('leaderboard.level.expert'), color: "#f97316", bg: "rgba(249,115,22,0.15)" };
    if (points >= 150) return { name: t('leaderboard.level.advanced'), color: "#06b6d4", bg: "rgba(6,182,212,0.15)" };
    if (points >= 50)  return { name: t('leaderboard.level.intermediate'), color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
    return { name: t('leaderboard.level.beginner'), color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  };

  const getAvatar = (u) => {
    if (u.profilePhoto) return { uri: `http://10.0.2.2:5000${u.profilePhoto}` };
    return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=random&color=fff&size=80&bold=true&font-size=0.4` };
  };

  const currentUserId = contextUser?._id;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />;

  const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.background} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
      >
        {isOffline && (
            <View style={styles.offlineBanner}>
                <Text style={styles.offlineText}>{t('leaderboard.offline_mode', { defaultValue: 'Showing cached data (Offline)' })}</Text>
            </View>
        )}
        <View style={styles.header}>
            <View style={styles.trophyIcon}>
                <Trophy size={40} color="#7c3aed" />
            </View>
            <Text style={styles.title}>{t('leaderboard.title')}</Text>
            <Text style={styles.subtitle}>{t('leaderboard.subtitle')}</Text>
        </View>

        {/* Podium */}
        {leaderboard.length >= 3 && (
            <View style={styles.podium}>
                 {/* 2nd Place */}
                  <Animated.View entering={ZoomIn.delay(400)} style={[styles.podiumCard, { marginTop: 30 }]}>
                    <Award size={24} color="#94a3b8" />
                    <View style={styles.podiumImgBox}>
                         <Image source={getAvatar(leaderboard[1])} style={styles.podiumAvatar} />
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[1].name}</Text>
                    <View style={styles.podiumPoints}>
                        <Gem size={12} color="#f97316" />
                        <Text style={styles.podiumPointsText}>{leaderboard[1].points}</Text>
                    </View>
                 </Animated.View>

                 {/* 1st Place */}
                  <Animated.View entering={ZoomIn.delay(200)} style={styles.podiumCardFirst}>
                    <Trophy size={32} color="#f59e0b" />
                    <View style={styles.podiumImgBoxWide}>
                         <Image source={getAvatar(leaderboard[0])} style={styles.podiumAvatarWide} />
                    </View>
                    <Text style={styles.podiumNameWide} numberOfLines={1}>{leaderboard[0].name}</Text>
                    <View style={styles.podiumPoints}>
                        <Gem size={14} color="#f59e0b" />
                        <Text style={styles.podiumPointsTextWide}>{leaderboard[0].points}</Text>
                    </View>
                 </Animated.View>

                 {/* 3rd Place */}
                  <Animated.View entering={ZoomIn.delay(600)} style={[styles.podiumCard, { marginTop: 40 }]}>
                    <Star size={24} color="#cd7f32" />
                    <View style={styles.podiumImgBox}>
                         <Image source={getAvatar(leaderboard[2])} style={styles.podiumAvatar} />
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[2].name}</Text>
                    <View style={styles.podiumPoints}>
                        <Gem size={12} color="#cd7f32" />
                        <Text style={styles.podiumPointsText}>{leaderboard[2].points}</Text>
                    </View>
                 </Animated.View>
            </View>
        )}

        {/* List */}
        <View style={styles.list}>
            {leaderboard.map((u, i) => {
                const level = getLevel(u.points);
                const isYou = u._id === currentUserId;
                return (
                    <Animated.View entering={FadeInLeft.delay(i * 100)} key={i} style={[styles.row, isYou && styles.rowYou]}>
                         <Text style={styles.rankText}>#{i+1}</Text>
                         <View style={styles.userBox}>
                             <View style={styles.rowAvatarBox}>
                                <Image source={getAvatar(u)} style={styles.rowAvatar} />
                             </View>
                             <View style={{ flex: 1 }}>
                                 <View style={styles.nameRow}>
                                     <Text style={styles.userName} numberOfLines={1}>{u.name} {isYou && <Text style={styles.youBadge}> ({t('leaderboard.you', { defaultValue: 'YOU' })})</Text>}</Text>
                                     <View style={[styles.leagueBadge, { backgroundColor: getLeague(u.points).bg }]}>
                                         <Text style={styles.leagueIcon}>{getLeague(u.points).icon}</Text>
                                         <Text style={[styles.leagueName, { color: getLeague(u.points).color }]}>{getLeague(u.points).name}</Text>
                                     </View>
                                 </View>
                                <Text style={[styles.levelText, { color: level.color }]}>{level.name}</Text>
                             </View>
                         </View>
                         <View style={styles.statLine}>
                             <View style={styles.statItem}>
                                <Gem size={12} color="#a78bfa" />
                                <Text style={styles.statValue}>{u.points}</Text>
                             </View>
                             <View style={[styles.statItem, { marginLeft: 10 }]}>
                                <BookOpen size={12} color="#38bdf8" />
                                <Text style={styles.statValue}>{u.completedModules?.length || 0}</Text>
                             </View>
                         </View>
                    </Animated.View>
                );
            })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContent: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  trophyIcon: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(124,58,237,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { color: 'white', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 5 },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 10, marginBottom: 40 },
  podiumCard: { width: (width - 60) / 3, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  podiumCardFirst: { width: (width - 40) / 2.8, alignItems: 'center', backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: 25, padding: 15, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)', zIndex: 10 },
  podiumImgBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginVertical: 10, overflow: 'hidden' },
  podiumImgBoxWide: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(124,58,237,0.2)', justifyContent: 'center', alignItems: 'center', marginVertical: 10, overflow: 'hidden' },
  podiumAvatar: { width: '100%', height: '100%' },
  podiumAvatarWide: { width: '100%', height: '100%' },
  podiumName: { color: 'white', fontSize: 14, fontWeight: '700' },
  podiumNameWide: { color: 'white', fontSize: 16, fontWeight: '800' },
  podiumPoints: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  podiumPointsText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  podiumPointsTextWide: { color: '#f59e0b', fontSize: 14, fontWeight: '800' },
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rowYou: { backgroundColor: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)' },
  rankText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '800', width: 40 },
  userBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowAvatarBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  rowAvatar: { width: '100%', height: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName: { color: 'white', fontSize: 15, fontWeight: '700' },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  leagueIcon: { fontSize: 10 },
  leagueName: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  youBadge: { color: '#a78bfa', fontSize: 10 },
  levelText: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  statLine: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { color: 'white', fontSize: 14, fontWeight: '800' },
  offlineBanner: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: 10, marginBottom: 20, alignItems: 'center' },
  offlineText: { color: '#fbbf24', fontSize: 12, fontWeight: '700' }
});

export default LeaderboardScreen;

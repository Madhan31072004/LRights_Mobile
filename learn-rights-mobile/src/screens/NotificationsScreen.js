import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Bell, BellOff, Trophy, MessageSquare, AlertTriangle, ShieldCheck, Trash2, Clock } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'achievement',
            title: 'New Badge Unlocked!',
            desc: 'You earned the "Junior Advocate" badge for completing 3 modules.',
            time: '2 mins ago',
            read: false,
            icon: Trophy,
            color: '#fbbf24'
        },
        {
            id: 2,
            type: 'community',
            title: 'Post Liked',
            desc: 'Someone liked your post in the Community Hub.',
            time: '1 hour ago',
            read: false,
            icon: MessageSquare,
            color: '#7c3aed'
        },
        {
            id: 3,
            type: 'system',
            title: 'Security Update',
            desc: 'We have updated our privacy policy to better protect your data.',
            time: '5 hours ago',
            read: true,
            icon: ShieldCheck,
            color: '#10b981'
        },
        {
            id: 4,
            type: 'alert',
            title: 'Incomplete Quiz',
            desc: 'Don\'t forget to finish the "Women & Workplace" quiz to earn points!',
            time: '1 day ago',
            read: true,
            icon: AlertTriangle,
            color: '#ef4444'
        }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('notif.title')}</Text>
                    <Text style={styles.headerSub}>{notifications.filter(n => !n.read).length} {t('notif.unread_alerts', { defaultValue: 'unread alerts' })}</Text>
                </View>
                <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
                    <ShieldCheck size={20} color="#7c3aed" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                        <Animated.View 
                            key={n.id} 
                            entering={FadeInRight.delay(i * 100)} 
                            exiting={FadeOutLeft}
                            style={[styles.notifCard, !n.read && styles.notifUnread]}
                        >
                            <View style={[styles.iconBox, { backgroundColor: n.color + '15' }]}>
                                <n.icon size={22} color={n.color} />
                            </View>
                            <View style={styles.content}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.title}>{n.title}</Text>
                                    {!n.read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.desc}>{n.desc}</Text>
                                <View style={styles.footer}>
                                    <View style={styles.timeRow}>
                                        <Clock size={12} color="rgba(255,255,255,0.3)" />
                                        <Text style={styles.time}>{n.time}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteNotification(n.id)}>
                                        <Trash2 size={16} color="rgba(255,255,255,0.2)" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <BellOff size={60} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyTitle}>{t('notif.empty_title')}</Text>
                        <Text style={styles.emptySub}>{t('notif.empty_sub')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    readAllBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7c3aed15', borderRadius: 12 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    notifCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    notifUnread: { backgroundColor: 'rgba(124, 58, 237, 0.05)', borderColor: 'rgba(124, 58, 237, 0.2)' },
    iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    title: { color: 'white', fontSize: 16, fontWeight: '700' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed' },
    desc: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    time: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '500' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginTop: 20 },
    emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }
});

export default NotificationsScreen;

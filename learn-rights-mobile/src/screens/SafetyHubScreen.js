import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Alert, Vibration, ScrollView } from 'react-native';
import { ShieldAlert, Phone, MapPin, X, ChevronRight, Zap, Volume2, Activity, Clock, ShieldCheck, Video, Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafety } from '../contexts/SafetyModeContext';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';
import * as Linking from 'expo-linking';

const { width, height } = Dimensions.get('window');

const SafetyHubScreen = ({ navigation }) => {
    const { deactivateSafetyMode, triggerManualSOS, shakeEnabled, toggleShakeTrigger, startRecording, stopRecording, isRecording, pickCustomRingtone, customRingtoneUri, recentRecordings } = useSafety();
    const { user } = useUser();
    const [sosPulse] = useState(new Animated.Value(1));
    const [isSOSLoading, setIsSOSLoading] = useState(false);
    const [powerSaverActive, setPowerSaverActive] = useState(false);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(sosPulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                Animated.timing(sosPulse, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();
    }, []);
    

    const handleSOS = async () => {
        setIsSOSLoading(true);
        Vibration.vibrate([0, 500, 200, 500]);
        try {
            // Start automated recording immediately
            startRecording();
            await triggerManualSOS("EMERGENCY HELP NEEDED! I am in Safety Mode. Recording started.");
            Alert.alert(t('safety.sos_sent_title'), t('safety.sos_sent_msg'));
        } catch (e) {
            // Already handled in context
        } finally {
            setIsSOSLoading(false);
        }
    };

    const startFakeCall = () => {
        Alert.alert(
            t('safety.fake_call'),
            "An incoming call from 'Police' will trigger immediately. Use this as an excuse to leave Safely.",
            [{ text: "Cancel", style: "cancel" }, { 
                text: "Start", 
                onPress: () => {
                    navigation.navigate('FakeCall');
                }
            }]
        );
    };

    const handleExit = () => {
        Alert.alert(
            t('safety.exit_title'),
            t('safety.exit_msg'),
            [
                { text: t('safety.exit_cancel'), style: "cancel" },
                { text: t('safety.exit_confirm'), style: "destructive", onPress: () => {
                    deactivateSafetyMode();
                    navigation.navigate('Main', { screen: 'Home' });
                }}
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a0b2e', '#0f0c29']} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                <View style={styles.statusIndicator}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.statusText}>{t('safety.active_status')}</Text>
                </View>
                <TouchableOpacity onPress={handleExit} style={styles.closeBtn}>
                    <X color="white" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sosContainer}>
                    <Animated.View style={[styles.sosRing, { transform: [{ scale: sosPulse }] }]} />
                    <TouchableOpacity 
                        activeOpacity={0.8} 
                        onPress={handleSOS}
                        disabled={isSOSLoading}
                        style={styles.sosButton}
                    >
                        <LinearGradient 
                            colors={['#ef4444', '#dc2626']} 
                            style={styles.sosGradient}
                        >
                            <ShieldAlert color="white" size={48} />
                            <Text style={styles.sosText}>{isSOSLoading ? t('safety.sending_sos') : t('safety.trigger_sos')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.sosNote}>Sends location to {user?.emergencyContacts?.length || 0} trusted contacts</Text>
                </View>

                <View style={styles.contactsSummary}>
                    <ShieldCheck color="#10b981" size={20} />
                    <Text style={styles.contactsText}>
                        {user?.emergencyContacts?.length || 0} {t('safety.contacts_active')}
                    </Text>
                </View>

                <View style={styles.toolsGrid}>
                    <TouchableOpacity style={styles.toolCard} onPress={toggleShakeTrigger}>
                        <View style={[styles.toolIcon, { backgroundColor: shakeEnabled ? '#7c3aed' : 'rgba(255,255,255,0.1)' }]}>
                            <ShieldAlert color="white" size={24} />
                        </View>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>{t('safety.shake_trigger')}</Text>
                            <Text style={styles.toolDesc}>{t('safety.shake_trigger_sub')}</Text>
                        </View>
                        <View style={[styles.toggleTrack, shakeEnabled && styles.toggleTrackActive]}>
                            <View style={[styles.toggleThumb, shakeEnabled && styles.toggleThumbActive]} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolCard} onPress={startFakeCall}>
                        <View style={[styles.toolIcon, { backgroundColor: '#3b82f6' }]}>
                            <Phone color="white" size={24} />
                        </View>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>{t('safety.fake_call')}</Text>
                            <Text style={styles.toolDesc}>{t('safety.fake_call_sub')}</Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolCard} onPress={() => {
                        const query = "Safe community buildings, restaurants and police stations near me";
                        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
                    }}>
                        <View style={[styles.toolIcon, { backgroundColor: '#10b981' }]}>
                            <MapPin color="white" size={24} />
                        </View>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>{t('safety.safe_havens')}</Text>
                            <Text style={styles.toolDesc}>Find safe places nearby</Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolCard} onPress={pickCustomRingtone}>
                        <View style={[styles.toolIcon, { backgroundColor: '#8b5cf6' }]}>
                            <Volume2 color="white" size={24} />
                        </View>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>Custom Ringtone</Text>
                            <Text style={styles.toolDesc}>{customRingtoneUri ? "Custom set" : "Required for sound"}</Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolCard} onPress={() => setPowerSaverActive(true)}>
                        <View style={[styles.toolIcon, { backgroundColor: '#f59e0b' }]}>
                            <Zap color="white" size={24} />
                        </View>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>{t('safety.power_saver')}</Text>
                            <Text style={styles.toolDesc}>Maximize battery life</Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Activity color="white" size={20} />
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                </View>

                {recentRecordings.length > 0 ? (
                    recentRecordings.map((rec, index) => (
                        <View key={rec._id || index} style={styles.activityCard}>
                            <View style={[styles.activityIcon, { backgroundColor: rec.type === 'video' ? '#ef4444' : '#3b82f6' }]}>
                                {rec.type === 'video' ? <Video color="white" size={16} /> : <Mic color="white" size={16} />}
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityType}>{rec.type === 'video' ? 'Video Documentation' : 'Audio Documentation'}</Text>
                                <View style={styles.activityMeta}>
                                    <Clock color="rgba(255,255,255,0.4)" size={12} />
                                    <Text style={styles.activityTime}>{new Date(rec.timestamp * 1000).toLocaleString()}</Text>
                                </View>
                            </View>
                            <ChevronRight color="rgba(255,255,255,0.2)" size={18} />
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyActivity}>
                        <Text style={styles.emptyText}>No recent recordings found</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('safety.emergency_note')}</Text>
                </View>
            </ScrollView>

            {powerSaverActive && (
                <View style={styles.powerSaverOverlay}>
                    <View style={styles.powerSaverContent}>
                        <Zap size={64} color="#f59e0b" style={{ opacity: 0.5 }} />
                        <Text style={styles.powerSaverTitle}>Power Saving Active</Text>
                        <Text style={styles.powerSaverDesc}>Background apps suspended. Minimum brightness active. SOS features remain ready.</Text>
                        <TouchableOpacity 
                            style={styles.exitPowerBtn} 
                            onPress={() => setPowerSaverActive(false)}
                        >
                            <Text style={styles.exitPowerText}>Exit Power Saving</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
    statusIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginRight: 8 },
    statusText: { color: '#ef4444', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { flex: 1, marginTop: 20 },
    scrollContent: { paddingBottom: 100 },
    sosContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
    sosRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.2)' },
    sosButton: { width: 180, height: 180, borderRadius: 90, elevation: 20, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
    sosGradient: { flex: 1, borderRadius: 90, justifyContent: 'center', alignItems: 'center' },
    sosText: { color: 'white', fontSize: 18, fontWeight: '900', marginTop: 10, letterSpacing: 1 },
    sosNote: { color: 'rgba(255,255,255,0.5)', marginTop: 25, fontSize: 14 },
    toolsGrid: { flex: 1, gap: 15 },
    toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    toolIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    toolInfo: { flex: 1 },
    toolTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
    toolDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
    footer: { paddingVertical: 20, alignItems: 'center' },
    footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' },
    // Toggle Styles
    toggleTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', padding: 2 },
    toggleTrackActive: { backgroundColor: '#7c3aed' },
    toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },
    toggleThumbActive: { alignSelf: 'flex-end' },
    // Power Saver
    powerSaverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    powerSaverContent: { alignItems: 'center', padding: 40 },
    powerSaverTitle: { color: 'white', fontSize: 24, fontWeight: '800', marginTop: 20 },
    powerSaverDesc: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 10, fontSize: 14 },
    exitPowerText: { color: 'white', fontWeight: '700' },
    // New Styles
    contactsSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', alignSelf: 'center' },
    contactsText: { color: '#10b981', marginLeft: 8, fontSize: 13, fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 15, paddingHorizontal: 5 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 10 },
    activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    activityIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    activityInfo: { flex: 1 },
    activityType: { color: 'white', fontSize: 14, fontWeight: '600' },
    activityMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    activityTime: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 4 },
    emptyActivity: { padding: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 }
});

export default SafetyHubScreen;

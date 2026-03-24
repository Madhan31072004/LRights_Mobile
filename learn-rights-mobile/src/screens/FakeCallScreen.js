import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Vibration, AppState } from 'react-native';
import { Phone, PhoneOff, Mic, Video, Volume2, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createAudioPlayer } from 'expo-audio';
import { CameraView, Camera } from 'expo-camera';
import { useSafety } from '../contexts/SafetyModeContext';
import { t } from '../utils/translation';

const FakeCallScreen = ({ navigation }) => {
    const { startRecording, stopRecording, triggerManualSOS, customRingtoneUri, systemDefaultRingtone } = useSafety();
    const [status, setStatus] = useState('ringing'); // ringing, active, ended
    const [timer, setTimer] = useState(0);
    const [ringtone, setRingtone] = useState(null);
    const cameraRef = useRef(null);
    const [hasCamPermission, setHasCamPermission] = useState(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasCamPermission(status === 'granted');

            try {
                // Prioritize user-picked file, then system default (Android), then fallback asset
                let source;
                if (customRingtoneUri) {
                    source = { uri: customRingtoneUri };
                } else if (systemDefaultRingtone) {
                    source = { uri: systemDefaultRingtone };
                } else {
                    // Fallback to the local siren sound provided by the user
                    source = require('../../assets/sounds/police_siren.mp3');
                }

                if (source) {
                    console.log("[FakeCall] Loading sound from:", source.uri || "local asset (require)");
                    const player = createAudioPlayer(source);
                    player.loop = true;
                    player.shouldPlay = true; // Extra hint for some versions
                    player.play();
                    setRingtone(player);
                }
            } catch (e) {
                console.log("Ringtone load failed, using silent mode", e);
            }
        })();
        const interval = setInterval(() => {
            if (status === 'ringing') Vibration.vibrate([500, 1000]);
        }, 1500);

        // Auto-answer after 24 seconds
        const autoAnswerToken = setTimeout(() => {
            if (status === 'ringing') handleAnswer();
        }, 24000);

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        ).start();

        return () => {
            clearInterval(interval);
            clearTimeout(autoAnswerToken);
            if (ringtone) ringtone.remove();
            Vibration.cancel();
        };
    }, []);

    useEffect(() => {
        let interval;
        if (status === 'active') {
            interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const handleAnswer = async () => {
        setStatus('active');
        if (ringtone) ringtone.pause();
        Vibration.cancel();

        // Start Audio Recording via Context
        startRecording();

        // Start Video Recording Locally
        if (cameraRef.current) {
            try {
                const videoData = await cameraRef.current.recordAsync();
                console.log("[FakeCall] Video recorded:", videoData.uri);
            } catch (e) {
                console.error("Video record failed", e);
            }
        }

        triggerManualSOS("Fake Call Activated - Recording started.");
    };

    const handleDecline = () => {
        stopRecording();
        if (ringtone) ringtone.pause();
        // Stop video recording if active
        if (cameraRef.current) {
            try { cameraRef.current.stopRecording(); } catch (e) {}
        }
        setStatus('ended');
        setTimeout(() => navigation.goBack(), 1000);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (status === 'ringing') {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#2c3e50', '#000000']} style={StyleSheet.absoluteFill} />

                <View style={styles.profileSection}>
                    <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <User color="white" size={80} />
                    </Animated.View>
                    <Text style={styles.callerName}>Police</Text>
                    <Text style={styles.incomingText}>Incoming Call...</Text>
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity onPress={handleDecline} style={[styles.callBtn, { backgroundColor: '#ff4444' }]}>
                        <PhoneOff color="white" size={32} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAnswer} style={[styles.callBtn, { backgroundColor: '#44ff44' }]}>
                        <Phone color="white" size={32} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000000', '#1a1a1a']} style={StyleSheet.absoluteFill} />

            {status === 'active' && hasCamPermission && (
                <CameraView
                    ref={cameraRef}
                    style={styles.cameraPreview}
                    facing="front"
                    mode="video"
                />
            )}

            <View style={styles.activeProfile}>
                <Text style={styles.callerName}>Police</Text>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
            </View>

            <View style={styles.activeGrid}>
                <View style={styles.activeBtn}>
                    <Mic color="white" size={24} />
                    <Text style={styles.btnLabel}>Mute</Text>
                </View>
                <View style={styles.activeBtn}>
                    <Video color="white" size={24} />
                    <Text style={styles.btnLabel}>Video</Text>
                </View>
                <View style={styles.activeBtn}>
                    <Volume2 color="white" size={24} />
                    <Text style={styles.btnLabel}>Speaker</Text>
                </View>
            </View>

            <TouchableOpacity onPress={handleDecline} style={styles.hangUpBtn}>
                <PhoneOff color="white" size={32} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between', paddingVertical: 100, alignItems: 'center' },
    profileSection: { alignItems: 'center' },
    avatarCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    callerName: { color: 'white', fontSize: 32, fontWeight: '600' },
    incomingText: { color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 10 },
    controlsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: 40 },
    callBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
    activeProfile: { alignItems: 'center' },
    timerText: { color: 'white', fontSize: 18, marginTop: 5 },
    activeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 40, paddingHorizontal: 40 },
    activeBtn: { alignItems: 'center', gap: 10 },
    btnLabel: { color: 'white', fontSize: 12 },
    hangUpBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center' },
    cameraPreview: { ...StyleSheet.absoluteFillObject, opacity: 0.6 }
});

export default FakeCallScreen;

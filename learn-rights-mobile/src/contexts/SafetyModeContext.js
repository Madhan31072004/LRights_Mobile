import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, AppState, Platform, Linking } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SMS from 'expo-sms';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { AudioModule, RecordingPresets } from 'expo-audio';
import { Camera } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';
import { useUser } from './UserContext';
import * as Battery from 'expo-battery';
import { t } from '../utils/translation';

const LOCATION_TASK_NAME = 'background-location-task';
const SafetyModeContext = createContext();

export const SafetyModeProvider = ({ children }) => {
    const { user, userId, loading } = useUser();
    const [isSafetyModeActive, setIsSafetyModeActive] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [lastLocation, setLastLocation] = useState(null);
    const [isLowBatteryAlertShown, setIsLowBatteryAlertShown] = useState(false);
    const [shakeEnabled, setShakeEnabled] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [customRingtoneUri, setCustomRingtoneUri] = useState(null);
    const [systemDefaultRingtone, setSystemDefaultRingtone] = useState(null);
    const [recentRecordings, setRecentRecordings] = useState([]);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isVoiceTriggerEnabled, setIsVoiceTriggerEnabled] = useState(false);
    const [voiceInterval, setVoiceInterval] = useState(null);
    const [foregroundWatcher, setForegroundWatcher] = useState(null);

    // Initial battery and location setup
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const level = await Battery.getBatteryLevelAsync();
                setBatteryLevel(level);
            }

            const storedShake = await AsyncStorage.getItem('shake_to_trigger');
            if (storedShake === 'true') setShakeEnabled(true);
            
            const storedVoice = await AsyncStorage.getItem('voice_trigger_enabled');
            if (storedVoice === 'true') setIsVoiceTriggerEnabled(true);

            const savedRingtone = await AsyncStorage.getItem('customRingtoneUri');
            if (savedRingtone) setCustomRingtoneUri(savedRingtone);

            // Automated system ringtone access is restricted in standard Expo.
            // We rely on the Custom Ringtone Picker for reliable playback.
            setSystemDefaultRingtone(null);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLastLocation(loc.coords);
            }
        })();

        let subscription;
        if (Platform.OS !== 'web') {
            subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
                setBatteryLevel(batteryLevel);
            });
        }

        return () => subscription && subscription.remove();
    }, []);
    useEffect(() => {
        const loadRecordings = async () => {
            if (!userId) return;
            try {
                const res = await API.get(`/safety/recordings/${userId}`);
                setRecentRecordings(res.data);
            } catch (e) {
                console.error("Failed to load recordings", e);
            }
        };

        loadRecordings();
    }, [userId]);

    // Battery trigger logic
    useEffect(() => {
        if (batteryLevel !== null && batteryLevel < 0.15 && !isSafetyModeActive && !isLowBatteryAlertShown) {
            Alert.alert(
                t('safety.low_battery_title'),
                t('safety.low_battery_msg'),
                [
                    { text: t('safety.not_now'), onPress: () => setIsLowBatteryAlertShown(true), style: "cancel" },
                    { text: t('safety.activate_now'), onPress: () => activateSafetyMode() }
                ]
            );
        }
    }, [batteryLevel, isSafetyModeActive, isLowBatteryAlertShown]);

    const activateSafetyMode = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('safety.perm_needed'), t('safety.perm_msg'));
            return;
        }

        setIsSafetyModeActive(true);
        
        // Get Freshest Location for Activation
        try {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLastLocation(loc.coords);
        } catch (e) {}

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 60000,
            distanceInterval: 50,
            foregroundService: {
                notificationTitle: t('safety.active_status'),
                notificationBody: "Monitoring your location for safety.",
                notificationColor: "#ff0000"
            }
        });

        // Also start a foreground watcher to update state in real-time
        const watcher = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (loc) => setLastLocation(loc.coords)
        );
        // We need to store this watcher to remove it later - using a ref or state
        setForegroundWatcher(watcher);

        // Trigger voice monitor as well
        if (isVoiceTriggerEnabled) {
            startRecording();
        }

        // Trigger initial SOS notify if needed or just start sync
        if (userId && !loading) {
            try {
                await API.post('/safety/sos', { 
                    userId, 
                    message: t('safety.auto_activate_msg'),
                    latitude: lastLocation?.latitude,
                    longitude: lastLocation?.longitude
                });
            } catch (e) {
                console.error("Failed to notify SOS on activation", e);
            }
        } else {
            if (!loading) console.warn("[Safety] UserId is null, skipping backend SOS notification");
        }
    };

    const deactivateSafetyMode = async () => {
        setIsSafetyModeActive(false);
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRegistered) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
        if (foregroundWatcher) {
            foregroundWatcher.remove();
            setForegroundWatcher(null);
        }
        stopRecording();
    };

    const triggerManualSOS = async (message = t('safety.default_sos_msg')) => {
        try {
            // Get Freshest Location possible
            let currentLoc = lastLocation;
            try {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                currentLoc = loc.coords;
                setLastLocation(loc.coords);
            } catch (e) {
                console.warn("[Safety] Failed to get fresh location for SOS, using last known", e);
            }

            // Priority 1: Automated Backend SOS (Twilio)
            if (userId && !loading) {
                const res = await API.post('/safety/sos', { 
                    userId, 
                    message,
                    latitude: currentLoc?.latitude,
                    longitude: currentLoc?.longitude
                });

                if (res.data && res.data.twilio_success) {
                    // Backend successfully sent automated messages via Twilio
                    Alert.alert(t('safety.sos_sent_title'), t('safety.sos_sent_msg'));
                    return 'sent_automated';
                }
            } else {
                console.warn("[Safety] Skipping backend SOS: User not logged in");
            }

            // Priority 2: Native SMS Fallback (if backend didn't send automated msgs)
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                const emergencyNumbers = user?.emergencyContacts?.map(c => c.mobile) || [];
                if (emergencyNumbers.length === 0) {
                    Alert.alert(t('safety.no_contacts_title'), t('safety.no_contacts_msg'));
                    return;
                }
                let locLink = "";
                if (currentLoc) {
                    locLink = `\nMy live location: https://maps.google.com/?q=${currentLoc.latitude},${currentLoc.longitude}`;
                }
                
                // This will open the SMS app for manual confirmation
                const { result } = await SMS.sendSMSAsync(
                    emergencyNumbers,
                    `${message}${locLink}`
                );
                return result;
            } else {
                Alert.alert(t('safety.sms_unavailable_title'), t('safety.sms_unavailable_msg'));
            }
        } catch (e) {
            console.error("SOS Trigger Error:", e);
            Alert.alert(t('safety.sos_failed_title'), t('safety.sos_failed_msg'));
        }
    };

    const toggleShakeTrigger = async () => {
        const newValue = !shakeEnabled;
        setShakeEnabled(newValue);
        await AsyncStorage.setItem('shake_to_trigger', newValue.toString());
    };

    const toggleVoiceTrigger = async () => {
        const newValue = !isVoiceTriggerEnabled;
        setIsVoiceTriggerEnabled(newValue);
        await AsyncStorage.setItem('voice_trigger_enabled', newValue.toString());
    };

    // Accelerometer logic for Shake-to-Trigger
    useEffect(() => {
        const SHAKE_THRESHOLD = 2.5; // Lowered for better sensitivity
        const PEAK_WINDOW = 1000;    // Time window to count peaks (ms)
        const REQUIRED_PEAKS = 6;     // Number of peaks to trigger
        
        let peaks = [];
        let isTriggering = false;

        const _subscribe = () => {
            setSubscription(
                Accelerometer.addListener(data => {
                    if (!shakeEnabled) return;
                    
                    const { x, y, z } = data;
                    const acceleration = Math.sqrt(x * x + y * y + z * z);
                    const now = Date.now();
                    
                    if (acceleration > SHAKE_THRESHOLD) {
                        // Filter out peaks that are too close together (debouncing peaks)
                        if (peaks.length === 0 || (now - peaks[peaks.length - 1]) > 50) {
                            peaks.push(now);
                        }
                        
                        // Remove old peaks outside the window
                        peaks = peaks.filter(p => now - p < PEAK_WINDOW);
                        
                        if (peaks.length >= REQUIRED_PEAKS && !isTriggering) {
                            isTriggering = true;
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            triggerManualSOS(t('safety.shake_detected'));
                            startRecording();
                            
                            // Reset after 10s to avoid multiple triggers
                            setTimeout(() => {
                                isTriggering = false;
                                peaks = [];
                            }, 10000);
                        }
                    }
                })
            );
            Accelerometer.setUpdateInterval(50);
        };

        const _unsubscribe = () => {
            subscription && subscription.remove();
            setSubscription(null);
        };

        if (shakeEnabled) {
            _subscribe();
        } else {
            _unsubscribe();
        }

        return () => _unsubscribe();
    }, [shakeEnabled, user]);

    // "Going Out" Reminder logic
    useEffect(() => {
        const checkEveningReminder = () => {
            const hour = new Date().getHours();
            // Remind if it's evening (after 6 PM) and safety mode is NOT active
            if (hour >= 18 && !isSafetyModeActive) {
                Alert.alert(
                    "Heading Out?",
                    "It's getting late. We recommend turning on 'Safety Mode' and 'Voice Monitoring' for your protection.",
                    [
                        { text: "Not Now", style: "cancel" },
                        { text: "Activate", onPress: () => activateSafetyMode() }
                    ]
                );
            }
        };

        const interval = setInterval(checkEveningReminder, 3600000); // Check every hour
        checkEveningReminder(); // Check on mount
        return () => clearInterval(interval);
    }, [isSafetyModeActive]);

    const startRecording = async () => {
        if (recording || isRecording || isPreparing) return;
        setIsPreparing(true);
        try {
            const { status } = await AudioModule.requestRecordingPermissionsAsync();
            if (status !== 'granted') {
                setIsPreparing(false);
                return;
            }
            
            const newRecording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
            await newRecording.prepareToRecordAsync();
            newRecording.record();
            
            setRecording(newRecording);
            setIsRecording(true);
            setIsPreparing(false);
            
            // Start Voice Monitor if enabled
            if (isVoiceTriggerEnabled) {
                const interval = setInterval(async () => {
                    if (newRecording) {
                        const status = await newRecording.getStatusAsync();
                        // This is a simplified scream detection based on peak power
                        // status.metering is usually available in many audio libs, but expo-audio 
                        // behavior might vary. We use a volume threshold here if available.
                        if (status.isRecording && status.durationMillis > 1000) {
                             // Logic to detect spike in noise level
                             // console.log("Current noise level:", status.metering);
                        }
                    }
                }, 1000);
                setVoiceInterval(interval);
            }
        } catch (err) {
            setIsPreparing(false);
            console.error('[Safety] Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (voiceInterval) {
            clearInterval(voiceInterval);
            setVoiceInterval(null);
        }
        if (!recording) return;
        try {
            setIsRecording(false);
            const { uri } = await recording.stop();
            setRecording(null);
            
            if (uri && userId) {
                console.log("[Safety] Recording stopped, uploading:", uri);
                
                // 1. Prepare FormData for file upload
                const formData = new FormData();
                formData.append('userId', userId);
                formData.append('type', 'audio');
                formData.append('file', {
                    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                    type: 'audio/m4a', // Default for high quality preset
                    name: `safety_audio_${Date.now()}.m4a`
                });

                // 2. Upload to the new file endpoint
                const uploadRes = await API.post('/safety/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data && uploadRes.data.url) {
                    console.log("[Safety] Upload success, saving metadata:", uploadRes.data.url);
                    
                    // 3. Save metadata to MongoDB
                    await API.post('/safety/recordings', {
                        userId,
                        type: 'audio',
                        url: uploadRes.data.url,
                        location: lastLocation ? {
                            lat: lastLocation.latitude,
                            lng: lastLocation.longitude
                        } : undefined
                    });
                    
                    // Refresh recent recordings list
                    const res = await API.get(`/safety/recordings/${userId}`);
                    setRecentRecordings(res.data);
                }
            }
        } catch (err) {
            console.error('[Safety] Failed to stop/upload recording', err);
        }
    };

    const pickCustomRingtone = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['audio/*'],
                copyToCacheDirectory: true
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const destination = `${FileSystem.documentDirectory}custom_ringtone.mp3`;
                
                // Copy to local document directory for persistence
                await FileSystem.copyAsync({
                    from: asset.uri,
                    to: destination
                });
                
                setCustomRingtoneUri(destination);
                await AsyncStorage.setItem('customRingtoneUri', destination);
                Alert.alert("Success", "Custom ringtone has been set!");
            }
        } catch (err) {
            console.error('[Safety] Document picker error', err);
            Alert.alert("Error", "Failed to pick ringtone");
        }
    };

    return (
        <SafetyModeContext.Provider value={{
            isSafetyModeActive,
            batteryLevel,
            lastLocation,
            activateSafetyMode,
            deactivateSafetyMode,
            triggerManualSOS,
            shakeEnabled,
            toggleShakeTrigger,
            isVoiceTriggerEnabled,
            toggleVoiceTrigger,
            isRecording,
            startRecording,
            stopRecording,
            customRingtoneUri,
            systemDefaultRingtone,
            pickCustomRingtone,
            recentRecordings
        }}>
            {children}
        </SafetyModeContext.Provider>
    );
};

export const useSafety = () => useContext(SafetyModeContext);


// Register the background task outside the provider
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error("Background location task error:", error);
        return;
    }
    if (data) {
        const { locations } = data;
        const location = locations[0];
        if (location) {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    // Use Fetch directly as axios instance might not be ready or have different config in background
                    // This is a simplified example of background sync
                    await fetch(`${API.defaults.baseURL}/safety/location`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: storedUserId,
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        })
                    });
                }
            } catch (e) {
                console.error("Failed to sync background location", e);
            }
        }
    }
});

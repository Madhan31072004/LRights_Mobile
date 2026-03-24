import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Bot, Save, Sparkles, Shield, Globe, RefreshCw } from 'lucide-react-native';
import API from '../api/axios';

const AdminBotSettingsScreen = ({ navigation }) => {
    const [settings, setSettings] = useState({
        systemPrompt: '',
        safetyLevel: 'medium',
        webSearchEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleReset = () => {
        Alert.alert('Reset Settings', 'Restore default AI personality?', [
            { text: 'Cancel' },
            { 
                text: 'Reset', 
                onPress: async () => {
                    const defaults = {
                        systemPrompt: "You are LegalAid AI, a personalized smart tutor specializing in women's rights and laws in India. Identify yourself as a helper built for Learn Rights. Provide structured and informative answers.",
                        safetyLevel: 'medium',
                        webSearchEnabled: true
                    };
                    setSettings(defaults);
                    try {
                        await API.patch('/admin/bot/settings', defaults);
                        Alert.alert('Success', 'Settings reset to defaults');
                    } catch (err) {
                        Alert.alert('Error', 'Failed to reset settings');
                    }
                }
            }
        ]);
    };

    const fetchSettings = async () => {
        try {
            const res = await API.get('/admin/bot/settings');
            setSettings(res.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch bot settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.patch('/admin/bot/settings', settings);
            Alert.alert('Success', 'Settings updated successfully');
        } catch (err) {
            Alert.alert('Error', 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.loading}><ActivityIndicator color="#7c3aed" /></View>;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chatbot Settings</Text>
                <TouchableOpacity onPress={handleReset}>
                    <RefreshCw size={22} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Bot size={20} color="#7c3aed" />
                        <Text style={styles.sectionTitle}>AI Personality (System Prompt)</Text>
                    </View>
                    <Text style={styles.desc}>Define how the AI should behave, its tone, and core expertise.</Text>
                    <TextInput 
                        style={styles.promptInput}
                        multiline
                        numberOfLines={8}
                        value={settings.systemPrompt}
                        onChangeText={(t) => setSettings({...settings, systemPrompt: t})}
                        placeholder="Enter system prompt..."
                        placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}><Shield size={20} color="#7c3aed" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Safety Filter Level</Text>
                            <Text style={styles.cardSub}>Current: {settings.safetyLevel.toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.toggleBtn}
                            onPress={() => setSettings({...settings, safetyLevel: settings.safetyLevel === 'high' ? 'medium' : 'high' })}
                        >
                            <Text style={styles.toggleText}>{settings.safetyLevel === 'high' ? 'HIGH' : 'MEDIUM'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}><Globe size={20} color="#3b82f6" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Real-time Web Search</Text>
                            <Text style={styles.cardSub}>Allow AI to search for current law updates</Text>
                        </View>
                        <Switch 
                            value={settings.webSearchEnabled} 
                            onValueChange={(v) => setSettings({...settings, webSearchEnabled: v})}
                            trackColor={{ false: "#3e3e3e", true: "#7c3aed" }}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="white" /> : <><Save size={20} color="white" /><Text style={styles.saveBtnText}>Save Configuration</Text></>}
                </TouchableOpacity>

                <View style={styles.tips}>
                    <Sparkles size={16} color="#fbbf24" />
                    <Text style={styles.tipsText}>Tip: Use clear, instructional language in the prompt to improve bot accuracy.</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    scroll: { padding: 20, gap: 20, paddingBottom: 50 },
    section: { gap: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
    desc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 5 },
    promptInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, color: 'white', fontSize: 15, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { color: 'white', fontSize: 15, fontWeight: '700' },
    cardSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    toggleBtn: { backgroundColor: 'rgba(124,58,237,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
    toggleText: { color: '#7c3aed', fontSize: 11, fontWeight: '900' },
    saveBtn: { backgroundColor: '#7c3aed', height: 50, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 },
    saveBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    tips: { flexDirection: 'row', gap: 10, marginTop: 20, paddingHorizontal: 10 },
    tipsText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, flex: 1 },
    loading: { flex: 1, backgroundColor: '#0f0c29', justifyContent: 'center', alignItems: 'center' }
});

export default AdminBotSettingsScreen;

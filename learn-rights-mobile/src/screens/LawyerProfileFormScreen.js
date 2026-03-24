import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Save, User, Briefcase, Info, MapPin, Phone, Mail } from 'lucide-react-native';
import API from '../api/axios';
import { t } from '../utils/translation';
import { useUser } from '../contexts/UserContext';

const LawyerProfileFormScreen = ({ navigation }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        specialization: '',
        experience: '',
        bio: '',
        email: '',
        phone: '',
        officeAddress: ''
    });

    const handleSubmit = async () => {
        if (!form.name || !form.specialization || !form.phone || !form.email) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await API.post('/lawyers/profile', {
                ...form,
                userId: user._id,
                experience: parseInt(form.experience) || 0
            });
            Alert.alert('Success', t('lawyers.success'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to submit profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View style={{ marginLeft: 15 }}>
                    <Text style={styles.headerTitle}>{t('lawyers.register')}</Text>
                    <Text style={styles.headerSub}>Professional Verification</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <User size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.name')} *</Text>
                    </View>
                    <TextInput 
                        style={styles.input}
                        value={form.name}
                        onChangeText={(v) => setForm({...form, name: v})}
                        placeholder="Advocate Name"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Briefcase size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.specialization')} *</Text>
                    </View>
                    <TextInput 
                        style={styles.input}
                        value={form.specialization}
                        onChangeText={(v) => setForm({...form, specialization: v})}
                        placeholder="e.g. Civil Rights, Family Law"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Info size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.experience')} (Years)</Text>
                    </View>
                    <TextInput 
                        style={styles.input}
                        value={form.experience}
                        onChangeText={(v) => setForm({...form, experience: v})}
                        placeholder="Years of practice"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Phone size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.phone')} *</Text>
                    </View>
                    <TextInput 
                        style={styles.input}
                        value={form.phone}
                        onChangeText={(v) => setForm({...form, phone: v})}
                        placeholder="Contact number"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Mail size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.email')} *</Text>
                    </View>
                    <TextInput 
                        style={styles.input}
                        value={form.email}
                        onChangeText={(v) => setForm({...form, email: v})}
                        placeholder="Professional email"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <MapPin size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.office')}</Text>
                    </View>
                    <TextInput 
                        style={styles.input}
                        value={form.officeAddress}
                        onChangeText={(v) => setForm({...form, officeAddress: v})}
                        placeholder="Complete office address"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        multiline
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Info size={16} color="#7c3aed" />
                        <Text style={styles.label}>{t('lawyers.fields.bio')}</Text>
                    </View>
                    <TextInput 
                        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                        value={form.bio}
                        onChangeText={(v) => setForm({...form, bio: v})}
                        placeholder="Tell us about your professional background and cases you handle..."
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        multiline
                    />
                </View>

                <TouchableOpacity 
                    style={styles.submitBtn} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <>
                            <Save size={20} color="white" />
                            <Text style={styles.submitBtnText}>Submit for Verification</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: { padding: 25 },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' },
    input: { backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, color: 'white', fontSize: 16 },
    submitBtn: { backgroundColor: '#7c3aed', height: 55, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: '800' }
});

export default LawyerProfileFormScreen;

import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X, Brain, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

const AIExplanationModal = ({ visible, onClose, explanation, loading }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View entering={ZoomIn} style={styles.container}>
                    <LinearGradient colors={['#1a1744', '#0f0c29']} style={styles.gradient} />
                    
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Brain size={24} color="#7c3aed" />
                            <Text style={styles.headerTitle}>AI Legal Insight</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {loading ? (
                            <View style={styles.center}>
                                <ActivityIndicator size="large" color="#7c3aed" />
                                <Text style={styles.loadingText}>LegalAid AI is thinking...</Text>
                            </View>
                        ) : (
                            <Animated.View entering={FadeIn}>
                                <View style={styles.insightBox}>
                                    <ShieldCheck size={20} color="#10b981" style={styles.icon} />
                                    <Text style={styles.explanationText}>{explanation}</Text>
                                </View>
                                
                                <Text style={styles.disclaimer}>
                                    Note: This is educational information. For specific legal cases, please consult a registered legal practitioner.
                                </Text>
                            </Animated.View>
                        )}
                    </ScrollView>

                    {!loading && (
                        <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                            <Text style={styles.doneBtnText}>Got it!</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { width: '100%', maxHeight: '80%', backgroundColor: '#1a1744', borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
    gradient: { ...StyleSheet.absoluteFillObject },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 5 },
    content: { padding: 20 },
    center: { padding: 40, alignItems: 'center' },
    loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: 15, fontSize: 14, fontWeight: '600' },
    insightBox: { flexDirection: 'row', gap: 12 },
    icon: { marginTop: 2 },
    explanationText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 24, flex: 1, fontWeight: '500' },
    disclaimer: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontStyle: 'italic', marginTop: 20, textAlign: 'center' },
    doneBtn: { margin: 20, marginTop: 0, backgroundColor: '#7c3aed', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    doneBtnText: { color: 'white', fontWeight: '800', fontSize: 16 }
});

export default AIExplanationModal;

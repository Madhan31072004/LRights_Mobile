import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Search, Phone, Mail, MapPin, UserCheck, PlusCircle, Briefcase } from 'lucide-react-native';
import API from '../api/axios';
import { t } from '../utils/translation';
import { useUser } from '../contexts/UserContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const LawyersDirectoryScreen = ({ navigation }) => {
    const { user } = useUser();
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/lawyers');
            setLawyers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLawyers();
        }, [])
    );

    const filteredLawyers = lawyers.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderLawyerCard = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        <UserCheck size={16} color="#10b981" />
                    </View>
                    <Text style={styles.spec}>{item.specialization}</Text>
                </View>
            </View>
            
            <View style={styles.expRow}>
                <Briefcase size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.expText}>{t('lawyers.exp', { n: item.experience })}</Text>
            </View>

            <Text style={styles.bio} numberOfLines={3}>{item.bio}</Text>

            <View style={styles.contactSection}>
                <TouchableOpacity 
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                    <Phone size={16} color="#7c3aed" />
                    <Text style={styles.contactText}>{item.phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(`mailto:${item.email}`)}
                >
                    <Mail size={16} color="#7c3aed" />
                    <Text style={styles.contactText}>{item.email}</Text>
                </TouchableOpacity>
                <View style={styles.contactItem}>
                    <MapPin size={16} color="rgba(255,255,255,0.4)" />
                    <Text style={[styles.contactText, { color: 'rgba(255,255,255,0.4)' }]}>{item.officeAddress}</Text>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.headerTitle}>{t('lawyers.title')}</Text>
                    <Text style={styles.headerSub}>{t('lawyers.subtitle')}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('LawyerProfileForm')}
                    style={styles.registerBtn}
                >
                    <PlusCircle size={24} color="#7c3aed" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Search size={20} color="rgba(255,255,255,0.3)" />
                <TextInput 
                    style={styles.searchInput}
                    placeholder={t('lawyers.search')}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.loading}><ActivityIndicator color="#7c3aed" /></View>
            ) : (
                <FlatList 
                    data={filteredLawyers}
                    renderItem={renderLawyerCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>{t('lawyers.none')}</Text>
                        </View>
                    }
                />
            )}
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
    registerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        margin: 20, 
        paddingHorizontal: 15, 
        height: 50, 
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    searchInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 15 },
    list: { padding: 20, paddingBottom: 100 },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12 },
    avatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontSize: 20, fontWeight: '800' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { color: 'white', fontSize: 18, fontWeight: '700' },
    spec: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '500' },
    expRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    expText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
    bio: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20, marginBottom: 20 },
    contactSection: { gap: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    contactItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    contactText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16 }
});

export default LawyersDirectoryScreen;

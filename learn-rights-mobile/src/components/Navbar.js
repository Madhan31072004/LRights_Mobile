import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, FlatList, Dimensions, ScrollView } from 'react-native';
import { Shield, Globe, ChevronDown, Check, Menu, X, Home, BookOpen, MessageSquare, Trophy, User, Award, Layout, LogOut, ShieldCheck, PencilLine, Users } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { t, getLanguage, loadTranslations, LANGUAGES } from '../utils/translation';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const navItems = [
  { name: 'Home', screen: 'Home', icon: Home, labelKey: 'home' },
  { name: 'Modules', screen: 'Modules', icon: BookOpen, labelKey: 'modules' },
  { name: 'Community', screen: 'Community', icon: Users, labelKey: 'community.title' },
  { name: 'Stories', screen: 'Stories', icon: BookOpen, labelKey: 'stories.title' },
  { name: 'Competition', screen: 'Competition', icon: Trophy, labelKey: 'comp.title' },
  { name: 'Bot', screen: 'Bot', icon: MessageSquare, labelKey: 'chatbot' },
  { name: 'Rankings', screen: 'Rankings', icon: Trophy, labelKey: 'leaderboard' },
  { name: 'Profile', screen: 'Profile', icon: User, labelKey: 'profile' },
];

const Navbar = () => {
  const navigation = useNavigation();
  const { user, logout } = useUser();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const currentLangCode = getLanguage();
  const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  const handleLangChange = async (code) => {
    setLangModalVisible(false);
    await loadTranslations(code);
  };

  const navigateTo = (screen) => {
    setMenuVisible(false);
    const tabScreens = ['Home', 'Modules', 'Community', 'Rankings', 'Profile', 'Admin'];
    if (tabScreens.includes(screen)) {
      navigation.navigate('Main', { screen: screen });
    } else {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.left} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
        <View style={styles.logoBox}>
          <Shield size={20} color="white" />
        </View>
        <Text style={styles.title}>{t('app_name')}</Text>
      </TouchableOpacity>

      <View style={styles.right}>
        {/* Language Picker */}
        <TouchableOpacity 
          style={styles.langBtn} 
          onPress={() => setLangModalVisible(true)}
        >
          <Globe size={18} color="#a78bfa" />
          <Text style={styles.langText}>{currentLang.name.split(' ')[0]}</Text>
          <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Menu Toggle */}
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
          <Menu size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setLangModalVisible(false)}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <FlatList
                    data={LANGUAGES}
                    keyExtractor={item => item.code}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.langItem, currentLangCode === item.code && styles.langItemActive]}
                            onPress={() => handleLangChange(item.code)}
                        >
                            <Text style={[styles.langItemText, currentLangCode === item.code && styles.langItemTextActive]}>
                                {item.name}
                            </Text>
                            {currentLangCode === item.code && <Check size={16} color="#7c3aed" />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableOpacity>
      </Modal>

      {/* Hamburger Menu Modal (Menu Bar Parity) */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
            <LinearGradient colors={['#0f0c29', '#1a1744', '#24243e']} style={styles.menuGradient} />
            <View style={styles.menuHeader}>
                <View style={styles.left}>
                    <View style={styles.logoBox}><Shield size={20} color="white" /></View>
                    <Text style={styles.title}>{t('app_name')}</Text>
                </View>
                <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeBtn}>
                    <X size={28} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.menuContent}>
                {/* User Info */}
                <View style={styles.userInfo}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{(user?.name || 'U')[0].toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userNameLarge}>{user?.name || 'Learner'}</Text>
                        <Text style={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'Learner'}</Text>
                    </View>
                </View>

                {/* Nav Items */}
                <View style={styles.menuItems}>
                    {navItems.map((item, idx) => (
                        <TouchableOpacity key={idx} style={styles.menuItem} onPress={() => navigateTo(item.screen)}>
                            <View style={styles.itemIconBox}>
                                <item.icon size={20} color="#7c3aed" />
                            </View>
                            <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
                            <ChevronDown size={16} color="rgba(255,255,255,0.2)" style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                    ))}
                    
                    {user?.role === 'admin' && (
                        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Admin')}>
                            <View style={[styles.itemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <ShieldCheck size={20} color="#10b981" />
                            </View>
                            <Text style={styles.itemLabel}>Admin Dashboard</Text>
                            <ChevronDown size={16} color="rgba(255,255,255,0.2)" style={{ transform: [{ rotate: '-90deg' }] }} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Footer Actions */}
                <TouchableOpacity style={styles.logoutMenuItem} onPress={handleLogout}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>
                <Text style={styles.verText}>Version 1.0.0</Text>
            </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f0c29',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    zIndex: 1000,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 18, fontWeight: '800' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  langBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  langText: { color: '#a78bfa', fontSize: 14, fontWeight: '700' },
  menuBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: width * 0.8, 
    maxHeight: '70%', 
    backgroundColor: '#1a1744', 
    borderRadius: 25, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  langItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  langItemActive: { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 12 },
  langItemText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  langItemTextActive: { color: 'white', fontWeight: '700' },

  // Menu Modal Styles
  menuOverlay: { flex: 1, backgroundColor: '#0f0c29' },
  menuGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menuHeader: { height: 100, paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  menuContent: { padding: 25 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 35 },
  avatarLarge: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  avatarTextLarge: { color: 'white', fontSize: 24, fontWeight: '800' },
  userNameLarge: { color: 'white', fontSize: 22, fontWeight: '800' },
  userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  menuItems: { gap: 8 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    padding: 15, 
    borderRadius: 18, 
    gap: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  itemIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(124, 58, 237, 0.1)', justifyContent: 'center', alignItems: 'center' },
  itemLabel: { color: 'white', fontSize: 16, fontWeight: '600', flex: 1 },
  logoutMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 40, paddingHorizontal: 15 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
  verText: { color: 'rgba(255,255,255,0.1)', fontSize: 12, textAlign: 'center', marginTop: 40, fontWeight: '700' }
});

export default Navbar;

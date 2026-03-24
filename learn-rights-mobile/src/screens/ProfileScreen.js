import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Switch, Image, Modal, FlatList } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { User, BarChart3, Trophy, Camera, Mail, Phone, Globe, Shield, Bell, CheckCircle2, ChevronRight, Gem, BookOpen, Award, Clock, X, Check, Download, ShieldAlert, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import API from '../api/axios';
import { useUser } from "../contexts/UserContext";
import { t, LANGUAGES, loadTranslations, broadcastChange } from '../utils/translation';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user, userId, modules, progress, loading, refreshUserData } = useUser();
  const downloadCertificate = async (cert) => {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: 'Helvetica'; 
              background-color: #0f0c29; 
              color: white; 
              padding: 40px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              margin: 0;
            }
            .cert-card {
              border: 15px solid #7c3aed;
              padding: 40px;
              width: 100%;
              max-width: 800px;
              background: linear-gradient(135deg, #0f0c29 0%, #302b63 100%);
              text-align: center;
              position: relative;
            }
            .title { font-size: 48px; font-weight: 900; letter-spacing: 5px; margin-bottom: 0; }
            .subtitle { font-size: 14px; opacity: 0.5; letter-spacing: 3px; margin-top: 5px; }
            .certify { font-style: italic; opacity: 0.6; margin-top: 50px; }
            .user-name { font-size: 36px; font-weight: 800; border-bottom: 2px solid rgba(255,255,255,0.1); display: inline-block; padding: 10px 40px; margin: 20px 0; }
            .desc { opacity: 0.6; font-size: 16px; margin: 30px 0; }
            .module-title { color: #7c3aed; font-size: 28px; font-weight: 800; }
            .footer { display: flex; justify-content: space-between; margin-top: 80px; align-items: flex-end; }
            .sign { border-top: 1px solid rgba(255,255,255,0.2); width: 150px; padding-top: 10px; font-size: 10px; opacity: 0.5; }
            .seal { font-size: 40px; color: #fbbf24; }
          </style>
        </head>
        <body>
          <div class="cert-card">
            <h1 class="title">CERTIFICATE</h1>
            <p class="subtitle">OF ACHIEVEMENT</p>
            <p class="certify">This is to certify that</p>
            <div class="user-name">${user?.name || 'Learner'}</div>
            <p class="desc">has successfully completed all requirements for the</p>
            <div class="module-title">${cert.title}</div>
            <p class="desc">Learn Rights — Women's Legal Rights Education Program</p>
            <div class="footer">
              <div class="sign">Program Director</div>
              <div class="seal">★</div>
              <div class="sign">Date: ${new Date(cert.earnedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      console.error(err);
      alert("Failed to share certificate");
    }
  };
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = React.useState({ name: '', email: '', mobile: '', preferredLanguage: 'en', emergencyContacts: [] });
  const [prefs, setPrefs] = React.useState({ showOnLeaderboard: false, emailNotifications: true });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showLangModal, setShowLangModal] = React.useState(false);
  const [viewingCert, setViewingCert] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        preferredLanguage: user.preferredLanguage || 'en',
        emergencyContacts: user.emergencyContacts || [{ name: '', mobile: '' }, { name: '', mobile: '' }, { name: '', mobile: '' }]
      });
      setPrefs({
        showOnLeaderboard: !!user.showOnLeaderboard,
        emailNotifications: user.emailNotifications !== false
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('[ProfileScreen] Saving with userId:', userId);
      await API.put(`/profile/${userId}`, { userId, ...formData, ...prefs });
      await refreshUserData();
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!res.canceled) {
      uploadPhoto(res.assets[0]);
    }
  };

  const uploadPhoto = async (asset) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', {
        uri: asset.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      await API.post(`/profile/${user._id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUserData();
      alert("Photo updated!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />;

  const TabButton = ({ id, label, icon: Icon, index }) => {
    const isActive = activeTab === id;
    
    return (
      <TouchableOpacity 
        style={[
          styles.tabBtn, 
          isActive && styles.tabBtnActive,
          { flex: isActive ? 2 : 1 }
        ]} 
        onPress={() => setActiveTab(id)}
      >
        <Animated.View entering={FadeInRight} style={styles.tabItemInner}>
          <Icon size={20} color={isActive ? 'white' : 'rgba(255,255,255,0.4)'} />
          {isActive && (
            <Animated.Text 
              entering={FadeInRight.duration(300)} 
              style={styles.tabBtnTextActive}
              numberOfLines={1}
            >
              {label}
            </Animated.Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
                <LinearGradient colors={['#7c3aed', '#ec4899']} style={styles.avatarInner}>
                    {user?.profilePhoto ? (
                      <Image 
                        source={{ uri: API.defaults.baseURL.replace('/api', '') + user.profilePhoto }} 
                        style={styles.avatarImage} 
                      />
                    ) : (
                      <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'L'}</Text>
                    )}
                </LinearGradient>
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color="white" />
                  </View>
                )}
                <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} disabled={uploading}>
                    <Camera size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View style={styles.userBasic}>
                <Text style={styles.userName}>{user?.name || 'Learner'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'learner@example.com'}</Text>
                <View style={[styles.badge, { backgroundColor: '#7c3aed20' }]}>
                    <Shield size={12} color="#7c3aed" />
                    <Text style={styles.badgeText}>Certified Learner</Text>
                </View>
            </View>
        </View>

            <View style={styles.statsRow}>
                {[
                    { val: user?.points || 0, label: t('profile.points'), icon: Gem, color: '#7c3aed' },
                    { val: user?.completedModules?.length || 0, label: t('profile.modules'), icon: BookOpen, color: '#38bdf8' },
                    { val: user?.badges?.length || 0, label: t('profile.badges'), icon: Award, color: '#fbbf24' }
                ].map((s, i) => (
                    <Animated.View entering={FadeInUp.delay(400 + i * 100)} key={i} style={[styles.statCard, { borderLeftColor: s.color, borderLeftWidth: 4 }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: s.color + '15' }]}>
                             <s.icon size={18} color={s.color} />
                        </View>
                        <View style={styles.statInfo}>
                            <Text style={styles.statVal}>{s.val}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

        {/* Tabs */}
        <View style={styles.tabs}>
            <TabButton id="personal" label={t('profile.tabs.personal')} icon={User} index={0} />
            <TabButton id="progress" label={t('profile.tabs.progress')} icon={BarChart3} index={1} />
            <TabButton id="achievements" label={t('profile.tabs.achievements')} icon={Trophy} index={2} />
            <TabButton id="certs" label={t('profile.tabs.certs')} icon={Award} index={3} />
            <TabButton id="safety" label="Safety" icon={ShieldAlert} index={4} />
        </View>

        <View style={styles.tabContent}>
            {activeTab === "personal" && (
                <Animated.View entering={FadeInRight} style={styles.form}>
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionHeader}>{t('profile.tabs.personal')}</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('profile.fields.name')}</Text>
                            <View style={styles.inputWrapper}>
                                <User size={18} color="#7c3aed" />
                                <TextInput style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} placeholder={t('profile.fields.name')} placeholderTextColor="rgba(255,255,255,0.2)" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('profile.fields.email')}</Text>
                            <View style={styles.inputWrapper}>
                                <Mail size={18} color="#7c3aed" />
                                <TextInput style={styles.input} value={formData.email} onChangeText={v => setFormData({...formData, email: v})} placeholder={t('profile.fields.email')} placeholderTextColor="rgba(255,255,255,0.2)" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('profile.fields.language')}</Text>
                            <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowLangModal(true)}>
                                <Globe size={18} color="#7c3aed" />
                                <Text style={styles.inputText}>
                                {LANGUAGES.find(l => l.code === formData.preferredLanguage)?.name || formData.preferredLanguage}
                                </Text>
                                <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionHeader}>Preferences</Text>
                        <View style={styles.prefRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.prefLabel}>{t('profile.show_on_leaderboard')}</Text>
                                <Text style={styles.prefSub}>Allow others to see your progress</Text>
                            </View>
                            <Switch value={prefs.showOnLeaderboard} onValueChange={v => setPrefs({...prefs, showOnLeaderboard: v})} trackColor={{ false: '#3e3e3e', true: '#7c3aed' }} />
                        </View>
                        <View style={[styles.prefRow, { marginTop: 15 }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.prefLabel}>{t('profile.email_notifications')}</Text>
                                <Text style={styles.prefSub}>Stay updated via email</Text>
                            </View>
                            <Switch value={prefs.emailNotifications} onValueChange={v => setPrefs({...prefs, emailNotifications: v})} trackColor={{ false: '#3e3e3e', true: '#7c3aed' }} />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                         {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>{t('profile.save')}</Text>}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {activeTab === "progress" && (
                <View style={styles.progressContainer}>
                    {modules?.map((m, i) => {
                        const total = m.topics?.reduce((acc, t) => acc + (t.subTopics?.length || 0), 0) || 0;
                        const done = progress?.completedSubTopics?.filter((id) => m.topics?.some((topic) => topic.subTopics?.some((st) => (st._id || st.title) === id)))?.length || 0;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                            <Animated.View entering={FadeInRight.delay(i * 100)} key={m._id} style={styles.progCard}>
                                <View style={styles.progHeader}>
                                    <View style={styles.progTitleGroup}>
                                        <BookOpen size={18} color="#38bdf8" />
                                        <Text style={styles.progTitle} numberOfLines={1}>{m.title}</Text>
                                    </View>
                                    <View style={[styles.progBadge, { backgroundColor: pct === 100 ? '#10b98115' : 'rgba(255,255,255,0.05)' }]}>
                                        <Text style={[styles.progBadgeText, { color: pct === 100 ? '#10b981' : 'rgba(255,255,255,0.6)' }]}>{pct === 100 ? t('profile.progress.completed_modules') : `${pct}%`}</Text>
                                    </View>
                                </View>
                                <View style={styles.progBarBg}>
                                    <LinearGradient 
                                        colors={['#7c3aed', '#ec4899']} 
                                        start={{x: 0, y: 0}} 
                                        end={{x: 1, y: 0}} 
                                        style={[styles.progBarFill, { width: `${pct}%` }]} 
                                    />
                                </View>
                                <View style={styles.progFooter}>
                                    <Text style={styles.progMeta}>{done} of {total} lessons</Text>
                                    {pct === 100 && <CheckCircle2 size={14} color="#10b981" />}
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
            )}

            {activeTab === "achievements" && (
                <View style={styles.badgeGrid}>
                    {user?.badges?.length > 0 ? user.badges.map((b, i) => (
                        <Animated.View entering={ZoomIn.delay(i * 100)} key={i} style={styles.badgeCard}>
                            <LinearGradient colors={['#fbbf2430', '#fbbf2405']} style={styles.badgeGradient}>
                                <View style={styles.badgeIconCircle}>
                                    <Trophy size={28} color="#fbbf24" />
                                </View>
                                <Text style={styles.badgeName}>{b}</Text>
                                <View style={styles.badgeStatus}>
                                    <CheckCircle2 size={12} color="#fbbf24" />
                                    <Text style={styles.badgeStatusText}>Unlocked</Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    )) : (
                        <View style={styles.emptyItems}>
                            <Award size={64} color="rgba(255,255,255,0.05)" />
                            <Text style={styles.emptyText}>{t('profile.achievements.keep_learning')}</Text>
                        </View>
                    )}
                </View>
            )}

            {activeTab === "certs" && (
                <View style={styles.certList}>
                    {progress?.certificates?.length > 0 ? progress.certificates.map((c, i) => (
                        <TouchableOpacity key={i} onPress={() => setViewingCert(c)}>
                            <Animated.View entering={FadeInUp.delay(i * 100)} style={styles.certCard}>
                                <LinearGradient colors={['#7c3aed20', '#7c3aed05']} style={styles.certGradient}>
                                    <View style={styles.certIconBox}>
                                        <Award size={32} color="#7c3aed" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.certTitle}>{c.title}</Text>
                                        <View style={styles.certMetaRow}>
                                            <Clock size={12} color="rgba(255,255,255,0.4)" />
                                            <Text style={styles.certDate}>{new Date(c.earnedAt).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={24} color="rgba(255,255,255,0.2)" />
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
                    )) : (
                        <View style={styles.emptyItems}>
                            <BookOpen size={48} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>{t('profile.certs.keep_learning')}</Text>
                        </View>
                    )}
                </View>
            )}

            {activeTab === "safety" && (
                <Animated.View entering={FadeInRight} style={styles.form}>
                    <View style={styles.safetyHeader}>
                        <Heart size={24} color="#ef4444" />
                        <Text style={styles.safetyTitle}>Emergency Contacts</Text>
                    </View>
                    <Text style={styles.safetyDesc}>These people will be notified with your live location when you trigger SOS or your battery is critically low.</Text>
                    
                    {formData.emergencyContacts.map((contact, index) => (
                        <View key={index} style={styles.contactCard}>
                            <Text style={styles.contactLabel}>Contact {index + 1}</Text>
                            <View style={styles.inputGroup}>
                                <View style={styles.inputWrapper}>
                                    <User size={16} color="rgba(255,255,255,0.4)" />
                                    <TextInput 
                                        style={styles.input} 
                                        value={contact.name} 
                                        onChangeText={v => {
                                            const newContacts = [...formData.emergencyContacts];
                                            newContacts[index].name = v;
                                            setFormData({...formData, emergencyContacts: newContacts});
                                        }}
                                        placeholder="Name" 
                                        placeholderTextColor="rgba(255,255,255,0.2)" 
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { marginTop: 10 }]}>
                                <View style={styles.inputWrapper}>
                                    <Phone size={16} color="rgba(255,255,255,0.4)" />
                                    <TextInput 
                                        style={styles.input} 
                                        value={contact.mobile} 
                                        keyboardType="phone-pad"
                                        onChangeText={v => {
                                            const newContacts = [...formData.emergencyContacts];
                                            newContacts[index].mobile = v;
                                            setFormData({...formData, emergencyContacts: newContacts});
                                        }}
                                        placeholder="Mobile Number" 
                                        placeholderTextColor="rgba(255,255,255,0.2)" 
                                    />
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                         {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Update Contacts</Text>}
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.fields.language')}</Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.langItem, formData.preferredLanguage === item.code && styles.langItemActive]}
                  onPress={async () => {
                    setFormData({ ...formData, preferredLanguage: item.code });
                    setShowLangModal(false);
                    await loadTranslations(item.code);
                    broadcastChange(item.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={[styles.langName, formData.preferredLanguage === item.code && styles.langNameActive]}>{item.name}</Text>
                  {formData.preferredLanguage === item.code && <Check size={20} color="#7c3aed" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Certificate Viewer Modal */}
      <Modal visible={!!viewingCert} transparent animationType="fade" onRequestClose={() => setViewingCert(null)}>
        <View style={styles.certModalOverlay}>
          <TouchableOpacity style={styles.certModalFullClose} onPress={() => setViewingCert(null)} />
          <Animated.View entering={ZoomIn} style={styles.certModalBody}>
              <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.certPaper}>
                  {/* Decorative Border */}
                  <View style={styles.certBorder}>
                      <View style={styles.certContent}>
                          <View style={styles.certLogo}>
                              <Shield size={40} color="#7c3aed" />
                          </View>
                          <Text style={styles.certHead}>CERTIFICATE</Text>
                          <Text style={styles.certSubHead}>OF ACHIEVEMENT</Text>
                          
                          <View style={styles.certDivider} />
                          
                          <Text style={styles.certCertify}>This is to certify that</Text>
                          <Text style={styles.certUserName}>{user?.name?.toUpperCase() || 'LEARNER'}</Text>
                          
                          <View style={styles.certLine} />
                          
                          <Text style={styles.certDesc}>
                              has successfully completed all requirements for the
                          </Text>
                          <Text style={styles.certTitleLarge}>{viewingCert?.title}</Text>
                          <Text style={styles.certProgram}>Learn Rights — Women's Legal Rights Education Program</Text>
                          
                          <View style={styles.certFooter}>
                              <View style={styles.certSign}>
                                  <View style={styles.signLine} />
                                  <Text style={styles.signLabel}>Program Director</Text>
                              </View>
                              <View style={styles.certSeal}>
                                  <Trophy size={30} color="#fbbf24" />
                              </View>
                              <View style={styles.certSign}>
                                  <View style={styles.signLine} />
                                  <Text style={styles.signLabel}>Date: {new Date(viewingCert?.earnedAt).toLocaleDateString()}</Text>
                              </View>
                          </View>
                      </View>
                  </View>
              </LinearGradient>
              
              <View style={styles.certActions}>
                  <TouchableOpacity style={styles.certDownloadBtn} onPress={() => downloadCertificate(viewingCert)}>
                      <Download size={20} color="white" />
                      <Text style={styles.certDownloadBtnText}>Download PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.certCloseBtn} onPress={() => setViewingCert(null)}>
                      <Text style={styles.certCloseBtnText}>Close Viewer</Text>
                  </TouchableOpacity>
              </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContent: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 20 },
  avatarContainer: { position: 'relative' },
  avatarInner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  avatarText: { color: 'white', fontSize: 36, fontWeight: '800' },
  uploadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0f0c29' },
  userBasic: { flex: 1, gap: 4 },
  userName: { color: 'white', fontSize: 22, fontWeight: '800' },
  userEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { color: '#7c3aed', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 25 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statInfo: { flex: 1 },
  statVal: { color: 'white', fontSize: 16, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, textTransform: 'uppercase', fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 6, marginTop: 30, height: 60 },
  tabBtn: { height: '100%', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#7c3aed', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  tabItemInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  tabBtnTextActive: { color: 'white', fontSize: 13, fontWeight: '800' },
  tabContent: { marginTop: 25 },
  form: { gap: 18 },
  inputGroup: { gap: 8 },
  label: { color: 'white', fontSize: 14, fontWeight: '700', marginLeft: 5 },
  inputWrapper: { height: 56, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 12 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  prefBox: { marginTop: 10, gap: 20, padding: 15, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20 },
  prefRow: { flexDirection: 'row', alignItems: 'center' },
  prefLabel: { color: 'white', fontSize: 15, fontWeight: '600' },
  prefSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  saveBtn: { height: 56, backgroundColor: '#7c3aed', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  progressContainer: { gap: 15 },
  progCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  progTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  progTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  progBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  progBadgeText: { fontSize: 11, fontWeight: '800' },
  progBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12 },
  progBarFill: { height: '100%', borderRadius: 4 },
  progFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
  sectionCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
  sectionHeader: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  badgeCard: { width: (width - 55) / 2, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(251,191,36,0.1)' },
  badgeGradient: { padding: 20, alignItems: 'center', gap: 12 },
  badgeIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(251,191,36,0.1)', justifyContent: 'center', alignItems: 'center' },
  badgeName: { color: 'white', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  badgeStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeStatusText: { color: '#fbbf24', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  emptyItems: { flex: 1, width: '100%', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600', marginTop: 20, textAlign: 'center' },
  // Certs Styles
  certList: { gap: 15 },
  certCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
  certGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  certIconBox: { width: 60, height: 60, borderRadius: 15, backgroundColor: 'rgba(124, 58, 237, 0.1)', justifyContent: 'center', alignItems: 'center' },
  certTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  certMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  certDate: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  inputText: { flex: 1, color: 'white', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1744', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: height * 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  langItemActive: { backgroundColor: 'rgba(124, 58, 237, 0.1)' },
  langName: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600' },
  langNameActive: { color: 'white', fontWeight: '800' },
  // Cert Viewer Styles
  certModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  certModalFullClose: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  certModalBody: { width: '100%', alignItems: 'center' },
  certPaper: { width: '100%', aspectRatio: 0.75, borderRadius: 20, padding: 10, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  certBorder: { flex: 1, borderWidth: 2, borderColor: '#7c3aed40', borderRadius: 15, padding: 5 },
  certContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 10, alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  certLogo: { marginBottom: 20 },
  certHead: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: 5 },
  certSubHead: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', letterSpacing: 3, marginTop: 5 },
  certDivider: { width: 100, height: 3, backgroundColor: '#7c3aed', marginVertical: 30, borderRadius: 1.5 },
  certCertify: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontStyle: 'italic' },
  certUserName: { color: 'white', fontSize: 28, fontWeight: '800', marginTop: 15, textAlign: 'center' },
  certLine: { width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  certDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  certTitleLarge: { color: '#7c3aed', fontSize: 24, fontWeight: '900', marginVertical: 15, textAlign: 'center' },
  certProgram: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  certFooter: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 50, paddingHorizontal: 10 },
  certSign: { alignItems: 'center', width: 100 },
  signLine: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 8 },
  signLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600' },
  certSeal: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(251,191,36,0.1)', borderWidth: 1, borderColor: '#fbbf2440', justifyContent: 'center', alignItems: 'center' },
  certActions: { marginTop: 30, width: '100%', gap: 12 },
  certDownloadBtn: { height: 55, backgroundColor: '#7c3aed', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  certDownloadBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  certCloseBtn: { height: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  certCloseBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
  // Safety Styles
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  safetyTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  safetyDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  contactCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  contactLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, marginLeft: 5 }
});

export default ProfileScreen;

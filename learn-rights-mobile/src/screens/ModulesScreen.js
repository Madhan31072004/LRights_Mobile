import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Image, Linking, RefreshControl } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight, FadeIn, ZoomIn } from 'react-native-reanimated';
import { Search, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Play, Clock, Award, AlertCircle, Info, ExternalLink, PlayCircle, Layers, FileText, Lock, RefreshCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../api/axios';
import { useUser } from "../contexts/UserContext";
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');
const REQUIRED_READING_SECONDS = 300;

const MOD_COLORS = {
  "MOD-01": "#7c3aed", "MOD-02": "#ec4899", "MOD-03": "#ef4444",
  "MOD-04": "#f59e0b", "MOD-05": "#10b981", "MOD-06": "#06b6d4",
  "MOD-07": "#8b5cf6", "MOD-08": "#f43f5e",
};

const ModulesScreen = () => {
  const navigation = useNavigation();
  const { userId, language, modules: ctxModules, progress, loading: ctxLoading, refreshUserData, updateProgressLocally, hasConnectionError } = useUser();
  const [selectedModule, setSelectedModule] = React.useState(null);
  const [selectedTopic, setSelectedTopic] = React.useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [readingTimer, setReadingTimer] = React.useState(REQUIRED_READING_SECONDS);
  const [timerDone, setTimerDone] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const timerRef = React.useRef(null);

  const isSubTopicCompleted = (st) => progress?.completedSubTopics?.includes(st._id || st.title) ?? false;
  const isModuleCompleted = (m) => progress?.completedModules?.some((id) => id.toString() === m._id?.toString()) ?? false;

  const getModuleProgress = (m) => {
    const total = m.topics?.reduce((acc, topic) => acc + (topic.subTopics?.length || 0), 0) || 0;
    const done = progress?.completedSubTopics?.filter((id) => m.topics?.some((topic) => topic.subTopics?.some((st) => (st._id || st.title) === id)))?.length || 0;
    return total ? Math.round((done / total) * 100) : 0;
  };

  const getStatus = (m) => {
    const p = getModuleProgress(m);
    return p === 100 ? "completed" : p > 0 ? "in-progress" : "not-started";
  };

  const filteredModules = (ctxModules || []).filter((m) => {
    const match = (m.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (m.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!match) return false;
    if (filterStatus === "all") return true;
    return getStatus(m) === filterStatus;
  });

  const handleSubTopicSelect = (st) => {
    setSelectedSubTopic(st);
    const done = isSubTopicCompleted(st);
    if (done) {
      setTimerDone(true);
      setReadingTimer(0);
    } else {
      setTimerDone(false);
      setReadingTimer(REQUIRED_READING_SECONDS);
    }
  };

  React.useEffect(() => {
    if (selectedModule && ctxModules) {
      const updatedMod = ctxModules.find(m => m._id === selectedModule._id);
      if (updatedMod) {
        setSelectedModule(updatedMod);
        // Sync topic
        if (selectedTopic) {
          const topicIdx = selectedModule.topics?.findIndex(t => t.title === selectedTopic.title);
          if (topicIdx !== -1 && updatedMod.topics?.[topicIdx]) {
            setSelectedTopic(updatedMod.topics[topicIdx]);
            // Sync subtopic
            if (selectedSubTopic) {
              const subIdx = selectedTopic.subTopics?.findIndex(s => s.title === selectedSubTopic.title);
              if (subIdx !== -1 && updatedMod.topics[topicIdx].subTopics?.[subIdx]) {
                 setSelectedSubTopic(updatedMod.topics[topicIdx].subTopics[subIdx]);
              }
            }
          }
        }
      }
    }
  }, [ctxModules]);

  React.useEffect(() => {
    if (selectedSubTopic && !timerDone && !isSubTopicCompleted(selectedSubTopic)) {
      timerRef.current = setInterval(() => {
        setReadingTimer(p => {
          if (p <= 1) {
            clearInterval(timerRef.current);
            setTimerDone(true);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [selectedSubTopic, timerDone]);

  const markComplete = async () => {
    if (!userId || !selectedSubTopic) return;
    try {
      const subId = selectedSubTopic._id || selectedSubTopic.title;
      const res = await API.post("/progress/complete-subtopic", { userId, moduleId: selectedModule._id, subTopicId: subId });
      updateProgressLocally({
        completedSubTopics: [...(progress.completedSubTopics || []), subId],
        completedModules: res.data.progress.completedModules,
        points: res.data.progress.points,
      });
      refreshUserData();
    } catch (err) {
      console.error(err);
    }
  };

  if (ctxLoading) return <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />;

  // ── Render Content ──
  const renderContent = (text) => {
    if (!text) return <Text style={styles.richText}>{t('modules.content_not_available')}</Text>;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <View key={i} style={{ height: 12 }} />;
      
      // Look for icons like the web version: 📜, 🔑, 📋, 🔴, 📌, 💡, 🛡️, 📞, 📱, 🏢, ✅
      const isTip = trimmed.startsWith('💡');
      const isWarning = trimmed.startsWith('📌');
      const isStep = trimmed.startsWith('📋') || trimmed.toLowerCase().startsWith('step');
      const isBullet = trimmed.startsWith('•');
      const isSpecial = /^(📜|🔑|📋|🔴|📌|💡|🛡️|📞|📱|🏢|✅)/.test(trimmed);
      
      return (
        <Animated.View entering={FadeInUp.delay(i * 30)} key={i} style={[
            styles.richRow,
            isSpecial && styles.specialRow,
            isTip && styles.tipRow,
            isWarning && styles.warningRow,
            isStep && styles.stepRow,
            isBullet && styles.bulletRow
        ]}>
          <Text style={[
            styles.richText, 
            isSpecial && styles.specialText,
            isBullet && styles.bulletText
          ]}>{trimmed}</Text>
        </Animated.View>
      );
    });
  };

  // ═══════════════ SUBTOPIC VIEW ═══════════════
  if (selectedSubTopic) {
    const timerPct = ((REQUIRED_READING_SECONDS - readingTimer) / REQUIRED_READING_SECONDS) * 100;
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedSubTopic(null)}>
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedSubTopic.title}</Text>
        </View>

        <ScrollView style={styles.content} stickyHeaderIndices={[0]}>
          {!isSubTopicCompleted(selectedSubTopic) && (
            <View style={styles.timerHeader}>
                <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.timerGradient}>
                    <View style={styles.timerLeft}>
                        <Clock size={20} color="white" />
                        <View>
                            <Text style={styles.timerTitle}>{timerDone ? t('modules.reading_complete') : t('modules.reading_required')}</Text>
                            <Text style={styles.timerSub}>
                                {timerDone ? t('modules.reading_complete_desc', { defaultValue: 'You can now mark this lesson as completed.' }) : `${Math.floor(readingTimer/60)}:${(readingTimer%60).toString().padStart(2,'0')} ${t('modules.remaining')}`}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.timerCircle}>
                        <Text style={styles.timerPctText}>{Math.round(timerPct)}%</Text>
                    </View>
                </LinearGradient>
                <View style={styles.timerTrack}>
                    <View style={[styles.timerBarFill, { width: `${timerPct}%`, backgroundColor: timerDone ? '#10b981' : '#fbbf24' }]} />
                </View>
            </View>
          )}

          <View style={styles.contentCard}>
            
            <View style={styles.lessonMeta}>
                <Text style={styles.sectionTitle}>{selectedSubTopic.title}</Text>
            </View>
          
          {selectedSubTopic.image && (
            <Animated.View entering={FadeIn.delay(100)} style={styles.heroImgBox}>
                <Image source={{ uri: selectedSubTopic.image }} style={styles.heroImg} resizeMode="cover" />
            </Animated.View>
          )}

          <View style={styles.richContainer}>
            {renderContent(selectedSubTopic.content)}
          </View>
            {/* Videos Section */}
            {selectedSubTopic.videos && selectedSubTopic.videos.length > 0 && (
                <View style={styles.mediaSection}>
                    <Text style={styles.mediaTitle}><PlayCircle size={18} color="#7c3aed" /> {t('modules.watch_learn')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizScroll}>
                        {selectedSubTopic.videos.map((vid, i) => {
                            const videoId = vid.url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
                            const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
                            return (
                                <TouchableOpacity key={i} style={styles.videoCard} onPress={() => Linking.openURL(vid.url)}>
                                    <View style={styles.videoThumbBox}>
                                        {thumb ? <Image source={{ uri: thumb }} style={styles.videoThumb} /> : <Play size={30} color="white" />}
                                        <View style={styles.playOverlay}><Play size={20} color="white" fill="white" /></View>
                                    </View>
                                    <Text style={styles.videoText} numberOfLines={2}>{vid.title}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Reference Links Section */}
            {selectedSubTopic.links && selectedSubTopic.links.length > 0 && (
                <View style={styles.mediaSection}>
                    <Text style={styles.mediaTitle}><ExternalLink size={18} color="#7c3aed" /> {t('modules.reference_links')}</Text>
                    {selectedSubTopic.links.map((link, i) => (
                        <TouchableOpacity key={i} style={styles.linkCard} onPress={() => Linking.openURL(link.url)}>
                            <View style={styles.linkIconBox}><ExternalLink size={16} color="#7c3aed" /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.linkTitle} numberOfLines={1}>{link.title}</Text>
                                <Text style={styles.linkUrl} numberOfLines={1}>{link.url?.replace(/^https?:\/\//, '')}</Text>
                            </View>
                            <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            
            <View style={styles.actions}>
              {isSubTopicCompleted(selectedSubTopic) ? (
                <View style={[styles.completeBtn, { backgroundColor: '#10b98120' }]}>
                  <CheckCircle2 color="#10b981" size={20} />
                  <Text style={[styles.completeBtnText, { color: '#10b981' }]}>{t('modules.completed')}</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.completeBtn, !timerDone && styles.disabledBtn]} 
                  disabled={!timerDone}
                  onPress={markComplete}
                >
                  {timerDone ? <CheckCircle2 color="white" size={20} /> : <Lock color="rgba(255,255,255,0.4)" size={20} />}
                  <Text style={styles.completeBtnText}>{t('modules.mark_completed')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════ TOPIC VIEW ═══════════════
  if (selectedTopic) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedTopic(null)}>
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedTopic.title}</Text>
        </View>
          <ScrollView contentContainerStyle={styles.scrollPadding}>
            {selectedTopic.subTopics?.map((st, i) => {
                const done = isSubTopicCompleted(st);
                return (
                <TouchableOpacity key={i} style={styles.subCard} onPress={() => handleSubTopicSelect(st)}>
                    <View style={[styles.subNum, done && { backgroundColor: '#7c3aed20' }]}>
                    {done ? <CheckCircle2 color="#7c3aed" size={18} /> : <Text style={styles.subNumText}>{i+1}</Text>}
                    </View>
                    <Text style={styles.subTitle}>{st.title}</Text>
                    <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                </TouchableOpacity>
                );
            })}

            {isModuleCompleted(selectedModule) && (
                <TouchableOpacity 
                    style={styles.quizBtn} 
                    onPress={() => {
                        // Assuming navigation has Quiz screen registered
                        navigation.navigate('Quiz', { moduleId: selectedModule._id });
                    }}
                >
                    <LinearGradient colors={['#7c3aed', '#ec4899']} style={styles.quizGradient}>
                        <Play size={24} color="white" fill="white" />
                        <Text style={styles.quizBtnText}>{t('modules.take_quiz', { defaultValue: 'Take Module Quiz' })}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
            
            <View style={styles.stickyNote}>
                <Clock size={16} color="#fbbf24" />
                <Text style={styles.stickyNoteText}>
                    {t('modules.reading_note')}
                </Text>
            </View>
          </ScrollView>
      </View>
    );
  }

  // ═══════════════ MODULE LIST ═══════════════
  if (selectedModule) {
    const color = MOD_COLORS[selectedModule.code] || "#7c3aed";
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedModule(null)}>
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedModule.title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollPadding}>
          {selectedModule.topics?.map((topic, i) => (
            <Animated.View entering={FadeInUp.delay(i * 100)} key={i}>
              <TouchableOpacity style={styles.topicCard} onPress={() => setSelectedTopic(topic)}>
                <View style={[styles.topicIcon, { backgroundColor: color + '15' }]}>
                  <Layers color={color} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicMeta}>{topic.subTopics?.length || 0} {t('modules.lessons')}</Text>
                </View>
                <ChevronRight color="rgba(255,255,255,0.3)" size={24} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData(); // Assuming refreshUserData is available in scope
    setRefreshing(false);
  };

  // Assuming ctxLoading and hasConnectionError are available from context or state
  // and ActivityIndicator, RefreshControl, AlertCircle, RefreshCcw are imported
  if (ctxLoading && !refreshing) return <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />;

  const modulesToShow = filteredModules;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.background} />
      
      <View style={styles.hero}>
        <BookOpen color="#7c3aed" size={40} />
        <Text style={styles.title}>{t('modules.title')}</Text>
        <Text style={styles.subtitle}>{t('modules.subtitle')}</Text>
        
        <View style={styles.searchBar}>
          <Search color="rgba(255,255,255,0.4)" size={20} />
          <TextInput 
            style={styles.searchInput} 
            placeholder={t('modules.search_placeholder')}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.filterTabs}>
          {['all', 'not-started', 'in-progress', 'completed'].map(status => (
            <TouchableOpacity 
              key={status} 
              style={[styles.filterTab, filterStatus === status && styles.filterTabActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterTabText, filterStatus === status && styles.filterTabTextActive]}>
                {t(`modules.filter.${status}`, { defaultValue: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
      >
        {hasConnectionError && modulesToShow.length === 0 ? (
            <View style={styles.errorState}>
                <AlertCircle size={48} color="#ef4444" />
                <Text style={styles.errorTitle}>{t('modules.connection_error')}</Text>
                <Text style={styles.errorSub}>{t('modules.connection_error_sub')}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                    <RefreshCcw size={20} color="white" />
                    <Text style={styles.retryBtnText}>{t('modules.retry_connection')}</Text>
                </TouchableOpacity>
            </View>
        ) : modulesToShow.length === 0 ? (
            <View style={styles.emptyState}>
                <Layers size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>{t('modules.no_modules')}</Text>
            </View>
        ) : (
            modulesToShow.map(m => {
                const prog = getModuleProgress(m);
                const color = MOD_COLORS[m.code] || "#7c3aed";
                return (
                    <TouchableOpacity key={m._id} style={styles.card} onPress={() => setSelectedModule(m)}>
                    <View style={[styles.cardAccent, { backgroundColor: color }]} />
                    <View style={styles.cardHeader}>
                        <View style={[styles.cardIconBox, { backgroundColor: color + '10' }]}>
                        <BookOpen color={color} size={20} />
                        </View>
                        <Text style={styles.cardCode}>{m.code}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{m.title}</Text>
                    <View style={styles.cardMeta}>
                        <Layers size={14} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.cardMetaText}>{t('modules.topics_count', { n: m.topics?.length })}</Text>
                    </View>
                    <View style={styles.progBg}>
                        <View style={[styles.progFill, { width: `${prog}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.progText}>{prog}{t('modules.percentage_complete')}</Text>
                    </TouchableOpacity>
                );
            })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  hero: { paddingTop: 60, paddingHorizontal: 25, alignItems: 'center', marginBottom: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: '800', marginTop: 15 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 5, textAlign: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, paddingHorizontal: 15, height: 50, marginTop: 25, width: '100%', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 16 },
  filterTabs: { flexDirection: 'row', gap: 8, marginTop: 20, width: '100%', justifyContent: 'space-between' },
  filterTab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterTabActive: { backgroundColor: 'rgba(124, 58, 237, 0.2)', borderColor: '#7c3aed' },
  filterTabText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700' },
  filterTabTextActive: { color: 'white' },
  grid: { paddingHorizontal: 20, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: (width - 55) / 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardIconBox: { width: 35, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardCode: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 8, height: 40 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 15 },
  cardMetaText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  progBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 5 },
  progFill: { height: '100%', borderRadius: 2 },
  progText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },
  header: { height: 100, paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700', flex: 1 },
  scrollPadding: { padding: 20 },
  topicCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 15, marginBottom: 15, gap: 15 },
  topicIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  topicTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  topicMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
  subCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 15, padding: 15, marginBottom: 10, gap: 15 },
  subNum: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  subNumText: { color: 'white', fontWeight: '700' },
  subTitle: { color: 'white', fontSize: 16, flex: 1 },
  content: { flex: 1 },
  timerBar: { height: 40, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 0 },
  timerFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  timerText: { color: 'white', fontSize: 12, fontWeight: '700' },
  contentCard: { padding: 25, backgroundColor: 'rgba(255,255,255,0.03)', borderTopLeftRadius: 35, borderTopRightRadius: 35, minHeight: 600, marginTop: 10 },
  contentImage: { width: '100%', height: 200, borderRadius: 25, marginBottom: 25 },
  richRow: { marginBottom: 12 },
  specialRow: { backgroundColor: 'rgba(124, 58, 237, 0.05)', padding: 15, borderRadius: 15, borderLeftWidth: 3, borderLeftColor: '#7c3aed' },
  tipRow: { backgroundColor: 'rgba(245, 158, 11, 0.05)', borderLeftColor: '#f59e0b' },
  warningRow: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeftColor: '#ef4444' },
  richText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 26 },
  specialText: { fontWeight: '600', color: 'white' },
  lessonMeta: { marginBottom: 15 },
  lessonPath: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },
  mediaSection: { marginTop: 30 },
  mediaTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 15 },
  videoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(124, 58, 237, 0.1)', padding: 15, borderRadius: 15, gap: 12, marginBottom: 10 },
  videoText: { color: 'white', fontSize: 15, fontWeight: '600' },
  linkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 15, gap: 15, marginBottom: 10 },
  linkTitle: { color: 'white', fontSize: 15, fontWeight: '600' },
  linkUrl: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 },
  actions: { marginTop: 40, marginBottom: 50 },
  completeBtn: { height: 60, borderRadius: 20, backgroundColor: '#7c3aed', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  disabledBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
  completeBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
  // Timer Enhancements
  timerHeader: { backgroundColor: '#1a1744' },
  timerGradient: { flexDirection: 'row', padding: 15, alignItems: 'center', justifyContent: 'space-between', gap: 15 },
  timerLeft: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'center' },
  timerTitle: { color: 'white', fontSize: 14, fontWeight: '800' },
  timerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  timerCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  timerPctText: { color: 'white', fontSize: 11, fontWeight: '800' },
  timerTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
  timerBarFill: { height: '100%' },
  // Quiz & Sticky
  quizBtn: { marginTop: 30, borderRadius: 20, overflow: 'hidden' },
  quizGradient: { flexDirection: 'row', height: 70, alignItems: 'center', justifyContent: 'center', gap: 12 },
  quizBtnText: { color: 'white', fontSize: 18, fontWeight: '800' },
  stickyNote: { marginTop: 20, padding: 15, backgroundColor: 'rgba(251, 191, 36, 0.05)', borderRadius: 15, flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.1)' },
  stickyNoteText: { color: 'rgba(251, 191, 36, 0.8)', fontSize: 12, flex: 1, lineHeight: 18, fontWeight: '600' },
  // Rich Text Extensions
  bulletRow: { paddingLeft: 10 },
  bulletText: { color: 'rgba(251, 191, 36, 0.9)' },
  stepRow: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderLeftColor: '#10b981' },
  // Video & Links Enhancements
  heroImgBox: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 25 },
  heroImg: { width: '100%', height: '100%' },
  horizScroll: { gap: 15, paddingRight: 20 },
  videoCard: { width: 220, gap: 10 },
  videoThumbBox: { width: 220, height: 124, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  videoThumb: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', backgroundColor: 'rgba(124, 58, 237, 0.6)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  videoText: { color: 'white', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  linkCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  linkIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(124, 58, 237, 0.1)', justifyContent: 'center', alignItems: 'center' },
  linkTitle: { color: 'white', fontSize: 14, fontWeight: '700' },
  linkUrl: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 },
  // Error & Empty States
  errorState: { flex: 1, height: 400, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginTop: 15 },
  errorSub: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, marginTop: 25 },
  retryBtnText: { color: 'white', fontWeight: '800' },
  emptyState: { flex: 1, height: 400, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { color: 'white', fontSize: 16, marginTop: 15 }
});

export default ModulesScreen;

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Globe, Check } from 'lucide-react-native';
import { LANGUAGES, loadTranslations, getLanguage } from '../utils/translation';

const { width } = Dimensions.get('window');

const LanguageSelectScreen = ({ navigation }) => {
  const [selectedLang, setSelectedLang] = useState(getLanguage());
  const [loading, setLoading] = useState(false);

  const handleSelect = async (langCode) => {
    setSelectedLang(langCode);
    setLoading(true);
    
    const success = await loadTranslations(langCode);
    setLoading(false);
    
    if (success) {
      navigation.replace('Welcome');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.background} />
      
      {/* Decorative background shapes */}
      <View style={[styles.bgShape, { top: -100, left: -100, backgroundColor: '#4c1d95' }]} />
      <View style={[styles.bgShape, { bottom: -100, right: -100, backgroundColor: '#1e3a8a' }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
          <View style={styles.iconContainer}>
            <Globe color="#7c3aed" size={40} />
          </View>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>Select your preferred language to continue your journey</Text>
        </Animated.View>

        <View style={styles.grid}>
          {LANGUAGES.map((lang, index) => (
            <Animated.View 
              key={lang.code} 
              entering={ZoomIn.delay(300 + index * 50)}
              style={styles.cardWrapper}
            >
              <TouchableOpacity 
                style={[
                  styles.card, 
                  selectedLang === lang.code && styles.activeCard
                ]}
                onPress={() => handleSelect(lang.code)}
                disabled={loading}
              >
                <LinearGradient
                  colors={selectedLang === lang.code ? ['rgba(124, 58, 237, 0.2)', 'rgba(124, 58, 237, 0.05)'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.03)']}
                  style={styles.cardInner}
                >
                  <Text style={styles.langName}>{lang.name}</Text>
                  {selectedLang === lang.code && (
                    <View style={styles.checkWrapper}>
                      <Check color="#7c3aed" size={16} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Setting everything up...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  background: { ...StyleSheet.absoluteFillObject },
  bgShape: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(124, 58, 237, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
  title: { color: 'white', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: 15 },
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  activeCard: { borderColor: '#7c3aed', borderWidth: 2 },
  cardInner: { paddingVertical: 25, alignItems: 'center', justifyContent: 'center', minHeight: 100 },
  langName: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  checkWrapper: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(124, 58, 237, 0.2)', justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  loadingText: { color: 'white', marginTop: 15, fontSize: 16, fontWeight: '600' }
});

export default LanguageSelectScreen;

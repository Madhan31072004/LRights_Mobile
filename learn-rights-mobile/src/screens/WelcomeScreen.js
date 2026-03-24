import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated as RNAnimated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, interpolate, Extrapolate, runOnJS } from 'react-native-reanimated';
import { ShieldCheck, ArrowRight, Bot, Scale, ShieldAlert, Sparkles, Globe } from 'lucide-react-native';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';
import API from '../api/axios';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    titleKey: 'onboarding.slide1.title',
    descKey: 'onboarding.slide1.desc',
    icon: Scale,
    color: '#7c3aed',
    bg: ['#1e1b4b', '#4c1d95']
  },
  {
    titleKey: 'onboarding.slide2.title',
    descKey: 'onboarding.slide2.desc',
    icon: Bot,
    color: '#0ea5e9',
    bg: ['#0c4a6e', '#0369a1']
  },
  {
    titleKey: 'onboarding.slide3.title',
    descKey: 'onboarding.slide3.desc',
    icon: ShieldAlert,
    color: '#10b981',
    bg: ['#064e3b', '#065f46']
  }
];

const WelcomeScreen = ({ navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState({ totalUsers: '10K', totalModules: '50+', totalLanguages: '17+' });
  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    API.get("/admin/public-stats")
      .then(res => setStats({
        totalUsers: res.data.totalUsers + '+',
        totalModules: res.data.totalModules,
        totalLanguages: res.data.totalLanguages
      }))
      .catch(() => {});
  }, []);

  const changeSlide = (index) => {
    setActiveSlide(index);
  };

  const nextSlide = () => {
    if (activeSlide < SLIDES.length - 1) {
      fadeAnim.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(changeSlide)(activeSlide + 1);
          fadeAnim.value = withTiming(1, { duration: 300 });
        }
      });
    } else {
      navigation.navigate('Signup');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: interpolate(fadeAnim.value, [0, 1], [0.95, 1]) }]
  }));

  const FloatingIcon = ({ Icon, top, left, delay }) => {
    const float = useSharedValue(0);
    useEffect(() => { float.value = withRepeat(withTiming(1, { duration: 2000 + delay, delay }), -1, true); }, []);
    const style = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(float.value, [0, 1], [0, -20]) }],
        opacity: interpolate(float.value, [0, 1], [0.1, 0.3])
    }));
    return (
        <Animated.View style={[styles.floatingIcon, { top, left }, style]}>
            <Icon size={24} color="white" />
        </Animated.View>
    );
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentSlide.bg} style={styles.background} />

      {/* Decorative floating icons */}
      <FloatingIcon Icon={Sparkles} top="15%" left="10%" delay={0} />
      <FloatingIcon Icon={Globe} top="25%" left="80%" delay={500} />
      <FloatingIcon Icon={ShieldCheck} top="60%" left="15%" delay={1000} />
      <FloatingIcon Icon={Scale} top="75%" left="75%" delay={1500} />

      <View style={styles.content}>
        <Animated.View key={activeSlide} entering={ZoomIn.duration(600)} style={styles.cardContainer}>
            <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.glassCard}>
                <View style={[styles.iconBox, { backgroundColor: currentSlide.color + '20', borderColor: currentSlide.color + '40' }]}>
                    <currentSlide.icon size={50} color={currentSlide.color} />
                    <Animated.View entering={ZoomIn.delay(300)} style={[styles.iconGlow, { backgroundColor: currentSlide.color }]} />
                </View>

                <Animated.View entering={FadeInUp.delay(200)} style={styles.textColumn}>
                    <Text style={styles.brand}>{t('app_name').toUpperCase()}</Text>
                    <Text style={styles.title}>{t(currentSlide.titleKey)}</Text>
                    <Text style={styles.description}>{t(currentSlide.descKey)}</Text>
                </Animated.View>
            </LinearGradient>
        </Animated.View>

        <View style={styles.footer}>
            <View style={styles.pagination}>
                {SLIDES.map((_, i) => (
                    <View 
                        key={i} 
                        style={[
                            styles.dot, 
                            activeSlide === i && styles.activeDot,
                            activeSlide === i && { backgroundColor: SLIDES[i].color }
                        ]} 
                    />
                ))}
            </View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={nextSlide}>
                    <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.btnInner}>
                        <Text style={styles.btnText}>
                            {activeSlide === SLIDES.length - 1 ? t('welcome.get_started') : t('game.next')}
                        </Text>
                        <ArrowRight size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.secondaryText}>{t('welcome.login')}</Text>
                </TouchableOpacity>
            </Animated.View>

            <View style={styles.statsContainer}>
                 <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalUsers}</Text>
                    <Text style={styles.statLabel}>{t('dashboard.stats.learners')}</Text>
                 </View>
                 <View style={styles.statDivider} />
                 <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalModules}</Text>
                    <Text style={styles.statLabel}>{t('dashboard.stats.modules')}</Text>
                 </View>
                 <View style={styles.statDivider} />
                 <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalLanguages}</Text>
                    <Text style={styles.statLabel}>{t('dashboard.stats.langs')}</Text>
                 </View>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  floatingIcon: { position: 'absolute', opacity: 0.2 },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'space-between', paddingVertical: height * 0.08 },
  cardContainer: { flex: 1, justifyContent: 'center' },
  glassCard: { padding: 30, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  iconBox: { width: 100, height: 100, borderRadius: 35, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 30, position: 'relative' },
  iconGlow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, opacity: 0.2, zIndex: -1 },
  textColumn: { alignItems: 'center' },
  brand: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '800', letterSpacing: 4, marginBottom: 15 },
  title: { color: 'white', fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 15, lineHeight: 42 },
  description: { color: 'rgba(255,255,255,0.7)', fontSize: 17, textAlign: 'center', lineHeight: 26 },
  footer: { gap: 30 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 30 },
  buttonRow: { gap: 15 },
  primaryBtn: { height: 65, borderRadius: 25, overflow: 'hidden' },
  btnInner: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: 'white', fontSize: 19, fontWeight: '800' },
  secondaryBtn: { height: 50, justifyContent: 'center', alignItems: 'center' },
  secondaryText: { color: 'white', fontSize: 16, fontWeight: '600', opacity: 0.8 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 25 },
  statItem: { alignItems: 'center' },
  statValue: { color: 'white', fontSize: 20, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 3 },
  statDivider: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.1)' }
});

export default WelcomeScreen;

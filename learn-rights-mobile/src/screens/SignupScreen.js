import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, ShieldCheck, ChevronRight, Languages } from 'lucide-react-native';
import { signupUser } from "../services/authService";
import { useUser } from "../contexts/UserContext";
import { t } from '../utils/translation';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { googleLoginUser } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

const SignupScreen = ({ navigation }) => {
  const { login, language } = useUser();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    preferredLanguage: language || 'en' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync language if it changes in context
  useEffect(() => {
    if (language && form.preferredLanguage === 'en' && language !== 'en') {
      setForm(prev => ({ ...prev, preferredLanguage: language }));
    }
  }, [language]);

  // Google Auth Hook - Optimized for platform-specific redirects
  const googleConfig = {
    androidClientId: "1034415973183-piv5n8eqma8jdf394g95uv0s5fhpp6di.apps.googleusercontent.com",
    iosClientId: "1034415973183-pg06ng2b0b7ta1ta48kiphk8bpnq2muk.apps.googleusercontent.com",
    webClientId: "1034415973183-pg06ng2b0b7ta1ta48kiphk8bpnq2muk.apps.googleusercontent.com",
    scopes: ['profile', 'email'],
    // FIX: Only specify redirectUri for the Web version (Render).
    // Standalone APKs will use the registered scheme 'learnrights://' automatically.
    ...(Platform.OS === 'web' && { redirectUri: 'https://lrights-mobile.onrender.com' })
  };
  
  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  useEffect(() => {
    if (response) {
      console.log("Google Signup Full Response:", JSON.stringify(response, null, 2));
      
      if (response.type === 'success') {
        const { authentication } = response;
        console.log("Google Auth Success, token obtained.");
        handleGoogleSignup(authentication.accessToken);
      } else if (response.type === 'error' || response.type === 'cancel' || response.type === 'dismiss') {
        console.warn(`Google Signup ${response.type}:`, response);
        if (response.type === 'error') {
          setError(`Google Signup Error: ${response.error?.message || 'Check Cloud Console Configuration'}`);
        } else if (response.type === 'dismiss') {
          setError('Google Signup was dismissed. Please try again.');
        } else {
          console.warn("Google Signup Unhandled Response Type:", response.type);
          setError(`Google Signup State: ${response.type || 'unknown'}`);
        }
      }
    }
  }, [response]);

  const handleGoogleSignup = async (token) => {
    console.log("Sending token to backend:", token ? "Token present" : "Token MISSING");
    setLoading(true);
    try {
      const res = await googleLoginUser(token);
      console.log("Backend Google Auth Response:", res);
      if (res.token) {
        await login(res.token);
      }
    } catch (err) {
      console.error("Google Auth Backend Error:", err);
      setError(err.message || 'Google Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch', { defaultValue: 'Passwords do not match' }));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
        preferredLanguage: form.preferredLanguage
      });
      if (res.token) {
        await login(res.token);
      } else {
        alert(t('auth.signupSuccess', { defaultValue: "Account created! Please log in." }));
        navigation.navigate('Login');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <LinearGradient 
        colors={['#0f0c29', '#302b63', '#24243e']} 
        style={styles.background} 
        pointerEvents="none"
      />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <ShieldCheck size={40} color="#7c3aed" />
          </View>
          <Text style={styles.title}>{t('app_name')}</Text>
          <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
           <View style={styles.inputWrapper}>
              <User size={18} color="rgba(255,255,255,0.4)" />
              <TextInput style={styles.input} placeholder={t('auth.fields.name')} placeholderTextColor="rgba(255,255,255,0.3)" value={form.name} onChangeText={v => setForm({...form, name: v})} />
           </View>

           <View style={styles.inputWrapper}>
              <Mail size={18} color="rgba(255,255,255,0.4)" />
              <TextInput style={styles.input} placeholder={t('auth.fields.email')} placeholderTextColor="rgba(255,255,255,0.3)" value={form.email} onChangeText={v => setForm({...form, email: v})} keyboardType="email-address" />
           </View>

           <View style={styles.inputWrapper}>
              <Lock size={18} color="rgba(255,255,255,0.4)" />
              <TextInput style={styles.input} placeholder={t('auth.fields.password')} placeholderTextColor="rgba(255,255,255,0.3)" value={form.password} onChangeText={v => setForm({...form, password: v})} secureTextEntry />
           </View>

           <View style={styles.inputWrapper}>
              <Lock size={18} color="rgba(255,255,255,0.4)" />
              <TextInput style={styles.input} placeholder={t('auth.fields.confirm_password')} placeholderTextColor="rgba(255,255,255,0.3)" value={form.confirmPassword} onChangeText={v => setForm({...form, confirmPassword: v})} secureTextEntry />
           </View>

           <View style={styles.inputWrapper}>
              <Languages size={18} color="rgba(255,255,255,0.4)" />
              <TextInput style={styles.input} placeholder={t('auth.fields.lang_hint')} placeholderTextColor="rgba(255,255,255,0.3)" value={form.preferredLanguage} onChangeText={v => setForm({...form, preferredLanguage: v})} />
           </View>

            <Pressable 
                style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]} 
                onPress={handleSignup} 
                disabled={loading}
            >
               {loading ? <ActivityIndicator color="white" /> : (
                 <>
                   <Text style={styles.buttonText}>{t('auth.signup.submit')}</Text>
                   <ChevronRight size={20} color="white" />
                 </>
               )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>{t('auth.or') || 'OR'}</Text>
              <View style={styles.line} />
            </View>

            <Pressable 
              style={({ pressed }) => [styles.googleBtn, pressed && { backgroundColor: '#f9fafb' }]} 
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <View style={styles.googleIconWrapper}>
                <View style={styles.googleIconG}>
                  <View style={styles.gRed} />
                  <View style={styles.gBlue} />
                  <View style={styles.gYellow} />
                  <View style={styles.gGreen} />
                </View>
              </View>
              <Text style={styles.googleBtnText}>{t('auth.signup.google')}</Text>
            </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.signup.have_account')} </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>{t('login')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(124,58,237,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 8 },
  form: { width: '100%' },
  inputWrapper: { height: 60, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  button: { height: 60, backgroundColor: '#7c3aed', borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 15 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  footerLink: { color: '#7c3aed', fontSize: 14, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  dividerText: { color: 'rgba(255, 255, 255, 0.4)', paddingHorizontal: 15, fontSize: 12, fontWeight: '700' },
  googleBtn: { 
    height: 60, 
    backgroundColor: 'white', 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleBtnText: { color: '#1f2937', fontSize: 16, fontWeight: '700' },
  googleIconG: { 
    width: 22, 
    height: 22, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  gRed: { width: 11, height: 11, backgroundColor: '#EA4335' },
  gBlue: { width: 11, height: 11, backgroundColor: '#4285F4' },
  gYellow: { width: 11, height: 11, backgroundColor: '#FBBC05' },
  gGreen: { width: 11, height: 11, backgroundColor: '#34A853' },
});

export default SignupScreen;

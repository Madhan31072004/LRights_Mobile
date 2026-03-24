import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
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
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', preferredLanguage: 'en' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Auth Hook - Using the Client ID exactly as verified in backend .env
  const googleClientId = "1034415973183-pg06ng2b0b7ta1ta48kiphk8bpnq2muk.apps.googleusercontent.com";

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleClientId,
    iosClientId: googleClientId,
    webClientId: googleClientId,
    scopes: ['profile', 'email'],
  });


  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignup(authentication.accessToken);
    }
  }, [response]);

  const handleGoogleSignup = async (token) => {
    setLoading(true);
    try {
      const res = await googleLoginUser(token);
      if (res.token) {
        await login(res.token);
      }
    } catch (err) {
      setError(err.message || 'Google Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
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
        alert("Account created! Please log in.");
        navigation.navigate('Login');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
               {loading ? <ActivityIndicator color="white" /> : (
                 <>
                   <Text style={styles.buttonText}>{t('auth.signup.submit')}</Text>
                   <ChevronRight size={20} color="white" />
                 </>
               )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>{t('auth.or') || 'OR'}</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity 
              style={styles.googleBtn} 
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <View style={styles.googleIconG}>
                <View style={styles.gRed} />
                <View style={styles.gBlue} />
                <View style={styles.gYellow} />
                <View style={styles.gGreen} />
              </View>
              <Text style={styles.googleBtnText}>{t('auth.signup.google')}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.signup.have_account')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scrollContent: { paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(124,58,237,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 8 },
  form: { gap: 15 },
  inputWrapper: { height: 60, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: 'white', fontSize: 16 },
  button: { height: 60, backgroundColor: '#7c3aed', borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
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

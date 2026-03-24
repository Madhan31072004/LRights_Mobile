import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Bot, User, Send, Mic, Image as ImageIcon, Trash2, Volume2, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const ChatbotScreen = () => {
  const { user, language, progress } = useUser();
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [autoSpeak, setAutoSpeak] = React.useState(false);
  const scrollRef = React.useRef();

  // Load history on mount
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('chat_history');
        if (saved) setMessages(JSON.parse(saved));
      } catch (e) { console.error("History load failed", e); }
    };
    loadHistory();
  }, []);

  // Save history on change
  React.useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('chat_history', JSON.stringify(messages));
      } catch (e) { console.error("History save failed", e); }
    };
    saveHistory();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    
    const userMsg = { 
        text: input, 
        sender: 'user', 
        id: Date.now(),
        image: selectedImage
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }));
      
      // Build Personalized Context
      const completedMods = progress?.completedModules?.length || 0;
      const userPoints = user?.points || 0;
      const userStreak = user?.streak || 0;
      const userRole = user?.role || 'user';
      
      const smartContext = `
        The user is currently on a learning journey in the Learn Rights app.
        Current Progress: ${completedMods} modules completed.
        Total Points: ${userPoints}.
        Learning Streak: ${userStreak} days.
        Account Role: ${userRole}.
        Target Area: Indian Women's Legal Rights.
      `;

      const payload = {
        message: input || t('chatbot.analyze_image', { defaultValue: 'Analyze this image' }),
        context: smartContext,
        lang: language,
        history: history,
        imageBase64: selectedImage ? selectedImage.base64 : null
      };
      const res = await API.post('/ai/chatbot', payload);
      
      const botMsg = { text: res.data.response, sender: 'bot', id: Date.now() + 1 };
      setMessages(prev => [...prev, botMsg]);
      if (autoSpeak) Speech.speak(botMsg.text);
    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { text: t('chatbot.error'), sender: 'bot', id: Date.now() + 1, error: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
      setMessages([]);
      await AsyncStorage.removeItem('chat_history');
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.5
    });
    if (!res.canceled) {
      setSelectedImage(res.assets[0]);
    }
  };

  const toggleSpeech = () => {
      setIsListening(!isListening);
      if(!isListening) {
          setTimeout(() => {
              setInput("What are my legal rights?");
              setIsListening(false);
          }, 2000);
      }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
      
      <View style={styles.header}>
          <Bot size={32} color="#7c3aed" />
          <View>
            <Text style={styles.headerTitle}>{t('chatbot.title')}</Text>
            <Text style={styles.headerStatus}>{t('chatbot.status')}</Text>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.trashBtn}>
            <Trash2 size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAutoSpeak(!autoSpeak)} style={[styles.speakToggle, autoSpeak && styles.speakToggleOn]}>
            <Volume2 size={18} color={autoSpeak ? "white" : "rgba(255,255,255,0.4)"} />
          </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => scrollRef.current.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
            <View style={styles.welcome}>
                 <View style={styles.botIconLarge}>
                    <Bot size={50} color="#7c3aed" />
                 </View>
                 <Text style={styles.welcomeText}>{t('chatbot.welcome')}</Text>
                 <Text style={styles.welcomeSub}>{t('chatbot.welcome_sub')}</Text>
                 
                 <View style={styles.suggestions}>
                    {[
                      t('chatbot.suggestion1', { defaultValue: 'What are my basic rights?' }),
                      t('chatbot.suggestion2', { defaultValue: 'How to file a complaint?' }),
                      t('chatbot.suggestion3', { defaultValue: 'Legal aid services?' }),
                    ].map((s, i) => (
                      <TouchableOpacity key={i} style={styles.suggestCard} onPress={() => setInput(s)}>
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                 </View>
            </View>
        ) : (
            messages.map(m => (
                <Animated.View key={m.id} entering={SlideInRight} style={[styles.msgContainer, m.sender === 'user' ? styles.msgUser : styles.msgBot]}>
                     <View style={[styles.avatarBox, m.sender === 'user' && { order: 1 }]}>
                        {m.sender === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="#7c3aed" />}
                     </View>
                     <View style={[styles.bubble, m.sender === 'user' ? styles.bubbleUser : styles.bubbleBot, m.error && styles.bubbleError]}>
                        {m.image && <Image source={{ uri: m.image.uri }} style={styles.msgImg} />}
                        <Text style={[styles.msgText, m.sender === 'user' && { color: 'white' }]}>{m.text}</Text>
                        {m.sender === 'bot' && (
                            <TouchableOpacity onPress={() => Speech.speak(m.text)} style={styles.speakBtn}>
                                <Volume2 size={14} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                        )}
                     </View>
                </Animated.View>
            ))
        )}
        {isTyping && (
             <View style={[styles.msgContainer, styles.msgBot]}>
                <View style={styles.avatarBox}><Bot size={16} color="#7c3aed" /></View>
                <View style={[styles.bubble, styles.bubbleBot]}>
                    <ActivityIndicator size="small" color="#7c3aed" />
                </View>
            </View>
        )}
        <Text style={styles.disclaimer}>{t('chatbot.disclaimer')}</Text>
      </ScrollView>

      {selectedImage && (
          <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewThumb} />
              <TouchableOpacity style={styles.closePreview} onPress={() => setSelectedImage(null)}>
                  <XCircle size={16} color="white" />
              </TouchableOpacity>
          </View>
      )}

      <View style={styles.inputArea}>
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
              <ImageIcon size={22} color={selectedImage ? "#7c3aed" : "rgba(255,255,255,0.5)"} />
          </TouchableOpacity>
          <View style={styles.textInputBox}>
            <TextInput 
              style={styles.input} 
              placeholder={isListening ? t('chatbot.listening') : t('chatbot.placeholder')} 
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={input}
              onChangeText={setInput}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleSpeech}>
              <Mic size={22} color={isListening ? "#ef4444" : "rgba(255,255,255,0.5)"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendBtn, (!input.trim() && !selectedImage) && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={(!input.trim() && !selectedImage) || isTyping}
          >
              <Send size={20} color="white" />
          </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  headerStatus: { color: '#10b981', fontSize: 12, fontWeight: '600' },
  trashBtn: { marginLeft: 'auto', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: 20, gap: 20, paddingBottom: 150 },
  welcome: { flex: 1, alignItems: 'center', paddingTop: 80 },
  botIconLarge: { width: 100, height: 100, borderRadius: 35, backgroundColor: 'rgba(124,58,237,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  welcomeText: { color: 'white', fontSize: 22, fontWeight: '800' },
  welcomeSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8, textAlign: 'center' },
  msgContainer: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  msgUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  msgBot: { alignSelf: 'flex-start', justifyContent: 'flex-start' },
  avatarBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, maxWidth: width * 0.75 },
  bubbleUser: { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bubbleError: { borderColor: '#ef4444' },
  msgText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22 },
  msgImg: { width: width * 0.5, height: 150, borderRadius: 15, marginBottom: 10 },
  speakBtn: { marginTop: 8, alignSelf: 'flex-end' },
  disclaimer: { color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center', marginTop: 30, paddingHorizontal: 20 },
  suggestions: { marginTop: 30, gap: 10, width: '100%' },
  suggestCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  suggestText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  imagePreview: { position: 'absolute', bottom: 100, left: 20, padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  previewThumb: { width: 60, height: 60, borderRadius: 8 },
  closePreview: { position: 'absolute', top: -8, right: -8, backgroundColor: '#ef4444', borderRadius: 10 },
  inputArea: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 64, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textInputBox: { flex: 1 },
  input: { flex: 1, color: 'white', fontSize: 16, maxHeight: 100 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  speakToggle: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  speakToggleOn: { backgroundColor: '#7c3aed' }
});

export default ChatbotScreen;

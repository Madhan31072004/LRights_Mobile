import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { Home, BookOpen, MessageSquare, Trophy, User, ShieldCheck, Users } from 'lucide-react-native';

import { UserProvider, useUser } from './src/contexts/UserContext';
import { SafetyModeProvider } from './src/contexts/SafetyModeContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ModulesScreen from './src/screens/ModulesScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import QuizScreen from './src/screens/QuizScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminCommunityScreen from './src/screens/AdminCommunityScreen';
import AdminEntriesScreen from './src/screens/AdminEntriesScreen';
import AdminGamesScreen from './src/screens/AdminGamesScreen';
import LawyersDirectoryScreen from './src/screens/LawyersDirectoryScreen';
import LawyerProfileFormScreen from './src/screens/LawyerProfileFormScreen';
import AdminLawyersScreen from './src/screens/AdminLawyersScreen';
import AdminModulesScreen from './src/screens/AdminModulesScreen';
import AdminBotSettingsScreen from './src/screens/AdminBotSettingsScreen';
import AdminSafetyScreen from './src/screens/AdminSafetyScreen';
import GameCenterScreen from './src/screens/GameCenterScreen';
import RightsMatchScreen from './src/screens/RightsMatchScreen';
import ScenarioGameScreen from './src/screens/ScenarioGameScreen';
import LightningQuizScreen from './src/screens/LightningQuizScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import StoriesScreen from './src/screens/StoriesScreen';
import SafetyHubScreen from './src/screens/SafetyHubScreen';
import FakeCallScreen from './src/screens/FakeCallScreen';
import WeeklyChallengeScreen from './src/screens/WeeklyChallengeScreen';
import CompetitionScreen from './src/screens/CompetitionScreen';
import Navbar from './src/components/Navbar';
import { initTranslation, getLanguage, onTranslationChange } from './src/utils/translation';
import { startSyncInterval } from './src/utils/offlineSync';
import API from './src/api/axios';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useUser();
  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0f0c29',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#7c3aed',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Home size={size} color={color} />;
            if (route.name === 'Modules') return <BookOpen size={size} color={color} />;
            if (route.name === 'Community') return <Users size={size} color={color} />;
            if (route.name === 'Bot') return <MessageSquare size={size} color={color} />;
            if (route.name === 'Rankings') return <Trophy size={size} color={color} />;
            if (route.name === 'Profile') return <User size={size} color={color} />;
            if (route.name === 'Admin') return <ShieldCheck size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Modules" component={ModulesScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Rankings" component={LeaderboardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        {user?.role === 'admin' && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
      </Tab.Navigator>
    </View>
  );
};

const Navigation = () => {
  const { token, loading } = useUser();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Bot" component={ChatbotScreen} />
          <Stack.Screen name="Stories" component={StoriesScreen} />
          <Stack.Screen name="Competition" component={CompetitionScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminCommunity" component={AdminCommunityScreen} />
          <Stack.Screen name="AdminEntries" component={AdminEntriesScreen} />
          <Stack.Screen name="AdminGames" component={AdminGamesScreen} />
          <Stack.Screen name="LawyersDirectory" component={LawyersDirectoryScreen} />
          <Stack.Screen name="LawyerProfileForm" component={LawyerProfileFormScreen} />
          <Stack.Screen name="AdminLawyers" component={AdminLawyersScreen} />
          <Stack.Screen name="AdminModules" component={AdminModulesScreen} />
          <Stack.Screen name="AdminBotSettings" component={AdminBotSettingsScreen} />
        <Stack.Screen name="AdminSafety" component={AdminSafetyScreen} />
          <Stack.Screen name="GameCenter" component={GameCenterScreen} />
          <Stack.Screen name="RightsMatch" component={RightsMatchScreen} />
          <Stack.Screen name="ScenarioGame" component={ScenarioGameScreen} />
          <Stack.Screen name="LightningQuiz" component={LightningQuizScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="SafetyHub" component={SafetyHubScreen} />
      <Stack.Screen name="FakeCall" component={FakeCallScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="WeeklyChallenge" component={WeeklyChallengeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  const [lang, setLang] = React.useState('en');

  React.useEffect(() => {
    initTranslation().then(() => setLang(getLanguage()));
    const unsub = onTranslationChange((newLang) => {
      setLang(newLang);
    });
    
    // Start offline sync interval
    startSyncInterval(API, 30000); // Check every 30s
    
    return unsub;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <SafetyModeProvider>
          <NavigationContainer>
            <Navigation />
            <StatusBar style="light" />
          </NavigationContainer>
        </SafetyModeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

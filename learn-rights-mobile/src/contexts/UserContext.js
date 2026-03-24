import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';
import { onTranslationChange, getCurrentLanguage } from '../utils/translation';
import { onSyncStatusChange, syncOfflineData } from '../utils/offlineSync';
import { getModules, saveModules, getUserProfile, saveUserProfile, getUserProgress, saveUserProgress } from '../utils/offlineDB';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({});
  const [progress, setProgress] = useState({});
  const [modules, setModules] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ itemCount: 0, isSyncing: false });

  // Initialize from storage
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedLang = await AsyncStorage.getItem('language') || 'en';
        setLanguage(storedLang);

        // High-Quality Offline Fallback
        const [cachedMods, cachedProfile, cachedProg] = await Promise.all([
            getModules(),
            getUserProfile(),
            getUserProgress()
        ]);
        if (cachedMods) setModules(cachedMods);
        if (cachedProfile) setUser(cachedProfile);
        if (cachedProg) setProgress(cachedProg);

        if (storedToken) {
          setToken(storedToken);
          const res = await API.get('/auth/me');
          setUserId(res.data.id);
          await AsyncStorage.setItem('userId', res.data.id);
        } else {
          refreshUserData(false, storedLang);
        }
      } catch (err) {
        console.error('Initial load error:', err);
        setHasConnectionError(true);
      } finally {
        setLoading(false);
      }
    };
    init();

    // Listen for manual language changes (e.g. from Profile)
    const unsub = onTranslationChange((newLang) => {
        setLanguage(newLang);
        refreshUserData(true, newLang);
    });
    
    // Listen for sync status
    const syncUnsub = onSyncStatusChange((status) => {
        setSyncStatus(status);
        if (status.itemCount === 0 && !status.isSyncing) {
            refreshUserData();
        }
    });

    return () => {
        unsub();
        syncUnsub();
    };
  }, []);

  // Sync data when userId changes
  useEffect(() => {
    if (userId) {
      refreshUserData();
    }
  }, [userId]);

  const refreshUserData = async (isAuth = true, overrideLang = null) => {
    const lang = overrideLang || language;
    try {
      setHasConnectionError(false);
      if (isAuth && userId) {
        const [userRes, progressRes, modulesRes] = await Promise.all([
          API.get(`/profile/${userId}`),
          API.get(`/progress/${userId}`),
          API.get(`/modules/user/${userId}?lang=${lang}`)
        ]);
        setUser(userRes.data);
        setProgress(progressRes.data);
        if (modulesRes.data) {
           setModules(modulesRes.data);
           saveModules(modulesRes.data);
        }
        saveUserProfile(userRes.data);
        saveUserProgress(progressRes.data);
      } else {
        const res = await API.get(`/modules?lang=${lang}`);
        setModules(res.data);
        saveModules(res.data);
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setHasConnectionError(true);
    }
  };

  const login = async (newToken) => {
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    const res = await API.get('/auth/me');
    setUserId(res.data.id);
    await AsyncStorage.setItem('userId', res.data.id);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
    setUser({});
    setProgress({});
    setModules([]);
  };

  const updateProgressLocally = (newProgress) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
  };

  const triggerSync = () => {
    syncOfflineData(API);
  };

  return (
    <UserContext.Provider value={{ userId, user, progress, modules, loading, token, language, login, logout, refreshUserData, updateProgressLocally, hasConnectionError, syncStatus, triggerSync }}>
      {children}
    </UserContext.Provider>
  );
};

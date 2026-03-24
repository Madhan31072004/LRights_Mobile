import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper for offline data storage on mobile.
 * Optimized for React Native performance.
 */

const KEYS = {
  USER_PROFILE: 'user_profile',
  USER_PROGRESS: 'user_progress',
  USER_ID: 'user_id',
  MODULES: 'modules_cache',
  LEADERBOARD: 'leaderboard_cache',
  OFFLINE_QUEUE: 'offline_queue',
  QUIZ_CACHE: 'quiz_questions_cache'
};

/* ── Generic helpers ── */

async function setItem(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

async function getItem(key) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return null;
  }
}

async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key}:`, e);
  }
}

/* ── Specific Store Functions ── */

export const saveUserProfile = (profile) => setItem(KEYS.USER_PROFILE, profile);
export const getUserProfile = () => getItem(KEYS.USER_PROFILE);

export const saveUserProgress = (progress) => setItem(KEYS.USER_PROGRESS, progress);
export const getUserProgress = () => getItem(KEYS.USER_PROGRESS);

export const saveModules = (modules) => setItem(KEYS.MODULES, modules);
export const getModules = () => getItem(KEYS.MODULES);

export const saveLeaderboard = (data) => setItem(KEYS.LEADERBOARD, data);
export const getLeaderboard = () => getItem(KEYS.LEADERBOARD);

export const saveQuizQuestions = (moduleId, questions) => {
    getItem(KEYS.QUIZ_CACHE).then(cache => {
        const newCache = cache || {};
        newCache[moduleId] = questions;
        setItem(KEYS.QUIZ_CACHE, newCache);
    });
};
export const getQuizQuestions = async (moduleId) => {
    const cache = await getItem(KEYS.QUIZ_CACHE);
    return cache ? cache[moduleId] : null;
};

/* ── Offline Queue ── */

export const enqueueOfflineAction = async (action) => {
    const queue = await getItem(KEYS.OFFLINE_QUEUE) || [];
    queue.push({ ...action, id: Date.now() + Math.random(), timestamp: Date.now() });
    await setItem(KEYS.OFFLINE_QUEUE, queue);
};

export const getOfflineQueue = () => getItem(KEYS.OFFLINE_QUEUE);

export const removeFromQueue = async (id) => {
    const queue = await getItem(KEYS.OFFLINE_QUEUE) || [];
    const newQueue = queue.filter(item => item.id !== id);
    await setItem(KEYS.OFFLINE_QUEUE, newQueue);
};

export const clearOfflineQueue = () => removeItem(KEYS.OFFLINE_QUEUE);

export const clearAllOfflineData = async () => {
    try {
        await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (e) {
        console.warn('Failed to clear offline data:', e);
    }
};

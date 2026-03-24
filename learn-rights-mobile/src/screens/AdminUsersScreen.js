import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Mail, Calendar, Star, Shield, ChevronLeft, RefreshCcw, AlertCircle, Trash2, User as UserIcon } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const AdminUsersScreen = ({ navigation }) => {
  const { language } = useUser();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [error, setError] = React.useState(false);

  const fetchUsers = async () => {
    try {
        setError(false);
        const res = await API.get("/admin/users");
        setUsers(res.data);
    } catch (err) {
        console.error(err);
        setError(true);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = async (userId, data) => {
    try {
        await API.patch(`/admin/users/${userId}`, data);
        fetchUsers();
    } catch (err) {
        Alert.alert("Error", "Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    Alert.alert(
        "Delete User",
        "Are you sure? This action is IRREVERSIBLE and will delete all user data.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete Permanently", 
                style: "destructive",
                onPress: async () => {
                    try {
                        await API.delete(`/admin/users/${userId}`);
                        fetchUsers();
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete user");
                    }
                }
            }
        ]
    );
  };

  const UserCard = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name ? item.name[0].toUpperCase() : 'U'}</Text>
      </LinearGradient>
      <View style={styles.info}>
        <View style={styles.userHead}>
            <Text style={styles.userName}>{item.name || 'Anonymous User'}</Text>
            {item.status === 'banned' && (
                <View style={styles.bannedBadge}>
                    <Text style={styles.bannedText}>BANNED</Text>
                </View>
            )}
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.meta}>
            <View style={styles.metaItem}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} />
                <Text style={styles.metaText}>{item.points || 0} XP</Text>
            </View>
            <View style={styles.metaItem}>
                <Shield size={12} color="#7c3aed" />
                <Text style={styles.metaText}>{item.role?.toUpperCase() || 'USER'}</Text>
            </View>
        </View>
        
        <View style={styles.actions}>
            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                onPress={() => handleUpdate(item._id, { role: item.role === 'admin' ? 'user' : 'admin' })}
            >
                <Shield size={14} color={item.role === 'admin' ? '#ef4444' : '#7c3aed'} />
                <Text style={[styles.actionText, { color: item.role === 'admin' ? '#ef4444' : '#7c3aed' }]}>
                    {item.role === 'admin' ? 'Downgrade' : 'Promote'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: item.status === 'banned' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}
                onPress={() => handleUpdate(item._id, { status: item.status === 'banned' ? 'active' : 'banned' })}
            >
                <AlertCircle size={14} color={item.status === 'banned' ? '#22c55e' : '#ef4444'} />
                <Text style={[styles.actionText, { color: item.status === 'banned' ? '#22c55e' : '#ef4444' }]}>
                    {item.status === 'banned' ? 'Recall' : 'Ban'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.03)', width: 40, justifyContent: 'center' }]}
                onPress={() => handleDelete(item._id)}
            >
                <Trash2 size={14} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('admin.menu.users.title')}</Text>
          <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBox}>
          <Search size={20} color="rgba(255,255,255,0.4)" />
          <TextInput 
            style={styles.input} 
            placeholder={t('admin.users.search')} 
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
      </View>

      {error && users.length === 0 ? (
          <View style={styles.errorContainer}>
              <AlertCircle size={40} color="#ef4444" />
              <Text style={styles.errorText}>{t('admin.users.error')}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                  <RefreshCcw size={18} color="white" />
                  <Text style={styles.retryText}>{t('admin.retry')}</Text>
              </TouchableOpacity>
          </View>
      ) : loading && !refreshing ? <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" /> : (
          <FlatList 
            data={filtered}
            keyExtractor={item => item._id}
            renderItem={({ item, index }) => <UserCard item={item} index={index} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>{t('admin.users.none')}</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { height: 100, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchBox: { margin: 20, height: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: 'white', fontSize: 16 },
  list: { padding: 20, gap: 15, paddingBottom: 100 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 15, flexDirection: 'row', gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '800' },
  info: { flex: 1, gap: 4 },
  userName: { color: 'white', fontSize: 16, fontWeight: '700' },
  userEmail: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 50 },
  userHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannedBadge: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bannedText: { color: '#ef4444', fontSize: 10, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionText: { fontSize: 12, fontWeight: '700' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'white', fontSize: 16, marginTop: 10 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 15 },
  retryText: { color: 'white', fontWeight: '700' }
});

export default AdminUsersScreen;

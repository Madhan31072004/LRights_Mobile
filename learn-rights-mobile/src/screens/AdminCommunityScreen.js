import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trash2, AlertTriangle, MessageSquare, User, Clock } from 'lucide-react-native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const AdminCommunityScreen = ({ navigation }) => {
    const { userId } = useUser();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = async () => {
        try {
            const res = await API.get('/community/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch posts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = (postId) => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/community/posts/${postId}`, {
                                params: { userId: userId }
                            });
                            setPosts(prev => prev.filter(p => p._id !== postId));
                            Alert.alert('Success', 'Post deleted successfully');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete post');
                        }
                    }
                }
            ]
        );
    };

    const PostItem = ({ item }) => (
        <View style={[styles.postCard, item.reported && styles.reportedCard]}>
            <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: item.reported ? '#7f1d1d' : '#2d2d5f' }]}>
                    <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
                </View>
                <View style={styles.postInfo}>
                    <Text style={styles.username}>{item.username}</Text>
                    <View style={styles.timeWrap}>
                        <Clock size={10} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                {item.reported && (
                    <TouchableOpacity 
                        onPress={async () => {
                            await API.patch(`/admin/community/posts/${item._id}/dismiss-report`);
                            setPosts(prev => prev.map(p => p._id === item._id ? { ...p, reported: false } : p));
                        }}
                        style={styles.dismissBtn}
                    >
                        <ShieldCheck size={16} color="#22c55e" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
            <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
            <View style={styles.footer}>
                <View style={styles.stat}>
                    <MessageSquare size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.statText}>{item.commentsCount || 0} comments</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.background} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Moderate Community</Text>
                    <Text style={styles.headerSub}>{posts.length} Total Posts</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator style={{ flex: 1 }} color="#7c3aed" />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <PostItem item={item} />}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPosts(); }} tintColor="#7c3aed" />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MessageSquare size={48} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>No posts yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    header: { height: 110, paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '500' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    list: { padding: 20, gap: 15, paddingBottom: 100 },
    postCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    reportedCard: { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(127, 29, 29, 0.05)' },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: '800' },
    postInfo: { flex: 1, marginLeft: 12 },
    username: { color: 'white', fontWeight: '700', fontSize: 15 },
    timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    timeText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    reportedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
    reportedText: { color: '#ef4444', fontSize: 10, fontWeight: '800' },
    dismissBtn: { padding: 8, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 10, marginRight: 8 },
    deleteBtn: { padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 10 },
    content: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    footer: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 16, fontWeight: '600', marginTop: 15 }
});

export default AdminCommunityScreen;

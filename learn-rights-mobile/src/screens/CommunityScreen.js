import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn, ZoomIn } from 'react-native-reanimated';
import { Heart, MessageCircle, Send, Plus, Image as ImageIcon, X, ShieldCheck, Users, Trash2, Flag, AlertTriangle } from 'lucide-react-native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const AVATAR_COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];
};

const CommunityScreen = () => {
    const { user, userId } = useUser();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [commentTexts, setCommentTexts] = useState({});

    const fetchPosts = async () => {
        try {
            const res = await API.get('/community/posts');
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        try {
            await API.post('/community/posts', {
                userId: user._id,
                username: user.name || 'Anonymous',
                content: newPostContent
            });
            setNewPostContent('');
            setShowCreateModal(false);
            fetchPosts();
        } catch (error) {
            alert("Failed to create post");
        }
    };

    const handleDeletePost = (postId) => {
        Alert.alert(
            t('community.delete_title') || "Delete Post",
            t('community.delete_confirm') || "Are you sure you want to delete this post?",
            [
                { text: t('common.cancel') || "Cancel", style: "cancel" },
                { 
                    text: t('common.delete') || "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`/community/posts/${postId}`, {
                                params: { userId: userId }
                            });
                            setPosts(posts.filter(p => p._id !== postId));
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete post");
                        }
                    }
                }
            ]
        );
    };

    const handleReportPost = (postId) => {
        Alert.alert(
            t('community.report_title') || "Report Post",
            t('community.report_confirm') || "Report this post for inappropriate content?",
            [
                { text: t('common.cancel') || "Cancel", style: "cancel" },
                { 
                    text: t('community.report_action') || "Report", 
                    onPress: async () => {
                        try {
                            await API.post(`/community/posts/${postId}/report`, {
                                userId: userId,
                                reason: "Inappropriate content"
                            });
                            Alert.alert("Success", "Post reported. Our team will review it.");
                        } catch (err) {
                            Alert.alert("Error", "Failed to report post");
                        }
                    }
                }
            ]
        );
    };

    const handleLike = async (postId) => {
        try {
            const res = await API.post(`/community/posts/${postId}/like?userId=${user._id}`);
            // Update local state to reflect like toggle immediately
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const liked = res.data.liked;
                    const newLikes = liked 
                        ? [...(p.likes || []), user._id] 
                        : (p.likes || []).filter(id => id !== user._id);
                    return { ...p, likes: newLikes, likesCount: newLikes.length };
                }
                return p;
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleComment = async (postId) => {
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        try {
            await API.post(`/community/posts/${postId}/comments`, {
                userId: user._id,
                username: user.name || 'Anonymous',
                text: text
            });
            setCommentTexts({ ...commentTexts, [postId]: '' });
            fetchPosts();
        } catch (error) {
            alert("Failed to add comment");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{t('community.title') || 'Community Hub'}</Text>
                    <Text style={styles.headerSubtitle}>{t('community.subtitle') || 'Join the conversation & empower others'}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
                    <LinearGradient colors={['#7c3aed', '#5b21b6']} style={styles.addBtnGradient}>
                        <Plus color="white" size={24} />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
                showsVerticalScrollIndicator={false}
            >
                {posts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Users size={60} color="rgba(124, 58, 237, 0.2)" />
                        <Text style={styles.emptyText}>{t('community.empty') || 'No voices yet. Be the first to share your journey!'}</Text>
                    </View>
                ) : (
                    posts.map((post, index) => (
                        <Animated.View 
                            key={post._id} 
                            entering={FadeInUp.delay(index * 100)}
                            style={styles.postCard}
                        >
                            <View style={styles.postHeader}>
                                <View style={[styles.avatar, { backgroundColor: getAvatarColor(post.username) }]}>
                                    <Text style={styles.avatarText}>{post.username?.[0]?.toUpperCase()}</Text>
                                    {post.username === 'Admin' && <View style={styles.adminBadge}><ShieldCheck size={10} color="white" /></View>}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.userNameRow}>
                                        <Text style={styles.postUsername}>{post.username}</Text>
                                        {post.username === 'Admin' && <Text style={styles.adminTag}>Staff</Text>}
                                    </View>
                                    <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                                </View>
                                
                                {post.userId === userId ? (
                                    <TouchableOpacity onPress={() => handleDeletePost(post._id)} style={styles.postControlBtn}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => handleReportPost(post._id)} style={styles.postControlBtn}>
                                        <Flag size={18} color="rgba(255,255,255,0.3)" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Text style={styles.postContent}>{post.content}</Text>
                            
                            {post.imageUrl && (
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                                </View>
                            )}

                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post._id)}>
                                    <View style={[styles.actionIconBg, post.likes?.includes(user._id) && styles.actionIconBgActive]}>
                                        <Heart 
                                            size={18} 
                                            color={post.likes?.includes(user._id) ? "white" : "rgba(255,255,255,0.4)"}
                                            fill={post.likes?.includes(user._id) ? "white" : "transparent"}
                                        />
                                    </View>
                                    <Text style={[styles.actionText, post.likes?.includes(user._id) && styles.actionTextActive]}>{post.likesCount || 0}</Text>
                                </TouchableOpacity>

                                <View style={styles.actionBtn}>
                                    <View style={styles.actionIconBg}>
                                        <MessageCircle size={18} color="rgba(255,255,255,0.4)" />
                                    </View>
                                    <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
                                </View>
                            </View>

                            {/* Comments Preview */}
                            {post.comments?.length > 0 && (
                                <View style={styles.commentsList}>
                                    {post.comments.slice(-2).map(comment => (
                                        <View key={comment.id} style={styles.commentItem}>
                                            <View style={[styles.commentAvatar, { backgroundColor: getAvatarColor(comment.username) }]}>
                                                <Text style={styles.commentAvatarText}>{comment.username?.[0]?.toUpperCase()}</Text>
                                            </View>
                                            <View style={styles.commentContent}>
                                                <Text style={styles.commentUser}>{comment.username}</Text>
                                                <Text style={styles.commentText}>{comment.text}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Add Comment Input */}
                            <View style={styles.commentInputWrap}>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder={t('community.add_comment') || "Add a comment..."}
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={commentTexts[post._id] || ''}
                                    onChangeText={(val) => setCommentTexts({ ...commentTexts, [post._id]: val })}
                                />
                                <TouchableOpacity onPress={() => handleComment(post._id)} style={styles.commentSendBtn}>
                                    <Send size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))
                )}
            </ScrollView>

            {showCreateModal && (
                <View style={styles.modalOverlay}>
                    <LinearGradient colors={['rgba(15, 12, 41, 0.95)', 'rgba(26, 23, 68, 0.98)']} style={StyleSheet.absoluteFill} />
                    <Animated.View entering={FadeInUp.springify()} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{t('community.create_post') || 'Create Post'}</Text>
                                <Text style={styles.modalSubtitle}>Share your voice with the community</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCloseBtn}>
                                <X color="white" size={24} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <View style={styles.modalUserRow}>
                                <View style={[styles.avatar, { width: 32, height: 32, borderRadius: 10, backgroundColor: getAvatarColor(user?.name) }]}>
                                    <Text style={[styles.avatarText, { fontSize: 14 }]}>{user?.name?.[0]?.toUpperCase()}</Text>
                                </View>
                                <Text style={styles.modalUserName}>{user?.name}</Text>
                            </View>
                            
                            <TextInput
                                style={styles.modalInput}
                                placeholder={t('community.post_placeholder') || "What's on your mind regarding legal rights?"}
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                multiline
                                autoFocus
                                value={newPostContent}
                                onChangeText={setNewPostContent}
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.attachBtn}>
                                <ImageIcon size={20} color="rgba(255,255,255,0.5)" />
                                <Text style={styles.attachText}>Add Image</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.publishBtn, !newPostContent.trim() && styles.publishBtnDisabled]} 
                                onPress={handleCreatePost}
                                disabled={!newPostContent.trim()}
                            >
                                <LinearGradient 
                                    colors={newPostContent.trim() ? ['#7c3aed', '#5b21b6'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']} 
                                    style={styles.publishGradient}
                                >
                                    <Send size={20} color={newPostContent.trim() ? "white" : "rgba(255,255,255,0.2)"} />
                                    <Text style={[styles.publishBtnText, !newPostContent.trim() && { color: 'rgba(255,255,255,0.2)' }]}>
                                        {t('community.publish') || 'Publish'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0c29' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29' },
    header: { height: 140, justifyContent: 'flex-end', paddingBottom: 25, paddingHorizontal: 20 },
    headerContent: { },
    headerTitle: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500', marginTop: 4 },
    addBtn: { position: 'absolute', right: 20, bottom: 25, width: 50, height: 50, borderRadius: 25, overflow: 'hidden', elevation: 10, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
    addBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 120 },
    postCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    avatarText: { color: 'white', fontWeight: '800', fontSize: 18 },
    userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    postUsername: { color: 'white', fontSize: 16, fontWeight: '700' },
    adminBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#10b981', borderRadius: 8, padding: 2, borderWidth: 2, borderColor: '#0f0c29' },
    adminTag: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, textTransform: 'uppercase' },
    postTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 1 },
    postControlBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10 },
    postContent: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 24, marginBottom: 15 },
    imageContainer: { borderRadius: 18, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    postImage: { width: '100%', height: 200, resizeMode: 'cover' },
    postActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.04)', paddingTop: 12, gap: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionIconBg: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    actionIconBgActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
    actionText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
    actionTextActive: { color: 'white' },
    commentsList: { marginTop: 15, gap: 12, paddingVertical: 10, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
    commentItem: { flexDirection: 'row', gap: 10 },
    commentAvatar: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    commentAvatarText: { color: 'white', fontSize: 12, fontWeight: '800' },
    commentContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
    commentUser: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 11, marginBottom: 2 },
    commentText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 18 },
    commentInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, paddingHorizontal: 12, marginTop: 15, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    commentInput: { flex: 1, color: 'white', fontSize: 14, paddingRight: 10 },
    commentSendBtn: { backgroundColor: '#7c3aed', width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100, gap: 15 },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 15, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 12, 41, 0.98)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'transparent', width: '100%', height: '100%', padding: 25, paddingTop: 60 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
    modalSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    modalCloseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    inputContainer: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    modalUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    modalUserName: { color: 'white', fontSize: 16, fontWeight: '700' },
    modalInput: { flex: 1, color: 'white', fontSize: 18, lineHeight: 28, textAlignVertical: 'top' },
    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, paddingBottom: 40 },
    attachBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    attachText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
    publishBtn: { width: 140, height: 50, borderRadius: 15, overflow: 'hidden' },
    publishBtnDisabled: { opacity: 0.5 },
    publishGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    publishBtnText: { color: 'white', fontSize: 16, fontWeight: '800' }
});

export default CommunityScreen;

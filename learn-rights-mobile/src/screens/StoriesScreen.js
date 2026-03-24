import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { ChevronRight, Bookmark, Heart, Share2, BookOpen, Zap } from 'lucide-react-native';
import API from '../api/axios';
import { useUser } from '../contexts/UserContext';
import { t } from '../utils/translation';

const { width } = Dimensions.get('window');

const REAL_STORIES = [
    {
        _id: 's1',
        title: 'Ruth Bader Ginsburg',
        author: 'Legal Pioneer',
        excerpt: 'The second female justice of the US Supreme Court who spent her life fighting for gender equality...',
        content: `Ruth Bader Ginsburg was a visionary legal mind who transformed the landscape of women's rights. Born in 1933, she faced significant discrimination throughout her career, which fueled her passion for justice.\n\nAs a lawyer, she argued six landmark cases before the Supreme Court, winning five of them. Her strategy was brilliant: she showed that gender discrimination hurt everyone, not just women. She famously fought for the rights of a widower to receive social security benefits, proving that equality is a universal human right.\n\nHer legacy lives on as a reminder that "Real change, enduring change, happens one step at a time."`,
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
        category: 'Legal Rights',
        color: '#7c3aed'
    },
    {
        _id: 's2',
        title: 'Malala Yousafzai',
        author: 'Education Rights Activist',
        excerpt: 'The youngest Nobel Prize laureate who defied the Taliban to stand up for girls\' education...',
        content: `Malala Yousafzai's journey began in the Swat Valley of Pakistan, where she spoke out against the prohibition of girls' education. Despite a life-threatening attack, her voice only grew stronger.\n\nShe co-founded the Malala Fund, an international non-profit that advocates for girls' education. She believes that "one child, one teacher, one book, and one pen can change the world."\n\nMalala's story is a testament to the power of a single voice in the face of systemic oppression. Today, she continues to inspire millions of girls to pursue their dreams through education.`,
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
        category: 'Education',
        color: '#ec4899'
    },
    {
        _id: 's3',
        title: 'Sudha Murty',
        author: 'Social Changemaker',
        excerpt: 'From being the first female engineer at TELCO to leading massive social reforms across India...',
        content: `Sudha Murty is a celebrated author, philanthropist, and the chairperson of the Infosys Foundation. She is known for her humility and her immense contribution to social work, particularly in education and healthcare.\n\nShe broke barriers early in her career by writing a postcards to the chairman of TELCO, questioning their "male-only" hiring policy. This act of courage led to her becoming the first woman engineer at the company.\n\nThrough her foundation, she has built thousands of libraries and supported numerous orphanages. Her philosophy of "simple living, high thinking" makes her a role model for aspiring changemakers everywhere.`,
        imageUrl: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=800',
        category: 'Social Reform',
        color: '#f59e0b'
    }
];

const StoriesScreen = ({ navigation }) => {
    const { language } = useUser();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [discovering, setDiscovering] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);

    const fetchStories = async () => {
        try {
            const res = await API.get(`/stories?lang=${language}`);
            setStories(res.data.length > 0 ? res.data : REAL_STORIES);
        } catch (error) {
            console.error("Error fetching stories:", error);
            setStories(REAL_STORIES);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const discoverStories = async () => {
        setDiscovering(true);
        try {
            const res = await API.post('/stories/generate', { lang: language });
            if (res.data && res.data.length > 0) {
                // Merge new stories at the top, avoiding duplicates
                setStories(prev => {
                    const existingIds = new Set(prev.map(s => s._id));
                    const newUnique = res.data.filter(s => !existingIds.has(s._id));
                    return [...newUnique, ...prev];
                });
            }
        } catch (error) {
            console.error("Error discovering stories:", error);
            Alert.alert(t('common.error') || 'Error', 'Failed to discover new stories. Please try again later.');
        } finally {
            setDiscovering(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [language]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ec4899" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0f0c29', '#1a1744']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{t('stories.title') || 'Inspiring Journeys'}</Text>
                    <Text style={styles.headerSubtitle}>{t('stories.subtitle') || 'Learn from those who paved the way'}</Text>
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchStories();}} tintColor="#ec4899" />}
                showsVerticalScrollIndicator={false}
            >
                {stories.map((story, index) => (
                    <Animated.View 
                        key={story._id} 
                        entering={FadeInUp.delay(index * 150)}
                        style={styles.storyCard}
                    >
                        <TouchableOpacity 
                            activeOpacity={0.9} 
                            style={styles.cardTouch}
                            onPress={() => setSelectedStory(story)}
                        >
                            <Image source={{ uri: story.imageUrl }} style={styles.storyImage} />
                            <LinearGradient 
                                colors={['transparent', 'rgba(15, 12, 41, 0.4)', 'rgba(15, 12, 41, 0.95)']} 
                                style={styles.storyGradient}
                            />
                            
                            <View style={styles.storyInfo}>
                                {story.aiGenerated && (
                                    <View style={styles.aiBadge}>
                                        <Zap size={10} color="white" />
                                        <Text style={styles.aiText}>AI CRAFTED</Text>
                                    </View>
                                )}
                                <View style={[styles.categoryBadge, { backgroundColor: story.color || '#ec4899' }]}>
                                    <Text style={styles.categoryText}>{story.category?.toUpperCase()}</Text>
                                </View>
                                <Text style={styles.storyTitle}>{story.title}</Text>
                                <Text style={styles.storyExcerpt} numberOfLines={2}>{story.excerpt}</Text>
                                
                                <View style={styles.readBtn}>
                                    <Text style={styles.readBtnText}>{t('stories.read_full') || 'Unveiling the Story'}</Text>
                                    <ChevronRight size={18} color="white" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity 
                    style={styles.discoverBtn} 
                    onPress={discoverStories}
                    disabled={discovering}
                >
                    <LinearGradient 
                        colors={['#ec4899', '#7c3aed']} 
                        start={{ x: 0, y: 0 }} 
                        end={{ x: 1, y: 0 }}
                        style={styles.discoverGradient}
                    >
                        {discovering ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Zap size={20} color="white" />
                                <Text style={styles.discoverText}>Discover More AI Stories</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <BookOpen size={20} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.footerText}>New stories generated on demand</Text>
                </View>
            </ScrollView>

            {/* Story Reader Modal */}
            {selectedStory && (
                <View style={styles.modalOverlay}>
                    <Animated.View entering={FadeInUp} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedStory(null)}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalCategory}>{selectedStory.category}</Text>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                            <Text style={styles.modalTitle}>{selectedStory.title}</Text>
                            <Text style={styles.modalAuthor}>By {selectedStory.author}</Text>
                            <View style={[styles.divider, { backgroundColor: selectedStory.color || '#ec4899' }]} />
                            <Text style={styles.modalText}>{selectedStory.content}</Text>
                        </ScrollView>
                        
                        <TouchableOpacity 
                            style={[styles.actionFab, { backgroundColor: selectedStory.color || '#ec4899' }]}
                            onPress={() => setSelectedStory(null)}
                        >
                            <ChevronRight size={24} color="white" style={{ transform: [{ rotate: '90deg' }] }} />
                        </TouchableOpacity>
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
    headerContent: {},
    headerTitle: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500', marginTop: 4 },
    scrollContent: { padding: 16, paddingBottom: 100 },
    storyCard: { height: 320, borderRadius: 30, overflow: 'hidden', marginBottom: 20, elevation: 8, shadowColor: '#f43f5e', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    cardTouch: { flex: 1 },
    storyImage: { ...StyleSheet.absoluteFillObject },
    storyGradient: { ...StyleSheet.absoluteFillObject },
    storyInfo: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 25 },
    categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    categoryText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    storyTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 10, lineHeight: 30 },
    storyExcerpt: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 20, lineHeight: 22, fontWeight: '500' },
    readBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    readBtnText: { color: 'white', fontWeight: '800', fontSize: 13 },
    footerInfo: { alignItems: 'center', marginTop: 20, gap: 10, opacity: 0.3 },
    footerText: { color: 'white', fontSize: 12, fontWeight: '600' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 12, 41, 0.98)', zIndex: 1000 },
    modalContent: { flex: 1, paddingTop: 60, paddingHorizontal: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    closeBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
    closeBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    modalCategory: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
    modalScroll: { paddingBottom: 150 },
    modalTitle: { color: 'white', fontSize: 32, fontWeight: '900', marginBottom: 10, lineHeight: 40 },
    modalAuthor: { color: '#ec4899', fontSize: 16, fontWeight: '700', marginBottom: 25 },
    divider: { height: 4, width: 60, borderRadius: 2, marginBottom: 30 },
    modalText: { color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 30, fontWeight: '400' },
    actionFab: { position: 'absolute', bottom: 40, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 15 },
    aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.3)' },
    aiText: { color: 'white', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
    discoverBtn: { marginTop: 10, marginBottom: 30, borderRadius: 20, overflow: 'hidden', elevation: 5, shadowColor: '#ec4899', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
    discoverGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    discoverText: { color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});

export default StoriesScreen;

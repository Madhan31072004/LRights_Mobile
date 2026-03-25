import React, { useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    Modal, 
    TouchableOpacity, 
    TextInput, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Star, Send, X, MessageSquareHeart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    FadeIn, 
    FadeOut, 
    ZoomIn, 
    ZoomOut,
    useAnimatedStyle,
    withSpring,
    useSharedValue
} from 'react-native-reanimated';
import API from '../api/axios';

const ReviewModal = ({ visible, onClose, userId, initialRating = 0, initialFeedback = '' }) => {
    const [rating, setRating] = useState(initialRating);
    const [feedback, setFeedback] = useState(initialFeedback);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Only initialize state when the modal BECOMES visible
    const isVisibleRef = React.useRef(visible);
    React.useEffect(() => {
        if (visible && !isVisibleRef.current) {
            setRating(initialRating);
            setFeedback(initialFeedback);
        }
        isVisibleRef.current = visible;
    }, [visible, initialRating, initialFeedback]);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);
        try {
            await API.post(`/reviews/${userId}`, { rating, feedback });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset state after closing
                setTimeout(() => {
                    setSubmitted(false);
                    setRating(0);
                    setFeedback('');
                }, 500);
            }, 2000);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const StarIcon = ({ index }) => {
        const scale = useSharedValue(1);
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withSpring(scale.value) }]
        }));

        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                onPressIn={() => scale.value = 1.3}
                onPressOut={() => scale.value = 1}
                onPress={() => setRating(index)}
            >
                <Animated.View style={[styles.starIcon, animatedStyle]}>
                    <Star 
                        size={32} 
                        color={index <= rating ? '#FFD700' : 'rgba(255,255,255,0.2)'} 
                        fill={index <= rating ? '#FFD700' : 'transparent'} 
                    />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    if (!visible && !submitted) return null;

    // Custom component to handle Modal vs View differences between Native and Web
    const ModalComponent = Platform.OS === 'web' ? View : Modal;
    const modalProps = Platform.OS === 'web' 
        ? { style: [StyleSheet.absoluteFill, { zIndex: 9999, display: visible || submitted ? 'flex' : 'none' }] }
        : { visible: visible || submitted, transparent: true, animationType: 'none', onRequestClose: onClose };

    return (
        <ModalComponent {...modalProps}>
            <View style={styles.overlay} pointerEvents="box-none">
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                
                <Animated.View 
                    entering={Platform.OS === 'web' ? FadeIn : ZoomIn.duration(400)} 
                    exiting={Platform.OS === 'web' ? FadeOut : ZoomOut.duration(300)}
                    style={styles.container}
                >
                    <LinearGradient 
                        colors={['#2c1a4d', '#1a0b2e']} 
                        style={styles.gradient} 
                    />
                    
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <MessageSquareHeart size={24} color="#a855f7" />
                            <Text style={styles.titleText}>Share Your Feedback</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    </View>
                    
                    <View pointerEvents="auto">
                        {submitted ? (
                            <Animated.View entering={FadeIn} style={styles.successContent}>
                                <Star size={64} color="#FFD700" fill="#FFD700" />
                                <Text style={styles.successTitle}>Thank You!</Text>
                                <Text style={styles.successText}>Your review helps us improve LearnRights for everyone.</Text>
                            </Animated.View>
                        ) : (
                            <KeyboardAvoidingView 
                                behavior={Platform.OS === 'ios' ? 'padding' : (Platform.OS === 'android' ? 'height' : undefined)}
                                style={styles.formContent}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                            >
                                <Text style={styles.questionText}>How are you finding the app so far?</Text>
                                
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} index={i} />)}
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Write your experience..."
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        multiline
                                        numberOfLines={4}
                                        value={feedback}
                                        onChangeText={setFeedback}
                                        blurOnSubmit={false}
                                        autoFocus={visible}
                                        selectable={true}
                                        selectionColor="#a855f7"
                                        cursorColor="#a855f7"
                                        editable={true}
                                        textAlign="left"
                                    />
                                </View>

                                <TouchableOpacity 
                                    style={[styles.submitBtn, rating === 0 && styles.disabledBtn]} 
                                    onPress={handleSubmit}
                                    disabled={rating === 0 || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitBtnText}>Submit Review</Text>
                                            <Send size={18} color="white" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity onPress={onClose} style={styles.maybeLaterBtn}>
                                    <Text style={styles.maybeLaterText}>Maybe Later</Text>
                                </TouchableOpacity>
                            </KeyboardAvoidingView>
                        )}
                    </View>
                </Animated.View>
            </View>
        </ModalComponent>
    );
};

const styles = StyleSheet.create({
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 24 
    },
    container: { 
        width: '100%', 
        backgroundColor: '#1a0b2e', 
        borderRadius: 24, 
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.2)'
    },
    gradient: { 
        ...StyleSheet.absoluteFillObject 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    titleRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10 
    },
    titleText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: '700' 
    },
    closeBtn: { 
        padding: 4 
    },
    formContent: { 
        padding: 24,
        alignItems: 'center'
    },
    questionText: { 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: 16, 
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '500'
    },
    starsContainer: { 
        flexDirection: 'row', 
        gap: 12, 
        marginBottom: 32 
    },
    starIcon: { 
        padding: 4 
    },
    inputContainer: { 
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    input: { 
        color: 'white', 
        fontSize: 15, 
        minHeight: 80,
        textAlignVertical: 'top',
        textAlign: 'left'
    },
    submitBtn: { 
        width: '100%',
        height: 56,
        backgroundColor: '#a855f7',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4
    },
    disabledBtn: {
        backgroundColor: 'rgba(168, 85, 247, 0.3)'
    },
    submitBtnText: { 
        color: 'white', 
        fontSize: 16, 
        fontWeight: '700' 
    },
    maybeLaterBtn: {
        marginTop: 16,
        padding: 8
    },
    maybeLaterText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '600'
    },
    successContent: {
        padding: 40,
        alignItems: 'center'
    },
    successTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
        marginTop: 20,
        marginBottom: 10
    },
    successText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22
    }
});

export default ReviewModal;

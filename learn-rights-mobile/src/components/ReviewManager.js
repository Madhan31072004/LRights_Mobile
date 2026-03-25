import React, { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';
import ReviewModal from './ReviewModal';

const USAGE_TIME_KEY = 'accumulatedUsageTime';
const HAS_REVIEWED_KEY = 'hasReviewedOrDismissed';
const TARGET_TIME = 600; // 10 minutes in seconds

const ReviewManager = () => {
    const { userId, token } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await AsyncStorage.getItem(HAS_REVIEWED_KEY);
            if (status === 'true') {
                setHasReviewed(true);
            }
        };
        checkStatus();
    }, []);

    useEffect(() => {
        // Skip if already reviewed (either via flag or user data from context)
        const hasExistingReview = user?.appReview?.rating > 0;
        
        if (!token || !userId || hasReviewed || hasExistingReview) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // Increment usage time every 30 seconds
        timerRef.current = setInterval(async () => {
            try {
                const storedTime = await AsyncStorage.getItem(USAGE_TIME_KEY);
                let currentTime = storedTime ? parseInt(storedTime) : 0;
                currentTime += 30;
                
                await AsyncStorage.setItem(USAGE_TIME_KEY, currentTime.toString());
                
                if (currentTime >= TARGET_TIME) {
                    setShowModal(true);
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            } catch (err) {
                console.error('Error updating usage time:', err);
            }
        }, 30000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [token, userId, hasReviewed]);

    const handleClose = async () => {
        setShowModal(false);
        setHasReviewed(true);
        await AsyncStorage.setItem(HAS_REVIEWED_KEY, 'true');
    };

    if (!showModal) return null;

    return <ReviewModal visible={showModal} onClose={handleClose} userId={userId} />;
};

export default ReviewManager;

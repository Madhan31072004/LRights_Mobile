import React, { useState, useEffect } from 'react';
import './DownloadBanner.css';

const DownloadBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isDismissed = localStorage.getItem('downloadBannerDismissed');
        if (!isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('downloadBannerDismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="download-banner">
            <div className="banner-content">
                <div className="banner-icon">📱</div>
                <div className="banner-text">
                    <span className="banner-title">Get the Mobile App</span>
                    <span className="banner-subtitle">Take your legal education journey anywhere!</span>
                </div>
                <div className="banner-actions">
                    <a href="https://expo.dev/artifacts/eas/2bvMRsrTbWxt1gmAPvtB4W.apk" download="learn-rights.apk" target="_blank" rel="noopener noreferrer" className="download-btn">
                        Download Now
                    </a>
                    <button className="dismiss-btn" onClick={handleDismiss} aria-label="Close">
                        &times;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadBanner;

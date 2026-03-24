import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Welcome.css";

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    t('welcome.quote1', { defaultValue: "Knowledge is power, especially when it comes to your rights." }),
    t('welcome.quote2', { defaultValue: "Empower yourself with legal knowledge in your language." }),
    t('welcome.quote3', { defaultValue: "Your rights matter. Learn them, understand them, exercise them." }),
    t('welcome.quote4', { defaultValue: "Justice begins with awareness and education." })
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="welcome-container">
      {/* Animated Background Elements */}
      <div className="welcome-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      {/* Main Content */}
      <div className="welcome-content">
        {/* Header */}
        <div className="welcome-header">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="logo-text">⚖️</span>
            </div>
            <h1 className="brand-name">Learn Rights</h1>
          </div>
          <p className="tagline">
            {t('welcome.tagline', { defaultValue: 'Know your legal rights in your own language' })}
          </p>
        </div>

        {/* Hero Card */}
        <div className="welcome-card">
          <div className="card-content">
            <div className="hero-icon">
              📚
            </div>
            <h2 className="hero-title">
              {t('welcome.title', { defaultValue: 'Welcome to Legal Education' })}
            </h2>
            <p className="hero-description">
              {t('welcome.description', {
                defaultValue: 'Empower yourself with comprehensive legal knowledge. Learn about your rights, understand legal procedures, and navigate the justice system with confidence.'
              })}
            </p>

            {/* Rotating Quotes */}
            <div className="quote-section">
              <div className="quote-icon">💡</div>
              <p className="quote-text">{quotes[currentQuote]}</p>
              <div className="quote-dots">
                {quotes.map((_, index) => (
                  <span
                    key={index}
                    className={`quote-dot ${index === currentQuote ? 'active' : ''}`}
                  ></span>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🌍</div>
                <span className="feature-text">
                  {t('welcome.feature1', { defaultValue: 'Multi-language Support' })}
                </span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📖</div>
                <span className="feature-text">
                  {t('welcome.feature2', { defaultValue: 'Interactive Learning' })}
                </span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <span className="feature-text">
                  {t('welcome.feature3', { defaultValue: 'Progress Tracking' })}
                </span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <span className="feature-text">
                  {t('welcome.feature4', { defaultValue: 'AI Assistant' })}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="welcome-cta-btn"
              onClick={() => navigate("/signup")}
            >
              <span className="btn-text">
                {t('welcome.get_started', { defaultValue: 'Get Started' })}
              </span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <p className="footer-text">
            {t('welcome.footer', { defaultValue: 'Join thousands of users learning their legal rights' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

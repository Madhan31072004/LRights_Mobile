import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import { useUser } from '../contexts/UserContext';
import "../styles/Home.css";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, modules, progress, loading } = useUser();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "📚",
      title: t('home.features.modules.title', { defaultValue: 'Learning Modules' }),
      description: t('home.features.modules.description', { defaultValue: 'Rights explained with real-life examples and interactive content.' }),
      action: () => navigate("/modules"),
      actionText: t('home.features.modules.action', { defaultValue: 'Start Learning' }),
      color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      icon: "🤖",
      title: t('home.features.chatbot.title', { defaultValue: 'AI Legal Assistant' }),
      description: t('home.features.chatbot.description', { defaultValue: 'Ask legal questions anytime in your preferred language.' }),
      action: () => navigate("/chatbot"),
      actionText: t('home.features.chatbot.action', { defaultValue: 'Ask Questions' }),
      color: "linear-gradient(135deg, #f093fb, #f5576c)"
    },
    {
      icon: "🏆",
      title: t('home.features.leaderboard.title', { defaultValue: 'Community Leaderboard' }),
      description: t('home.features.leaderboard.description', { defaultValue: 'Earn points, track progress, and compete with others.' }),
      action: () => navigate("/leaderboard"),
      actionText: t('home.features.leaderboard.action', { defaultValue: 'View Rankings' }),
      color: "linear-gradient(135deg, #4facfe, #00f2fe)"
    }
  ];

  const stats = [
    { number: "500+", label: t('home.stats.users', { defaultValue: 'Active Learners' }) },
    { number: "12", label: t('home.stats.modules', { defaultValue: 'Learning Modules' }) },
    { number: "3", label: t('home.stats.languages', { defaultValue: 'Languages' }) },
    { number: "24/7", label: t('home.stats.support', { defaultValue: 'AI Support' }) }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <MainLayout>
      <div className="home-container">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {t('home.hero.title', { defaultValue: 'Learn Your Rights' })}
                <span className="hero-subtitle">
                  {t('home.hero.subtitle', { defaultValue: 'Empower Yourself' })}
                </span>
              </h1>
              <p className="hero-description">
                {t('home.hero.description', {
                  defaultValue: 'Simple • Multilingual • AI-powered learning platform designed for rural women to understand and exercise their legal rights.'
                })}
              </p>

              <div className="hero-buttons">
                <button
                  className="hero-button primary"
                  onClick={() => navigate("/modules")}
                >
                  <span className="button-icon">🚀</span>
                  {t('home.hero.start_learning', { defaultValue: 'Start Learning' })}
                </button>
                <button
                  className="hero-button secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  <span className="button-icon">📊</span>
                  {t('home.hero.view_dashboard', { defaultValue: 'View Dashboard' })}
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="floating-elements">
                <div className="floating-card card-1">
                  <span className="floating-icon">⚖️</span>
                  <span className="floating-text">{t('home.hero.rights', { defaultValue: 'Know Your Rights' })}</span>
                </div>
                <div className="floating-card card-2">
                  <span className="floating-icon">💪</span>
                  <span className="floating-text">{t('home.hero.empower', { defaultValue: 'Get Empowered' })}</span>
                </div>
                <div className="floating-card card-3">
                  <span className="floating-icon">🌟</span>
                  <span className="floating-text">{t('home.hero.grow', { defaultValue: 'Grow Together' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="hero-bg-elements">
            <div className="bg-circle circle-1"></div>
            <div className="bg-circle circle-2"></div>
            <div className="bg-circle circle-3"></div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="home-stats">
          <div className="stats-container">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="home-features">
          <div className="features-header">
            <h2 className="features-title">
              {t('home.features.title', { defaultValue: 'Why Choose Learn Rights?' })}
            </h2>
            <p className="features-subtitle">
              {t('home.features.subtitle', { defaultValue: 'Discover the features that make learning legal rights accessible and engaging.' })}
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${index === currentFeature ? 'active' : ''}`}
                onClick={feature.action}
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-icon" style={{ background: feature.color }}>
                  {feature.icon}
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <button className="feature-button">
                    {feature.actionText}
                    <span className="button-arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Indicators */}
          <div className="feature-indicators">
            {features.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentFeature ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="home-cta">
          <div className="cta-content">
            <h2 className="cta-title">
              {t('home.cta.title', { defaultValue: 'Ready to Start Your Learning Journey?' })}
            </h2>
            <p className="cta-description">
              {t('home.cta.description', { defaultValue: 'Join thousands of women who are learning and exercising their rights every day.' })}
            </p>
            <div className="cta-buttons">
              <button
                className="cta-button primary"
                onClick={() => navigate("/signup")}
              >
                {t('home.cta.join_now', { defaultValue: 'Join Now - It\'s Free' })}
              </button>
              <button
                className="cta-button secondary"
                onClick={() => navigate("/login")}
              >
                {t('home.cta.sign_in', { defaultValue: 'Sign In' })}
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;

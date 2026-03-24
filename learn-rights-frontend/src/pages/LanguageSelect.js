import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./LanguageSelect.css";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectLanguage = async (lang) => {
    setSelectedLanguage(lang.name);
    setIsLoading(true);

    const langCode = getLangCode(lang.name);
    localStorage.setItem("language", langCode);
    i18n.changeLanguage(langCode);

    // Simulate loading for better UX
    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  const getLangCode = (lang) => {
    const langMap = {
      English: 'en',
      Hindi: 'hi',
      Tamil: 'ta',
      Bengali: 'bn',
      Telugu: 'te',
      Marathi: 'mr',
      Urdu: 'ur',
      Gujarati: 'gu',
      Kannada: 'kn',
      Odia: 'or',
      Punjabi: 'pa',
      Malayalam: 'ml',
      Assamese: 'as'
    };
    return langMap[lang] || 'en';
  };

  const languages = [
    { name: "English", nativeName: "English", flag: "🇺🇸", color: "#007bff", region: "Global" },
    { name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳", color: "#28a745", region: "India" },
    { name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", color: "#ffc107", region: "Bengal" },
    { name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", color: "#dc3545", region: "Telangana & Andhra Pradesh" },
    { name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", color: "#6f42c1", region: "Maharashtra" },
    { name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", color: "#e83e8c", region: "Tamil Nadu" },
    { name: "Urdu", nativeName: "اردو", flag: "IN", color: "#fd7e14", region: "All" },
    { name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", color: "#20c997", region: "Gujarat" },
    { name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", color: "#17a2b8", region: "Karnataka" },
    { name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳", color: "#6c757d", region: "Odisha" },
    { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", color: "#343a40", region: "Punjab" },
    { name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", color: "#f8f9fa", region: "Kerala" },
    { name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳", color: "#007bff", region: "Assam" }
  ];

  return (
    <div className="language-container">
      {/* Animated Background */}
      <div className="language-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">
            {t('language.loading', { defaultValue: 'Setting up your language...' })}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="language-content">
        {/* Header */}
        <div className="language-header">
          <div className="header-icon">
            🌍
          </div>
          <h1 className="language-title">
            {t('language.title', { defaultValue: 'Choose Your Language' })}
          </h1>
          <p className="language-subtitle">
            {t('language.subtitle', {
              defaultValue: 'Select your preferred language to continue your legal education journey'
            })}
          </p>
        </div>

        {/* Language Grid */}
        <div className="language-grid">
          {languages.map((lang, index) => (
            <div
              key={lang.name}
              className={`language-card ${selectedLanguage === lang.name ? 'selected' : ''}`}
              onClick={() => selectLanguage(lang)}
              style={{
                animationDelay: `${index * 0.1}s`,
                '--accent-color': lang.color
              }}
            >
              <div className="card-header">
                <div className="flag-icon">{lang.flag}</div>
                <div className="region-badge">{lang.region}</div>
              </div>

              <div className="card-content">
                <h3 className="language-name">{lang.name}</h3>
                <p className="native-name">{lang.nativeName}</p>
              </div>

              <div className="card-footer">
                <div
                  className="accent-bar"
                  style={{ backgroundColor: lang.color }}
                ></div>
              </div>

              {selectedLanguage === lang.name && (
                <div className="selection-indicator">
                  <span className="checkmark">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="language-footer">
          <p className="footer-text">
            {t('language.footer', {
              defaultValue: 'More languages will be added soon. Your choice helps us improve our platform.'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;

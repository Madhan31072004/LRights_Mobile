import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import './Settings.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState({
    language: localStorage.getItem('language') || 'en',
    fontSize: localStorage.getItem('fontSize') || 'medium',
    notifications: JSON.parse(localStorage.getItem('notifications') || 'true'),
    voiceEnabled: JSON.parse(localStorage.getItem('voiceEnabled') || 'true'),
    darkMode: JSON.parse(localStorage.getItem('darkMode') || 'false')
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو (Urdu)', flag: '🇵🇰' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' }
  ];

  const handleLanguageChange = (lang) => {
    setSettings({ ...settings, language: lang });
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleFontSizeChange = (size) => {
    setSettings({ ...settings, fontSize: size });
    localStorage.setItem('fontSize', size);
    applyFontSize(size);
  };

  const applyFontSize = (size) => {
    const doc = document.documentElement;
    if (size === 'small') doc.style.fontSize = '14px';
    else if (size === 'medium') doc.style.fontSize = '16px';
    else if (size === 'large') doc.style.fontSize = '18px';
  };

  const toggleSetting = (settingKey) => {
    const newSettings = { ...settings, [settingKey]: !settings[settingKey] };
    setSettings(newSettings);
    localStorage.setItem(settingKey, JSON.stringify(newSettings[settingKey]));
  };

  const handleDataExport = () => {
    const data = {
      completedModules: localStorage.getItem('completedModules'),
      chatHistory: localStorage.getItem('chatbotHistory'),
      userProgress: localStorage.getItem('userProgress'),
      exportDate: new Date().toLocaleString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learn-rights-backup-${Date.now()}.json`;
    a.click();
  };

  const handleDataDelete = () => {
    if (window.confirm(t('settings.delete_confirm', { defaultValue: 'Are you sure you want to delete all your data? This cannot be undone.' }))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <MainLayout>
      <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ {t('settings.title', { defaultValue: 'Settings' })}</h1>
          <p>{t('settings.subtitle', { defaultValue: 'Customize your experience' })}</p>
        </div>

        {/* Language Settings */}
        <div className="settings-section">
          <h2>🌍 {t('settings.language', { defaultValue: 'Language' })}</h2>
          <div className="setting-item">
            <label>{t('settings.select_language', { defaultValue: 'Select your preferred language:' })}</label>
            <div className="language-options">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-button ${settings.language === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <h2>👁️ {t('settings.display', { defaultValue: 'Display' })}</h2>
          <div className="setting-item">
            <label>{t('settings.font_size', { defaultValue: 'Font Size:' })}</label>
            <div className="font-options">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={`size-button ${settings.fontSize === size ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange(size)}
                  style={{ fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px' }}
                >
                  {t(`settings.font_${size}`, { defaultValue: size.charAt(0).toUpperCase() + size.slice(1) })}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item toggle-item">
            <div className="toggle-header">
              <label>{t('settings.dark_mode', { defaultValue: 'Dark Mode' })}</label>
              <button
                className={`toggle-switch ${settings.darkMode ? 'on' : 'off'}`}
                onClick={() => toggleSetting('darkMode')}
              >
                {settings.darkMode ? t('settings.on') : t('settings.off')}
              </button>
            </div>
            <p className="setting-description">{t('settings.dark_mode_desc', { defaultValue: 'Enable dark mode for reduced eye strain' })}</p>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="settings-section">
          <h2>♿ {t('settings.accessibility', { defaultValue: 'Accessibility' })}</h2>
          <div className="setting-item toggle-item">
            <div className="toggle-header">
              <label>{t('settings.voice_output', { defaultValue: 'Voice Output' })}</label>
              <button
                className={`toggle-switch ${settings.voiceEnabled ? 'on' : 'off'}`}
                onClick={() => toggleSetting('voiceEnabled')}
              >
                {settings.voiceEnabled ? t('settings.on') : t('settings.off')}
              </button>
            </div>
            <p className="setting-description">{t('settings.voice_output_desc', { defaultValue: 'Enable text-to-speech for chatbot responses' })}</p>
          </div>

          <div className="setting-item toggle-item">
            <div className="toggle-header">
              <label>{t('settings.notifications', { defaultValue: 'Notifications' })}</label>
              <button
                className={`toggle-switch ${settings.notifications ? 'on' : 'off'}`}
                onClick={() => toggleSetting('notifications')}
              >
                {settings.notifications ? t('settings.on') : t('settings.off')}
              </button>
            </div>
            <p className="setting-description">{t('settings.notifications_desc', { defaultValue: 'Receive notifications about new modules and updates' })}</p>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2>💾 {t('settings.data_management', { defaultValue: 'Data Management' })}</h2>
          <div className="setting-item">
            <label>{t('settings.export_data', { defaultValue: 'Export Your Data' })}</label>
            <p className="setting-description">{t('settings.export_desc', { defaultValue: 'Download a backup of your progress and chat history' })}</p>
            <button className="export-button" onClick={handleDataExport}>
              📥 {t('settings.export_btn', { defaultValue: 'Export Data' })}
            </button>
          </div>

          <div className="setting-item">
            <label>{t('settings.delete_data', { defaultValue: 'Delete All Data' })}</label>
            <p className="setting-description warning">⚠️ {t('settings.delete_warning', { defaultValue: 'This will permanently delete all your data including progress and chat history' })}</p>
            <button className="delete-button" onClick={handleDataDelete}>
              🗑️ {t('settings.delete_btn', { defaultValue: 'Delete All Data' })}
            </button>
          </div>
        </div>

        {/* About & Privacy */}
        <div className="settings-section">
          <h2>ℹ️ {t('settings.information', { defaultValue: 'Information' })}</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>{t('settings.about.title', { defaultValue: 'About This App' })}</h3>
              <p>{t('settings.about.desc', { defaultValue: 'Learn Rights is an AI-powered platform designed to educate women about their legal rights and provide guidance on legal matters.' })}</p>
            </div>
            <div className="info-item">
              <h3>{t('settings.privacy.title', { defaultValue: 'Privacy Policy' })}</h3>
              <p>{t('settings.privacy.desc', { defaultValue: 'Your data is private and secure. We do not share personal information with third parties without your consent.' })}</p>
            </div>
            <div className="info-item">
              <h3>{t('settings.tos.title', { defaultValue: 'Terms of Service' })}</h3>
              <p>{t('settings.tos.desc', { defaultValue: 'By using this platform, you agree to provide accurate information and use the service responsibly.' })}</p>
            </div>
            <div className="info-item">
              <h3>{t('settings.version.title', { defaultValue: 'Version' })}</h3>
              <p>{t('settings.version.desc', { defaultValue: 'Learn Rights v2.5 | Last Updated: March 2026' })}</p>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="settings-section">
          <h2>💬 {t('settings.help', { defaultValue: 'Help & Support' })}</h2>
          <p>{t('settings.help_desc', { defaultValue: 'For technical issues or feedback, please contact us:' })}</p>
          <ul className="contact-list">
            <li>📧 Email: support@learnrights.com</li>
            <li>📱 WhatsApp: +91 XXXX XXXX XX</li>
            <li>🌐 Website: www.learnrights.com</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;

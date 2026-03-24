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
    if (window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <MainLayout>
      <div className="settings-container">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your experience</p>
        </div>

        {/* Language Settings */}
        <div className="settings-section">
          <h2>🌍 Language</h2>
          <div className="setting-item">
            <label>Select your preferred language:</label>
            <div className="language-options">
              {[
                { code: 'en', name: 'English' },
                { code: 'hi', name: 'हिंदी' },
                { code: 'ta', name: 'தமிழ்' },
                { code: 'te', name: 'తెలుగు' },
                { code: 'kn', name: 'ಕನ್ನಡ' },
                { code: 'ml', name: 'മലയാളം' }
              ].map(lang => (
                <button
                  key={lang.code}
                  className={`lang-button ${settings.language === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-section">
          <h2>👁️ Display</h2>
          <div className="setting-item">
            <label>Font Size:</label>
            <div className="font-options">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={`size-button ${settings.fontSize === size ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange(size)}
                  style={{ fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px' }}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item toggle-item">
            <div className="toggle-header">
              <label>Dark Mode</label>
              <button
                className={`toggle-switch ${settings.darkMode ? 'on' : 'off'}`}
                onClick={() => toggleSetting('darkMode')}
              >
                {settings.darkMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="setting-description">Enable dark mode for reduced eye strain</p>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="settings-section">
          <h2>♿ Accessibility</h2>
          <div className="setting-item toggle-item">
            <div className="toggle-header">
              <label>Voice Output</label>
              <button
                className={`toggle-switch ${settings.voiceEnabled ? 'on' : 'off'}`}
                onClick={() => toggleSetting('voiceEnabled')}
              >
                {settings.voiceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="setting-description">Enable text-to-speech for chatbot responses</p>
          </div>

          <div className="setting-item toggle-item">
            <div className="toggle-header">
              <label>Notifications</label>
              <button
                className={`toggle-switch ${settings.notifications ? 'on' : 'off'}`}
                onClick={() => toggleSetting('notifications')}
              >
                {settings.notifications ? 'ON' : 'OFF'}
              </button>
            </div>
            <p className="setting-description">Receive notifications about new modules and updates</p>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2>💾 Data Management</h2>
          <div className="setting-item">
            <label>Export Your Data</label>
            <p className="setting-description">Download a backup of your progress and chat history</p>
            <button className="export-button" onClick={handleDataExport}>
              📥 Export Data
            </button>
          </div>

          <div className="setting-item">
            <label>Delete All Data</label>
            <p className="setting-description warning">⚠️ This will permanently delete all your data including progress and chat history</p>
            <button className="delete-button" onClick={handleDataDelete}>
              🗑️ Delete All Data
            </button>
          </div>
        </div>

        {/* About & Privacy */}
        <div className="settings-section">
          <h2>ℹ️ Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>About This App</h3>
              <p>Learn Rights is an AI-powered platform designed to educate women about their legal rights and provide guidance on legal matters.</p>
            </div>
            <div className="info-item">
              <h3>Privacy Policy</h3>
              <p>Your data is private and secure. We do not share personal information with third parties without your consent.</p>
            </div>
            <div className="info-item">
              <h3>Terms of Service</h3>
              <p>By using this platform, you agree to provide accurate information and use the service responsibly.</p>
            </div>
            <div className="info-item">
              <h3>Version</h3>
              <p>Learn Rights v2.0 | Last Updated: February 2026</p>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="settings-section">
          <h2>💬 Help & Support</h2>
          <p>For technical issues or feedback, please contact us:</p>
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

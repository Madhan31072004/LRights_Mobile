import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import "./Profile.css";

const Profile = () => {
  const { t } = useTranslation();
  const { user, modules, progress, loading } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('personal');

  // Get userId from JWT
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    // For now, we'll just show a message that profile editing is disabled
    // since we're using context data
    setMessage("Profile editing is temporarily disabled. Please use the main profile update feature.");
    setTimeout(() => setMessage(""), 3000);
  };

  // Update profile info - disabled for now
  const handleUpdate = async () => {
    setMessage("Profile editing is temporarily disabled. Please use the main profile update feature.");
    setTimeout(() => setMessage(""), 3000);
  };

  // Upload profile photo - disabled for now
  const handlePhotoUpload = async () => {
    setMessage("Photo upload is temporarily disabled. Please use the main profile update feature.");
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {user.profilePhoto ? (
                <img
                  src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5002'}${user.profilePhoto}`}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-icon">👤</span>
                </div>
              )}
              <div className="avatar-overlay">
                <input
                  type="file"
                  id="photo-upload"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  accept="image/*"
                  className="file-input"
                />
                <label htmlFor="photo-upload" className="upload-button">
                  <span className="upload-icon">📷</span>
                </label>
              </div>
            </div>
            {photoFile && (
              <button
                onClick={handlePhotoUpload}
                className="save-photo-button"
              >
                Save Photo
              </button>
            )}
          </div>

          <div className="profile-info-section">
            <h1 className="profile-name">
              {user.name || t('profile.default_name', { defaultValue: 'Learner' })}
            </h1>
            <p className="profile-email">{user.email || user.mobile}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{user.points || 0}</span>
                <span className="stat-label">{t('profile.points', { defaultValue: 'Points' })}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.completedModules?.length || 0}</span>
                <span className="stat-label">{t('profile.modules', { defaultValue: 'Modules' })}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user.badges?.length || 0}</span>
                <span className="stat-label">{t('profile.badges', { defaultValue: 'Badges' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <span className="tab-icon">👤</span>
          {t('profile.tabs.personal', { defaultValue: 'Personal Info' })}
        </button>
        <button
          className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <span className="tab-icon">📊</span>
          {t('profile.tabs.progress', { defaultValue: 'Progress' })}
        </button>
        <button
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span className="tab-icon">🏆</span>
          {t('profile.tabs.achievements', { defaultValue: 'Achievements' })}
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {message && (
          <div className={`message-banner ${message.includes('success') ? 'success' : 'error'}`}>
            <span className="message-icon">{message.includes('success') ? '✅' : '❌'}</span>
            <span className="message-text">{message}</span>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="personal-info-tab">
            <div className="tab-header">
              <h2>{t('profile.personal_info.title', { defaultValue: 'Personal Information' })}</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`edit-toggle-button ${editMode ? 'editing' : ''}`}
              >
                <span className="edit-icon">{editMode ? '💾' : '✏️'}</span>
                {editMode ? t('profile.save', { defaultValue: 'Save Changes' }) : t('profile.edit', { defaultValue: 'Edit Profile' })}
              </button>
            </div>

            <div className="info-grid">
              <div className="info-field">
                <label className="field-label">
                  <span className="label-icon">👤</span>
                  {t('profile.fields.name', { defaultValue: 'Full Name' })}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={user.name || ""}
                    onChange={handleChange}
                    className="field-input"
                    placeholder={t('profile.placeholders.name', { defaultValue: 'Enter your full name' })}
                  />
                ) : (
                  <div className="field-value">{user.name || t('profile.not_provided', { defaultValue: 'Not provided' })}</div>
                )}
              </div>

              <div className="info-field">
                <label className="field-label">
                  <span className="label-icon">📧</span>
                  {t('profile.fields.email', { defaultValue: 'Email Address' })}
                </label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={user.email || ""}
                    onChange={handleChange}
                    className="field-input"
                    placeholder={t('profile.placeholders.email', { defaultValue: 'Enter your email' })}
                  />
                ) : (
                  <div className="field-value">{user.email || t('profile.not_provided', { defaultValue: 'Not provided' })}</div>
                )}
              </div>

              <div className="info-field">
                <label className="field-label">
                  <span className="label-icon">📱</span>
                  {t('profile.fields.mobile', { defaultValue: 'Mobile Number' })}
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={user.mobile || ""}
                    onChange={handleChange}
                    className="field-input"
                    placeholder={t('profile.placeholders.mobile', { defaultValue: 'Enter your mobile number' })}
                  />
                ) : (
                  <div className="field-value">{user.mobile || t('profile.not_provided', { defaultValue: 'Not provided' })}</div>
                )}
              </div>

              <div className="info-field">
                <label className="field-label">
                  <span className="label-icon">🌐</span>
                  {t('profile.fields.language', { defaultValue: 'Preferred Language' })}
                </label>
                {editMode ? (
                  <select
                    name="preferredLanguage"
                    value={user.preferredLanguage || "en"}
                    onChange={handleChange}
                    className="field-select"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="ta">🇮🇳 Tamil</option>
                  </select>
                ) : (
                  <div className="field-value">
                    {user.preferredLanguage === 'hi' ? '🇮🇳 Hindi' :
                     user.preferredLanguage === 'ta' ? '🇮🇳 Tamil' :
                     '🇺🇸 English'}
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div className="edit-actions">
                <button
                  onClick={handleUpdate}
                  className="action-button primary"
                >
                  <span className="button-icon">💾</span>
                  {t('profile.save_changes', { defaultValue: 'Save Changes' })}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="action-button secondary"
                >
                  <span className="button-icon">❌</span>
                  {t('profile.cancel', { defaultValue: 'Cancel' })}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-tab">
            <h2>{t('profile.progress.title', { defaultValue: 'Learning Progress' })}</h2>
            <div className="progress-overview">
              <div className="progress-card">
                <div className="progress-icon">📚</div>
                <div className="progress-info">
                  <h3>{user.completedModules?.length || 0}</h3>
                  <p>{t('profile.progress.completed_modules', { defaultValue: 'Completed Modules' })}</p>
                </div>
              </div>

              <div className="progress-card">
                <div className="progress-icon">🎯</div>
                <div className="progress-info">
                  <h3>{user.quizzes?.length || 0}</h3>
                  <p>{t('profile.progress.quizzes_taken', { defaultValue: 'Quizzes Taken' })}</p>
                </div>
              </div>

              <div className="progress-card">
                <div className="progress-icon">⭐</div>
                <div className="progress-info">
                  <h3>{user.points || 0}</h3>
                  <p>{t('profile.progress.total_points', { defaultValue: 'Total Points' })}</p>
                </div>
              </div>
            </div>

            {/* Module Progress Section */}
            <div className="module-progress-section">
              <h3>{t('profile.progress.module_progress', { defaultValue: 'Module Progress' })}</h3>
              <div className="module-progress-grid">
                {modules && modules.length > 0 ? (
                  modules.map(module => {
                    const isCompleted = progress.completedModules?.some(id => id.toString() === module._id.toString()) || false;
                    const totalSubTopics = module.topics?.reduce((acc, topic) => acc + (topic.subTopics?.length || 0), 0) || 0;
                    const completedSubTopics = progress.completedSubTopics?.filter(completedId =>
                      module.topics?.some(topic =>
                        topic.subTopics?.some(subTopic => (subTopic._id || subTopic.title) === completedId)
                      )
                    ).length || 0;

                    const progressPercentage = totalSubTopics > 0 ? (completedSubTopics / totalSubTopics) * 100 : 0;
                    const status = isCompleted ? 'completed' : progressPercentage > 0 ? 'in-progress' : 'not-started';
                    const statusColor = status === 'completed' ? '#10b981' : status === 'in-progress' ? '#f59e0b' : '#667eea';

                    return (
                      <div key={module._id} className={`module-progress-card ${status}`}>
                        <div className="module-progress-header">
                          <div className="module-progress-icon" style={{ background: statusColor }}>
                            📖
                          </div>
                          <div className="module-progress-info">
                            <h4>{module.title}</h4>
                            <span className={`module-status ${status}`}>
                              {status === 'completed' ? '✓ Completed' :
                               status === 'in-progress' ? '⏳ In Progress' : '○ Not Started'}
                            </span>
                          </div>
                        </div>

                        <div className="module-progress-bar">
                          <div
                            className="module-progress-fill"
                            style={{
                              width: `${Math.round(progressPercentage)}%`,
                              background: `linear-gradient(90deg, ${statusColor}, ${statusColor}dd)`
                            }}
                          ></div>
                        </div>

                        <div className="module-progress-stats">
                          <span className="progress-text">
                            {completedSubTopics}/{totalSubTopics} {t('profile.progress.subtopics', { defaultValue: 'subtopics' })}
                          </span>
                          <span className="progress-percentage">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-modules-progress">
                    <span className="empty-icon">📚</span>
                    <p>{t('profile.progress.no_modules', { defaultValue: 'No modules available yet.' })}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <h2>{t('profile.achievements.title', { defaultValue: 'Achievements & Badges' })}</h2>
            <div className="achievements-grid">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge, index) => (
                  <div key={index} className="achievement-badge">
                    <div className="badge-icon">🏆</div>
                    <div className="badge-info">
                      <h4>{badge}</h4>
                      <p>{t('profile.achievements.earned', { defaultValue: 'Achievement Earned' })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-achievements">
                  <div className="empty-icon">🎯</div>
                  <h3>{t('profile.achievements.no_badges', { defaultValue: 'No Badges Yet' })}</h3>
                  <p>{t('profile.achievements.keep_learning', { defaultValue: 'Complete modules and quizzes to earn your first badge!' })}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

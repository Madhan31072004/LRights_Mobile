import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import "./Dashboard.css";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, modules, progress, loading } = useUser();
  const [currentQuote, setCurrentQuote] = useState(0);

  const motivationalQuotes = [
    "Knowledge is power. Learn your rights to empower yourself.",
    "Every woman deserves to know her legal rights and protections.",
    "Education is the foundation of freedom and equality.",
    "Your rights are your shield. Know them, use them, protect them.",
    "Empowered women empower communities."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [motivationalQuotes.length]);

  const getCompletedModulesCount = () => {
    return progress.completedModules?.length || 0;
  };

  const getTotalPoints = () => {
    return user.points || 0;
  };

  const getAverageQuizScore = () => {
    if (!user.quizzes || user.quizzes.length === 0) return 0;
    const totalScore = user.quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    return Math.round(totalScore / user.quizzes.length);
  };

  const getUserRank = () => {
    // This would need to be fetched from leaderboard API
    return "Calculating...";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            {t('dashboard.welcome', { defaultValue: 'Welcome back' })}, {user.name || 'Learner'}! 👋
          </h1>
          <p className="welcome-subtitle">
            {t('dashboard.continue_journey', { defaultValue: 'Continue your journey towards legal empowerment' })}
          </p>
        </div>
        <div className="motivational-quote">
          <p>"{motivationalQuotes[currentQuote]}"</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card modules-completed">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{getCompletedModulesCount()}</h3>
            <p>{t('dashboard.modules_completed', { defaultValue: 'Modules Completed' })}</p>
          </div>
        </div>

        <div className="stat-card total-points">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{getTotalPoints()}</h3>
            <p>{t('dashboard.total_points', { defaultValue: 'Total Points' })}</p>
          </div>
        </div>

        <div className="stat-card average-score">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{getAverageQuizScore()}%</h3>
            <p>{t('dashboard.average_score', { defaultValue: 'Average Quiz Score' })}</p>
          </div>
        </div>

        <div className="stat-card user-rank">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{getUserRank()}</h3>
            <p>{t('dashboard.your_rank', { defaultValue: 'Your Rank' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>{t('dashboard.quick_actions', { defaultValue: 'Quick Actions' })}</h2>
        <div className="actions-grid">
          <button
            className="action-button primary"
            onClick={() => navigate('/modules')}
          >
            <span className="action-icon">📖</span>
            <span className="action-text">{t('dashboard.continue_learning', { defaultValue: 'Continue Learning' })}</span>
          </button>

          <button
            className="action-button secondary"
            onClick={() => navigate('/chatbot')}
          >
            <span className="action-icon">💬</span>
            <span className="action-text">{t('dashboard.ask_assistant', { defaultValue: 'Ask Legal Assistant' })}</span>
          </button>

          <button
            className="action-button secondary"
            onClick={() => navigate('/leaderboard')}
          >
            <span className="action-icon">🏅</span>
            <span className="action-text">{t('dashboard.view_leaderboard', { defaultValue: 'View Leaderboard' })}</span>
          </button>

          <button
            className="action-button secondary"
            onClick={() => navigate('/profile')}
          >
            <span className="action-icon">👤</span>
            <span className="action-text">{t('dashboard.update_profile', { defaultValue: 'Update Profile' })}</span>
          </button>
        </div>
      </div>

      {/* Recent Progress */}
      <div className="recent-progress">
        <h2>{t('dashboard.recent_progress', { defaultValue: 'Recent Progress' })}</h2>
        <div className="progress-modules">
          {modules.slice(0, 3).map(module => {
            const isCompleted = progress.completedModules?.some(id => id.toString() === module._id.toString()) || false;
            const totalSubTopics = module.topics?.reduce((acc, topic) => acc + (topic.subTopics?.length || 0), 0) || 0;
            const completedSubTopics = progress.completedSubTopics?.filter(completedId =>
              module.topics?.some(topic =>
                topic.subTopics?.some(subTopic => (subTopic._id || subTopic.title) === completedId)
              )
            ).length || 0;

            const progressPercent = totalSubTopics > 0 ? (completedSubTopics / totalSubTopics) * 100 : 0;
            const status = isCompleted ? 'completed' : progressPercent > 0 ? 'in-progress' : 'not-started';

            return (
              <div key={module._id} className="progress-module-card">
                <div className="module-header">
                  <h4>{module.title}</h4>
                  <span className={`status ${status}`}>
                    {status === 'completed' ? '✓ Completed' :
                     status === 'in-progress' ? '⏳ In Progress' : '○ Not Started'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.round(progressPercent)}%`,
                      background: status === 'completed' ? 'linear-gradient(90deg, #10b981, #059669)' :
                                 status === 'in-progress' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                 'linear-gradient(90deg, #667eea, #7c3aed)'
                    }}
                  ></div>
                </div>
                <p className="progress-text">{Math.round(progressPercent)}% Complete</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2>{t('dashboard.achievements', { defaultValue: 'Achievements' })}</h2>
        <div className="achievements-grid">
          {user.badges && user.badges.length > 0 ? (
            user.badges.map((badge, index) => (
              <div key={index} className="achievement-badge">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">{badge}</span>
              </div>
            ))
          ) : (
            <div className="no-achievements">
              <p>{t('dashboard.no_achievements', { defaultValue: 'Complete modules and quizzes to earn badges!' })}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

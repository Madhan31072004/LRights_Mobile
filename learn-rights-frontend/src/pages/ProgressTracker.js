import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';
import axios from '../api/axios';
import './ProgressTracker.css';

const ProgressTracker = () => {
  const { t } = useTranslation();
  const { user, modules } = useUser();
  const [moduleProgress, setModuleProgress] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    if (modules && user) {
      const progress = modules.map(module => {
        const completed = user.completedModules?.includes(module._id);
        const completedSubTopics = user.completedSubTopics?.length || 0;
        const totalSubTopics = module.topics?.reduce((sum, topic) => sum + topic.subTopics.length, 0) || 0;
        const progressPercent = totalSubTopics > 0 ? (completedSubTopics / totalSubTopics) * 100 : 0;

        const quiz = user.quizzes?.find(q => q.moduleId === module._id);

        return {
          id: module._id,
          title: module.title,
          description: module.description,
          completed,
          completedSubTopics,
          totalSubTopics,
          progressPercent: Math.round(progressPercent),
          quizScore: quiz?.score || 0,
          quizAttempts: quiz?.attempts || 0,
          color: getModuleColor(module.title)
        };
      });

      setModuleProgress(progress);
    }
  }, [modules, user]);

  const getModuleColor = (title) => {
    const colors = {
      "Women's Rights": '#667eea',
      'Labour & Employment Rights': '#764ba2',
      'Safety & Domestic Violence': '#f5576c',
      'Government Schemes': '#f093fb',
      'Property & Legal Rights': '#4facfe'
    };
    return colors[title] || '#667eea';
  };

  const getTotalProgress = () => {
    if (moduleProgress.length === 0) return 0;
    const totalPercent = moduleProgress.reduce((sum, mod) => sum + mod.progressPercent, 0);
    return Math.round(totalPercent / moduleProgress.length);
  };

  const getNextRecommendedModule = () => {
    return moduleProgress.find(mod => !mod.completed && mod.progressPercent > 0) ||
           moduleProgress.find(mod => !mod.completed) ||
           null;
  };

  return (
    <MainLayout>
      <div className="progress-tracker-container">
        <div className="tracker-header">
          <h1>📊 {t('progress.title', { defaultValue: 'Your Learning Progress' })}</h1>
          <p>{t('progress.subtitle', { defaultValue: 'Track your journey through legal rights education' })}</p>
        </div>

        {/* Overall Stats */}
        <div className="overall-stats">
          <div className="stat-item">
            <div className="stat-value">{getTotalProgress()}%</div>
            <div className="stat-label">Overall Progress</div>
            <div className="mini-progress-bar">
              <div 
                className="mini-progress-fill" 
                style={{ width: `${getTotalProgress()}%` }}
              ></div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{moduleProgress.filter(m => m.completed).length}</div>
            <div className="stat-label">Modules Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user?.points || 0}</div>
            <div className="stat-label">Total Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{user?.quizzes?.length || 0}</div>
            <div className="stat-label">Quizzes Passed</div>
          </div>
        </div>

        {/* Recommendation */}
        {getNextRecommendedModule() && (
          <div className="recommendation-card">
            <div className="recommendation-icon">💡</div>
            <div className="recommendation-content">
              <h3>Next Recommended</h3>
              <p>Continue with <strong>{getNextRecommendedModule().title}</strong> to maintain your momentum!</p>
            </div>
            <button className="recommendation-btn">Continue Learning</button>
          </div>
        )}

        {/* Module Progress Cards */}
        <div className="modules-section">
          <h2>Module Progress</h2>
          <div className="modules-list">
            {moduleProgress.map((module, index) => (
              <div key={module.id} className="module-progress-card">
                <div className="module-header">
                  <div className="module-title-section">
                    <span className="module-number">{index + 1}</span>
                    <div>
                      <h3>{module.title}</h3>
                      <p className="module-description">{module.description}</p>
                    </div>
                  </div>
                  {module.completed && <div className="completed-badge">✓ Completed</div>}
                </div>

                <div className="module-content">
                  <div className="progress-section">
                    <div className="progress-label">
                      <span>Lessons Progress</span>
                      <span className="progress-text">{module.completedSubTopics}/{module.totalSubTopics}</span>
                    </div>
                    <div className="progress-bar-full" style={{ borderColor: module.color }}>
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${module.progressPercent}%`,
                          backgroundColor: module.color
                        }}
                      ></div>
                    </div>
                    <div className="progress-percentage">{module.progressPercent}%</div>
                  </div>

                  {module.quizAttempts > 0 && (
                    <div className="quiz-section">
                      <div className="quiz-label">Quiz Results</div>
                      <div className="quiz-stats">
                        <div className="quiz-stat">
                          <span className="label">Score</span>
                          <span className="value">{module.quizScore}%</span>
                        </div>
                        <div className="quiz-stat">
                          <span className="label">Attempts</span>
                          <span className="value">{module.quizAttempts}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="module-actions">
                  <button className="btn-continue">
                    {module.completed ? '📖 Review' : '▶️ Continue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Investment */}
        <div className="time-stats">
          <h2>Your Learning Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <h4>Estimated Time</h4>
              <p className="metric-value">{getTotalProgress() * 0.5} hours</p>
              <p className="metric-desc">Spent learning</p>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <h4>Learning Consistency</h4>
              <p className="metric-value">Daily</p>
              <p className="metric-desc">Keep the streak going!</p>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <h4>Average Score</h4>
              <p className="metric-value">
                {user?.quizzes?.length > 0 
                  ? Math.round(user.quizzes.reduce((sum, q) => sum + q.score, 0) / user.quizzes.length)
                  : 0}%
              </p>
              <p className="metric-desc">Quiz performance</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProgressTracker;

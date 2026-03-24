import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';
import './Achievements.css';

const Achievements = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [badges, setBadges] = useState([]);

  const allBadges = [
    {
      id: 'first_module',
      name: 'First Step',
      description: 'Complete your first learning module',
      icon: '🎓',
      earned: user?.badges?.includes('First Module Completed'),
      requirement: 'Complete 1 module'
    },
    {
      id: 'knowledge_seeker',
      name: 'Knowledge Seeker',
      description: 'Complete 3 learning modules',
      icon: '📚',
      earned: user?.completedModules?.length >= 3,
      requirement: 'Complete 3 modules'
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Pass 5 quizzes with high scores',
      icon: '🎯',
      earned: user?.quizzes?.filter(q => q.score >= 75).length >= 5,
      requirement: 'Pass 5 quizzes (75%+)'
    },
    {
      id: 'legal_expert',
      name: 'Legal Expert',
      description: 'Complete all learning modules',
      icon: '⚖️',
      earned: user?.completedModules?.length >= 5,
      requirement: 'Complete all 5 modules'
    },
    {
      id: 'point_collector',
      name: 'Point Collector',
      description: 'Earn 500 points',
      icon: '⭐',
      earned: user?.points >= 500,
      requirement: 'Earn 500 points'
    },
    {
      id: 'community_leader',
      name: 'Community Leader',
      description: 'Rank in top 10 of leaderboard',
      icon: '👑',
      earned: false, // This would be verified from leaderboard API
      requirement: 'Rank top 10'
    },
    {
      id: 'chatbot_user',
      name: 'AI Assistant',
      description: 'Ask 20 questions to the AI chatbot',
      icon: '🤖',
      earned: false, // Would track from chatbot interactions
      requirement: 'Ask 20 questions'
    },
    {
      id: 'consistent_learner',
      name: 'Consistent Learner',
      description: 'Learn for 7 consecutive days',
      icon: '🔥',
      earned: false, // Would track login streaks
      requirement: '7-day streak'
    }
  ];

  useEffect(() => {
    setBadges(allBadges);
  }, [user]);

  const earnedCount = badges.filter(b => b.earned).length;
  const progressPercentage = (earnedCount / badges.length) * 100;

  return (
    <MainLayout>
      <div className="achievements-container">
        <div className="achievements-header">
          <h1>🏆 {t('achievements.title', { defaultValue: 'Achievements & Badges' })}</h1>
          <p>{t('achievements.subtitle', { defaultValue: 'Earn badges as you progress through your learning journey' })}</p>
        </div>

        <div className="progress-section">
          <div className="progress-info">
            <h3>Your Progress</h3>
            <p className="progress-stat">
              {earnedCount} / {badges.length} Badges Earned
            </p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
        </div>

        <div className="badges-section">
          <h2>All Badges</h2>
          <div className="badges-grid">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
              >
                <div className="badge-icon">
                  {badge.icon}
                  {!badge.earned && <div className="lock-icon">🔒</div>}
                </div>
                <div className="badge-content">
                  <h3>{badge.name}</h3>
                  <p className="badge-description">{badge.description}</p>
                  <p className="badge-requirement">
                    {badge.earned ? '✅ Earned' : `📌 ${badge.requirement}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h4>Modules Completed</h4>
                <p className="stat-value">{user?.completedModules?.length || 0} / 5</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h4>Quizzes Passed</h4>
                <p className="stat-value">{user?.quizzes?.length || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h4>Total Points</h4>
                <p className="stat-value">{user?.points || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h4>Badges Earned</h4>
                <p className="stat-value">{earnedCount} / {badges.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Achievements;

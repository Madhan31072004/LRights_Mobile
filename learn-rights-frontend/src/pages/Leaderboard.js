import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import './Leaderboard.css';

const Leaderboard = () => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/leaderboard');
        // Filter out admin and superadmin roles
        const filtered = response.data.filter(u => u.role !== 'admin' && u.role !== 'superadmin');
        setLeaderboard(filtered);

        // Get current user info from localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userResponse = await axios.get(`/profile/${userId}`);
          setCurrentUser(userResponse.data);
        }
      } catch (err) {
        setError(t('error', { defaultValue: 'Failed to load leaderboard' }));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [t]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getLevel = (points) => {
    if (points >= 500) return { name: 'Master', color: '#8b5cf6' };
    if (points >= 300) return { name: 'Expert', color: '#ef4444' };
    if (points >= 150) return { name: 'Advanced', color: '#f59e0b' };
    if (points >= 50) return { name: 'Intermediate', color: '#10b981' };
    return { name: 'Beginner', color: '#6b7280' };
  };

  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=60`;
  };

  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    const rank = leaderboard.findIndex(user => user._id === currentUser._id) + 1;
    return rank > 0 ? rank : null;
  };

  const getCurrentUserStats = () => {
    if (!currentUser) return null;
    const level = getLevel(currentUser.points || 0);
    const rank = getCurrentUserRank();
    return { level, rank, points: currentUser.points || 0 };
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('leaderboard.loading', { defaultValue: 'Loading leaderboard...' })}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        <span className="error-icon">⚠️</span>
        <h3>{t('leaderboard.error_title', { defaultValue: 'Oops! Something went wrong' })}</h3>
        <p>{error}</p>
      </div>
    );
  }

  const currentUserStats = getCurrentUserStats();

  return (
    <div className="leaderboard-container">
      {/* Header Section */}
      <div className="leaderboard-header">
        <div className="header-content">
          <h1 className="leaderboard-title">
            {t('leaderboard.title', { defaultValue: '🏆 Leaderboard' })}
          </h1>
          <p className="leaderboard-subtitle">
            {t('leaderboard.subtitle', { defaultValue: 'See how you rank among fellow learners and strive for the top!' })}
          </p>

          {/* Current User Stats */}
          {currentUserStats && (
            <div className="current-user-stats">
              <div className="stat-card">
                <span className="stat-icon">🏅</span>
                <div className="stat-info">
                  <span className="stat-label">
                    {t('leaderboard.your_rank', { defaultValue: 'Your Rank' })}
                  </span>
                  <span className="stat-value">
                    #{currentUserStats.rank || t('leaderboard.unranked', { defaultValue: 'Unranked' })}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">⭐</span>
                <div className="stat-info">
                  <span className="stat-label">
                    {t('leaderboard.your_level', { defaultValue: 'Your Level' })}
                  </span>
                  <span className="stat-value">{currentUserStats.level.name}</span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">💎</span>
                <div className="stat-info">
                  <span className="stat-label">
                    {t('leaderboard.your_points', { defaultValue: 'Your Points' })}
                  </span>
                  <span className="stat-value">{currentUserStats.points}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Points Champions Section */}
      <div className="top-points-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">👑</span>
            {t('leaderboard.top_points_title', { defaultValue: 'Points Champions' })}
          </h2>
          <p className="section-subtitle">
            {t('leaderboard.top_points_subtitle', { defaultValue: 'Top learners by total points earned' })}
          </p>
        </div>

        {leaderboard.length > 0 ? (
          <div className="top-points-grid">
            {leaderboard.slice(0, 6).map((user, index) => {
              const rank = index + 1;
              const level = getLevel(user.points || 0);
              const isCurrentUser = currentUser && user._id === currentUser._id;
              const podiumPosition = rank <= 3 ? ['gold', 'silver', 'bronze'][rank - 1] : null;

              return (
                <div
                  key={`top-points-${user._id || index}`}
                  className={`points-champion-card ${podiumPosition ? podiumPosition : ''} ${isCurrentUser ? 'current-user-highlight' : ''}`}
                  style={{ '--delay': `${index * 0.1}s` }}
                >
                  <div className="champion-rank">
                    <span className="rank-number">#{rank}</span>
                    {rank <= 3 && <span className="rank-medal">{getRankIcon(rank)}</span>}
                  </div>

                  <div className="champion-avatar">
                    <div className="avatar-container">
                      <img
                        src={getAvatar(user.name)}
                        alt={user.name}
                        className="champion-avatar-image"
                      />
                      {isCurrentUser && (
                        <div className="current-user-crown">
                          <span>👑</span>
                        </div>
                      )}
                    </div>
                    <div className="champion-level">
                      <span
                        className="level-indicator"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.name}
                      </span>
                    </div>
                  </div>

                  <div className="champion-info">
                    <h4 className="champion-name">{user.name}</h4>
                    <div className="champion-stats">
                      <div className="points-display">
                        <span className="points-icon">💎</span>
                        <span className="points-value">{user.points || 0}</span>
                        <span className="points-label">
                          {t('leaderboard.points', { defaultValue: 'Points' })}
                        </span>
                      </div>
                      <div className="modules-display">
                        <span className="modules-icon">📚</span>
                        <span className="modules-value">{user.completedModules?.length || 0}</span>
                        <span className="modules-label">
                          {t('leaderboard.modules', { defaultValue: 'Modules' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {podiumPosition && (
                    <div className="champion-podium">
                      <div className="podium-base"></div>
                      <div className="podium-pillar"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-champions">
            <span className="empty-champion-icon">🏆</span>
            <h3>{t('leaderboard.no_champions_title', { defaultValue: 'No champions yet' })}</h3>
            <p>{t('leaderboard.no_champions_message', { defaultValue: 'Be the first to earn points and become a champion!' })}</p>
          </div>
        )}
      </div>

      {/* Full Leaderboard Content */}
      <div className="leaderboard-content">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">📊</span>
            {t('leaderboard.full_leaderboard_title', { defaultValue: 'Complete Rankings' })}
          </h2>
          <p className="section-subtitle">
            {t('leaderboard.full_leaderboard_subtitle', { defaultValue: 'See all participants and their progress' })}
          </p>
        </div>

        {leaderboard.length > 0 ? (
          <div className="leaderboard-list">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const level = getLevel(user.points || 0);
              const isTopThree = rank <= 3;
              const isCurrentUser = currentUser && user._id === currentUser._id;

              return (
                <div
                  key={user._id || index}
                  className={`leaderboard-item ${isTopThree ? 'top-three' : ''} ${isCurrentUser ? 'current-user' : ''}`}
                >
                  {/* Rank Badge */}
                  <div className={`rank-badge ${isTopThree ? 'top-three' : ''}`}>
                    {rank <= 3 ? (
                      <span className="rank-icon">{getRankIcon(rank)}</span>
                    ) : (
                      <span className="rank-number">{rank}</span>
                    )}
                  </div>

                  {/* User Avatar */}
                  <div className="user-avatar">
                    <img
                      src={getAvatar(user.name)}
                      alt={user.name}
                      className="avatar-image"
                    />
                    {isCurrentUser && (
                      <div className="current-user-indicator">
                        <span>👤</span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <div className="user-level">
                      <span
                        className="level-badge"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.name}
                      </span>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="user-stats">
                    <div className="stat-item">
                      <span className="stat-icon">💎</span>
                      <span className="stat-value">{user.points || 0}</span>
                      <span className="stat-label">
                        {t('leaderboard.points', { defaultValue: 'Points' })}
                      </span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-icon">📚</span>
                      <span className="stat-value">{user.modulesCompleted || 0}</span>
                      <span className="stat-label">
                        {t('leaderboard.modules', { defaultValue: 'Modules' })}
                      </span>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  {isTopThree && (
                    <div className="achievement-badge">
                      <span className="achievement-icon">🏆</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-leaderboard">
            <span className="empty-icon">🏆</span>
            <h3>{t('leaderboard.no_data_title', { defaultValue: 'No leaderboard data yet' })}</h3>
            <p>{t('leaderboard.no_data_message', { defaultValue: 'Start learning to see your ranking here!' })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

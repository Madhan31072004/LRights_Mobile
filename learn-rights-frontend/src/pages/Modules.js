import React, { useState } from 'react';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import './Modules.css';

const Modules = () => {
  const { t } = useTranslation();
  const { userId, modules, progress, loading, refreshUserData, updateProgressLocally } = useUser();
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedTopic(null);
    setSelectedSubTopic(null);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSelectedSubTopic(null);
  };

  const handleSubTopicSelect = async (subTopic) => {
    setSelectedSubTopic(subTopic);
    // Mark subtopic as completed
    try {
      const subTopicId = subTopic._id || subTopic.title;
      const completeResponse = await axios.post('/progress/complete-subtopic', {
        userId,
        moduleId: selectedModule._id,
        subTopicId
      });
      console.log('Subtopic completion response:', completeResponse.data);

      // Update progress locally for immediate UI feedback
      updateProgressLocally({
        completedSubTopics: [...(progress.completedSubTopics || []), subTopicId],
        completedModules: completeResponse.data.progress.completedModules,
        points: completeResponse.data.progress.points,
        badges: completeResponse.data.progress.badges
      });

      // Refresh all user data to update dashboard and modules
      await refreshUserData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleQuizStart = (module) => {
    // Navigate to quiz page with module ID
    window.location.href = `/quiz?moduleId=${module._id}`;
  };

  const isSubTopicCompleted = (subTopic) => {
    if (!progress.completedSubTopics) return false;
    return progress.completedSubTopics.includes(subTopic._id || subTopic.title);
  };

  const isModuleCompleted = (module) => {
    return progress.completedModules?.some(id => id.toString() === module._id.toString()) || false;
  };

  const getModuleProgress = (module) => {
    // Calculate progress based on actual user progress data
    const totalSubTopics = module.topics?.reduce((acc, topic) => acc + (topic.subTopics?.length || 0), 0) || 0;
    const completedSubTopics = progress.completedSubTopics?.filter(completedId =>
      module.topics?.some(topic =>
        topic.subTopics?.some(subTopic => (subTopic._id || subTopic.title) === completedId)
      )
    ).length || 0;

    const progressPercentage = totalSubTopics > 0 ? (completedSubTopics / totalSubTopics) * 100 : 0;
    return Math.round(progressPercentage);
  };

  const getModuleStatus = (module) => {
    const progressPercent = getModuleProgress(module);
    if (progressPercent === 100) return 'completed';
    if (progressPercent > 0) return 'in-progress';
    return 'not-started';
  };

  const getModuleColor = (module) => {
    const status = getModuleStatus(module);
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#667eea';
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.code.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterStatus) {
      case 'completed': return getModuleStatus(module) === 'completed';
      case 'in-progress': return getModuleStatus(module) === 'in-progress';
      case 'not-started': return getModuleStatus(module) === 'not-started';
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="modules-loading">
        <div className="loading-spinner"></div>
        <p>{t('modules.loading', { defaultValue: 'Loading your learning modules...' })}</p>
      </div>
    );
  }

  // Module selection view
  if (!selectedModule) {
    return (
      <div className="modules-container">
        {/* Header Section */}
        <div className="modules-header">
          <div className="header-content">
            <h1 className="modules-title">
              {t('modules.title', { defaultValue: 'Learning Modules' })}
            </h1>
            <p className="modules-subtitle">
              {t('modules.subtitle', { defaultValue: 'Explore comprehensive legal education modules designed to empower you with knowledge and skills.' })}
            </p>

            {/* Controls */}
            <div className="modules-controls">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('modules.search_placeholder', { defaultValue: 'Search modules...' })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  {t('modules.filters.all', { defaultValue: 'All' })}
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'not-started' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('not-started')}
                >
                  {t('modules.filters.not_started', { defaultValue: 'Not Started' })}
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('in-progress')}
                >
                  {t('modules.filters.in_progress', { defaultValue: 'In Progress' })}
                </button>
                <button
                  className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('completed')}
                >
                  {t('modules.filters.completed', { defaultValue: 'Completed' })}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Content */}
        <div className="modules-content">
          {filteredModules.length > 0 ? (
            <div className="modules-grid">
              {filteredModules.map(module => {
                const progressPercent = getModuleProgress(module);
                const status = getModuleStatus(module);
                const color = getModuleColor(module);

                return (
                  <div
                    key={module._id}
                    className={`module-card ${status}`}
                    style={{ '--module-color': color }}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <div className="module-header">
                      <div
                        className="module-icon"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
                      >
                        📚
                      </div>
                      <span className="module-code">{module.code}</span>
                    </div>

                    <div className="module-content">
                      <h3 className="module-title">{module.title}</h3>
                      <p className="module-description">{module.description}</p>

                      <div className="module-stats">
                        <div className="stat-item">
                          <span className="stat-icon">📖</span>
                          {module.topics?.length || 0} {t('modules.topics', { defaultValue: 'Topics' })}
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">⏱️</span>
                          {module.estimatedHours || 2} {t('modules.hours', { defaultValue: 'Hours' })}
                        </div>
                      </div>

                      <div className="module-progress">
                        <div className="progress-info">
                          <span className="progress-text">
                            {t('modules.progress', { defaultValue: 'Progress' })}
                          </span>
                          <span className="progress-points">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="module-actions">
                      <button className="module-button primary">
                        <span className="button-icon">
                          {status === 'completed' ? '🔄' : '▶️'}
                        </span>
                        {status === 'completed'
                          ? t('modules.review', { defaultValue: 'Review Module' })
                          : t('modules.start', { defaultValue: 'Start Module' })
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-modules">
              <span className="empty-icon">📚</span>
              <h3>{t('modules.no_modules_found', { defaultValue: 'No modules found' })}</h3>
              <p>{t('modules.try_different_search', { defaultValue: 'Try adjusting your search or filter criteria.' })}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Topic selection view
  if (!selectedTopic) {
    return (
      <div className="container">
        <button onClick={() => setSelectedModule(null)}>← Back to Modules</button>
        <h1>{selectedModule.title}</h1>
        <div className="topics-list">
          {selectedModule.topics.map(topic => (
            <div key={topic._id || topic.title} className="topic-card">
              <h3>{topic.title}</h3>
              <button onClick={() => handleTopicSelect(topic)}>View Subtopics</button>
            </div>
          ))}
        </div>
        {isModuleCompleted(selectedModule) && (
          <button onClick={() => handleQuizStart(selectedModule)}>Take Quiz</button>
        )}
      </div>
    );
  }

  // Subtopic view
  if (!selectedSubTopic) {
    return (
      <div className="modules-container">
        {/* Subtopics Header */}
        <div className="subtopics-header">
          <div className="header-content">
            <button
              className="back-button"
              onClick={() => setSelectedTopic(null)}
            >
              <span className="back-icon">←</span>
              {t('modules.back_to_topics', { defaultValue: 'Back to Topics' })}
            </button>

            <div className="topic-info">
              <div className="module-icon-large" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                📖
              </div>
              <div className="topic-details">
                <h1 className="topic-title-large">{selectedTopic.title}</h1>
                <p className="topic-description-large">
                  {selectedTopic.description || t('modules.topic_description', { defaultValue: 'Master the concepts in this topic.' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtopics Grid */}
        <div className="modules-content">
          <div className="subtopics-grid">
            {selectedTopic.subTopics.map((subTopic, index) => {
              const completed = isSubTopicCompleted(subTopic);

              return (
                <div
                  key={subTopic._id || subTopic.title}
                  className={`subtopic-card ${completed ? 'completed' : ''}`}
                  onClick={() => handleSubTopicSelect(subTopic)}
                >
                  <div className="subtopic-header">
                    <div className="subtopic-number">{index + 1}</div>
                    <span className={`subtopic-status ${completed ? 'status-completed' : 'status-pending'}`}>
                      {completed ? '✓' : '○'}
                    </span>
                  </div>

                  <div className="subtopic-content">
                    <h3 className="subtopic-title">{subTopic.title}</h3>
                    <p className="subtopic-preview">
                      {subTopic.content ? subTopic.content.substring(0, 100) + '...' : t('modules.click_to_read', { defaultValue: 'Click to read the content' })}
                    </p>
                  </div>

                  <div className="subtopic-action">
                    <button className="subtopic-button">
                      <span className="button-icon">
                        {completed ? '👁️' : '📖'}
                      </span>
                      {completed
                        ? t('modules.review', { defaultValue: 'Review' })
                        : t('modules.read', { defaultValue: 'Read' })
                      }
                      <span className="button-arrow">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Content view
  return (
    <div className="modules-container">
      {/* Content Header */}
      <div className="content-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => setSelectedSubTopic(null)}
          >
            <span className="back-icon">←</span>
            {t('modules.back_to_subtopics', { defaultValue: 'Back to Subtopics' })}
          </button>

          <div className="content-info">
            <div className="module-icon-large" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              📄
            </div>
            <div className="content-details">
              <h1 className="content-title">{selectedSubTopic.title}</h1>
              <div className="content-meta">
                <span className="content-module">{selectedModule.title}</span>
                <span className="content-topic">{selectedTopic.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="content-card">
          <div className="content-body">
            <div className="content-text">
              {selectedSubTopic.content || t('modules.content_not_available', { defaultValue: 'Content not available yet.' })}
            </div>
          </div>

          <div className="content-actions">
            {isSubTopicCompleted(selectedSubTopic) ? (
              <div className="completion-notice">
                <span className="completion-icon">✅</span>
                <span className="completion-text">
                  {t('modules.already_completed', { defaultValue: 'You have already completed this topic!' })}
                </span>
              </div>
            ) : (
              <button
                className="complete-button"
                onClick={() => handleSubTopicSelect(selectedSubTopic)}
              >
                <span className="button-icon">✅</span>
                {t('modules.mark_completed', { defaultValue: 'Mark as Completed' })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modules;

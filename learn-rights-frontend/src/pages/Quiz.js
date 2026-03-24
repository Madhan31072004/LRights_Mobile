import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import './Quiz.css';

// Make refreshUserData available globally for quiz component
const Quiz = () => {
  const { t } = useTranslation();
  const { refreshUserData, userId } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const timerRef = useRef(null);

  // Check authentication and fetch quiz by moduleId from URL params - generate fresh questions every time
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to take quizzes. Redirecting to login page...');
      window.location.href = '/login';
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('moduleId');
    if (moduleId) {
      const fetchQuiz = async () => {
        try {
          // Add timestamp to force fresh quiz generation
          const timestamp = Date.now();
          const response = await axios.get(`/quizzes/module?moduleId=${moduleId}&t=${timestamp}`);
          if (response.data.length > 0) {
            setCurrentQuiz(response.data[0]);
            console.log('Fresh AI quiz generated:', response.data[0].questions.length, 'questions');
          }
        } catch (error) {
          console.error('Error fetching quiz:', error);
          if (error.response?.status === 403) {
            // Module not completed (100% required)
            alert('You must complete the module 100% before taking the quiz!');
            window.history.back();
          } else if (error.response?.status === 401) {
            // Unauthorized - token expired or invalid
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    } else {
      // Fallback to fetch all quizzes
      const fetchQuizzes = async () => {
        try {
          const response = await axios.get('/quizzes');
          setQuizzes(response.data);
        } catch (error) {
          console.error('Error fetching quizzes:', error);
          if (error.response?.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        } finally {
          setLoading(false);
        }
      };
      fetchQuizzes();
    }
  }, []);

  // Quiz timer
  useEffect(() => {
    if (currentQuiz && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && currentQuiz) {
      submitQuiz();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, currentQuiz]);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setAnswers({});
    setScore(0);
    setTimeLeft(quiz.questions.length * 60); // 1 minute per question
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = (questionId) => {
    // Safe cross-browser SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const question = currentQuiz.questions.find(q => q._id === questionId);
        const matchedOption = question.options.find(opt => opt.toLowerCase().includes(transcript));
        if (matchedOption) {
          handleAnswer(questionId, matchedOption);
        }
      };

      recognition.start();
    } else {
      alert('Voice input not supported in this browser.');
    }
  };

  const submitQuiz = async () => {
    let newScore = 0;
    currentQuiz.questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswer) {
        newScore += question.marks || 10; // Each question is worth 10 marks
      }
    });
    setScore(newScore);
    setTimeLeft(0);

    // Submit score to backend (progress tracking)
    try {
      // Get userId by decoding the JWT token
      const token = localStorage.getItem('token');
      let currentUserId = null;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.userId;
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
        }
      }

      const moduleId = currentQuiz.moduleId;

      console.log('Quiz submission attempt:', {
        userIdFromToken: currentUserId,
        moduleId: moduleId,
        score: newScore,
        totalQuestions: currentQuiz.questions.length
      });

      if (currentUserId && moduleId) {
        console.log('Submitting quiz with:', { userId: currentUserId, moduleId, score: newScore, totalQuestions: currentQuiz.questions.length });

        const response = await axios.post('/progress/submit-quiz', {
          userId: currentUserId,
          moduleId,
          score: newScore,
          totalQuestions: currentQuiz.questions.length
        });
        console.log('Quiz progress saved successfully:', response.data);

        // Refresh user data to update progress across all components
        try {
          await refreshUserData();
          console.log('User data refreshed after quiz submission');
          alert(`Quiz submitted! You scored ${newScore}/${currentQuiz.questions.length * 10} points.`);
        } catch (refreshError) {
          console.error('Error refreshing user data:', refreshError);
          alert('Quiz submitted but failed to refresh data. Please refresh the page.');
        }
      } else {
        console.error('Missing userId or moduleId for quiz submission', { userId: currentUserId, moduleId });
        alert('Error: You must be logged in to submit a quiz. Please log in and try again.');
      }
    } catch (err) {
      console.error('Error saving quiz progress:', err);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const getLevel = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'Expert';
    if (percentage >= 70) return 'Advanced';
    if (percentage >= 50) return 'Intermediate';
    return 'Beginner';
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <div className="loading-spinner"></div>
          <h3>{t('quiz.loading_title', { defaultValue: 'Loading Quiz...' })}</h3>
          <p>{t('quiz.loading_message', { defaultValue: 'Preparing your quiz experience' })}</p>
        </div>
      </div>
    );
  }

  // Current quiz taking view
  if (currentQuiz) {
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = currentQuiz.questions.length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;
    const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

    return (
      <div className="quiz-container">
        {/* Voice Listening Indicator */}
        {isListening && (
          <div className="voice-listening">
            🎤 {t('quiz.listening', { defaultValue: 'Listening for your answer...' })}
          </div>
        )}

        {/* Quiz Header */}
        <div className="quiz-header">
          <h1 className="quiz-title">{currentQuiz.title}</h1>
          <p className="quiz-subtitle">
            {t('quiz.instructions', { defaultValue: 'Answer all questions to complete the quiz' })}
          </p>
        </div>

        {/* Quiz Taking */}
        <div className="quiz-taking">
          {/* Progress Bar */}
          <div className="quiz-progress">
            <div className="quiz-progress-header">
              <h2 className="quiz-current-title">
                {t('quiz.question_progress', {
                  current: answeredQuestions,
                  total: totalQuestions,
                  defaultValue: 'Question {current} of {total}'
                })}
              </h2>
              <div className={`quiz-timer ${timerClass}`}>
                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Questions */}
          <div className="quiz-questions">
            {currentQuiz.questions.map((question, index) => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <span className="question-number">
                    {t('quiz.question_number', { number: index + 1, defaultValue: 'Q{number}' })}
                  </span>
                  <div className="question-actions">
                    <button
                      className="question-btn"
                      onClick={() => speakText(question.question)}
                      title={t('quiz.speak_question', { defaultValue: 'Speak Question' })}
                    >
                      🔊
                    </button>
                    <button
                      className="question-btn"
                      onClick={() => startVoiceInput(question._id)}
                      disabled={isListening}
                      title={t('quiz.voice_input', { defaultValue: 'Voice Input' })}
                    >
                      🎤
                    </button>
                  </div>
                </div>

                <div className="question-text">{question.question}</div>

                <div className="question-options">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${question._id}-option-${optionIndex}`} className="option-item">
                      <input
                        type="radio"
                        id={`${question._id}-${optionIndex}`}
                        name={question._id}
                        value={option}
                        checked={answers[question._id] === option}
                        onChange={() => handleAnswer(question._id, option)}
                        className="option-input"
                      />
                      <label htmlFor={`${question._id}-${optionIndex}`} className="option-label">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Actions */}
          <div className="quiz-actions">
            <button
              className="quiz-submit-btn"
              onClick={submitQuiz}
              disabled={answeredQuestions === 0}
            >
              {t('quiz.submit_quiz', { defaultValue: 'Submit Quiz' })}
            </button>
          </div>

          {/* Quiz Results */}
          {score > 0 && (
            <div className="quiz-results">
              <div className="results-card">
                <div className="results-icon">
                  {score >= currentQuiz.questions.length * 0.8 ? '🎉' :
                   score >= currentQuiz.questions.length * 0.6 ? '👍' : '💪'}
                </div>
                <h2 className="results-title">
                  {t('quiz.quiz_completed', { defaultValue: 'Quiz Completed!' })}
                </h2>
                <div className="results-score">
                  {t('quiz.your_score', { defaultValue: 'Your Score' })}: {score}/{currentQuiz.totalMarks || (currentQuiz.questions.length * 10)}
                </div>
                <div className={`results-level ${getLevel(score, currentQuiz.questions.length).toLowerCase()}`}>
                  {getLevel(score, currentQuiz.questions.length)}
                </div>
                <div className="results-actions">
                  <button
                    className="results-btn primary"
                    onClick={() => window.location.reload()}
                  >
                    {t('quiz.take_again', { defaultValue: 'Take Again' })}
                  </button>
                  <button
                    className="results-btn secondary"
                    onClick={() => window.history.back()}
                  >
                    {t('quiz.back_to_modules', { defaultValue: 'Back to Modules' })}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz selection view
  return (
    <div className="quiz-container">
      {/* Header */}
      <div className="quiz-header">
        <h1 className="quiz-title">
          {t('quiz.title', { defaultValue: '📚 Quizzes' })}
        </h1>
        <p className="quiz-subtitle">
          {t('quiz.subtitle', { defaultValue: 'Test your knowledge and earn points!' })}
        </p>
      </div>

      {/* Quiz Selection */}
      <div className="quiz-selection">
        {quizzes.length > 0 ? (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-card-icon">🧠</div>
                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p className="quiz-card-description">{quiz.description}</p>

                <div className="quiz-card-stats">
                  <div className="stat-item">
                    <span className="stat-value">{quiz.questions?.length || 0}</span>
                    <span className="stat-label">
                      {t('quiz.questions', { defaultValue: 'Questions' })}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{quiz.passMarks || 60}%</span>
                    <span className="stat-label">
                      {t('quiz.pass_mark', { defaultValue: 'Pass Mark' })}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{quiz.totalMarks || quiz.questions?.length || 0}</span>
                    <span className="stat-label">
                      {t('quiz.total_marks', { defaultValue: 'Total Marks' })}
                    </span>
                  </div>
                </div>

                <button
                  className="quiz-start-btn"
                  onClick={() => startQuiz(quiz)}
                >
                  {t('quiz.start_quiz', { defaultValue: 'Start Quiz' })}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="quiz-loading">
            <div className="empty-icon">📝</div>
            <h3>{t('quiz.no_quizzes_title', { defaultValue: 'No Quizzes Available' })}</h3>
            <p>{t('quiz.no_quizzes_message', { defaultValue: 'Complete some modules to unlock quizzes!' })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
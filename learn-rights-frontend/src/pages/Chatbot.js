import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import './Chatbot.css';

const Chatbot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Task definitions for task-oriented chatbot
  const tasks = {
    'file_complaint': {
      name: 'File a Complaint',
      description: 'Get guidance on filing complaints',
      emoji: '📋',
      steps: [
        'Which type of complaint do you need help with? (Police/Court/Organization)',
        'Tell me more details about the incident',
        'Do you have any evidence or witnesses?',
        'Would you like help connecting with legal aid?'
      ]
    },
    'understand_rights': {
      name: 'Understand Your Rights',
      description: 'Learn about specific rights',
      emoji: '⚖️',
      steps: [
        'Which area interests you? (Workplace/Family/Property/Safety)',
        'What specific situation are you in?',
        'Let me provide detailed information',
        'Would you like to know about related laws?'
      ]
    },
    'seek_help': {
      name: 'Seek Help & Support',
      description: 'Find emergency and support services',
      emoji: '🆘',
      steps: [
        'Are you in immediate danger or distress?',
        'What type of help do you need?',
        'Let me connect you with the right services',
        'Do you need emergency contact information?'
      ]
    },
    'government_schemes': {
      name: 'Government Schemes',
      description: 'Learn about benefits you can access',
      emoji: '🏛️',
      steps: [
        'Which scheme interests you?',
        'Tell me your current situation',
        'Let me explain eligibility criteria',
        'How can I help you apply?'
      ]
    },
    'legal_advice': {
      name: 'General Legal Advice',
      description: 'Get information on legal matters',
      emoji: '👨‍⚖️',
      steps: [
        'What legal question do you have?',
        'Provide more context about your situation',
        'Here\'s the relevant legal information',
        'Do you need additional clarification?'
      ]
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history from localStorage
    const history = JSON.parse(localStorage.getItem('chatbotHistory') || '[]');
    setConversationHistory(history);
    setMessages(history);

    // Send welcome message if first time
    if (history.length === 0) {
      const welcomeMessage = {
        text: 'Welcome to Legal Rights Assistant! 👋\n\nI\'m here to help you understand your rights and guide you through legal processes.\n\nHow can I assist you today? Choose from the tasks below or ask me anything!',
        sender: 'bot',
        timestamp: new Date(),
        id: Date.now(),
        isWelcome: true
      };
      setMessages([welcomeMessage]);
      saveHistory([welcomeMessage]);
    }
  }, []);

  const saveHistory = (newMessages) => {
    localStorage.setItem('chatbotHistory', JSON.stringify(newMessages));
    setConversationHistory(newMessages);
  };

  const startTask = (taskId) => {
    setCurrentTask(taskId);
    setTaskProgress({ step: 0 });

    const task = tasks[taskId];
    const systemMessage = {
      text: `Great! Let's help you with: "${task.name}"\n\n${task.steps[0]}`,
      sender: 'bot',
      timestamp: new Date(),
      id: Date.now(),
      isSystemMessage: true
    };

    const updatedMessages = [...messages, systemMessage];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
      id: Date.now()
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveHistory(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Use task-oriented assistant if in a task
      const endpoint = currentTask ? '/ai/task-assistant' : '/ai/chatbot';
      const payload = {
        message: input,
        context: currentTask ? `task: ${currentTask}` : 'human rights education',
        ...(currentTask && {
          taskId: currentTask,
          taskStep: taskProgress.step || 0,
          conversationContext: conversationHistory
        })
      };

      const response = await axios.post(endpoint, payload);
      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        id: Date.now() + 1,
        isTaskResponse: currentTask ? true : false
      };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);

      // Progress task if in a task
      if (currentTask && taskProgress.step < tasks[currentTask].steps.length - 1) {
        const nextStep = taskProgress.step + 1;
        setTaskProgress({ step: nextStep });
      }

      // Voice output for bot response
      speakText(response.data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: t('chatbot.error', { defaultValue: 'Sorry, I couldn\'t process your request. Please try again.' }),
        sender: 'bot',
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*|__/g, ''));
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        inputRef.current?.focus();
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert(t('chatbot.voiceError', { defaultValue: 'Voice input failed. Please try again.' }));
      };

      recognition.start();
    } else {
      alert(t('chatbot.voiceNotSupported', { defaultValue: 'Voice input not supported in this browser.' }));
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setConversationHistory([]);
    setCurrentTask(null);
    setTaskProgress({});
    localStorage.removeItem('chatbotHistory');

    const welcomeMessage = {
      text: 'Chat cleared! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      id: Date.now(),
      isWelcome: true
    };
    setMessages([welcomeMessage]);
    saveHistory([welcomeMessage]);
  };

  const exitTask = () => {
    setCurrentTask(null);
    setTaskProgress({});
    const message = {
      text: 'Task ended. How else can I help you?',
      sender: 'bot',
      timestamp: new Date(),
      id: Date.now()
    };
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    t('chatbot.suggestion1', { defaultValue: 'What are my basic rights?' }),
    t('chatbot.suggestion2', { defaultValue: 'How to file a complaint?' }),
    t('chatbot.suggestion3', { defaultValue: 'Legal aid services?' }),
    t('chatbot.suggestion4', { defaultValue: 'Domestic violence help?' })
  ];

  return (
    <MainLayout>
      <div className="chatbot-container">
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-controls">
            {currentTask && (
              <button className="task-exit-button" onClick={exitTask}>
                ← Exit Task
              </button>
            )}
            <button
              className="clear-chat-button"
              onClick={clearHistory}
              title={t('chatbot.clearChat', { defaultValue: 'Clear Chat History' })}
            >
              🗑️ Clear Chat
            </button>
          </div>
          <h1 className="chatbot-title">
            {t('chatbot.title', { defaultValue: '⚖️ Legal Rights Assistant' })}
          </h1>
          <p className="chatbot-subtitle">
            {currentTask
              ? `Task: ${tasks[currentTask].name} (Step ${taskProgress.step + 1}/${tasks[currentTask].steps.length})`
              : t('chatbot.subtitle', { defaultValue: 'Select a task or ask me anything about legal rights' })}
          </p>
        </div>

        {/* Task Selection (when no task active and few messages) */}
        {!currentTask && messages.length <= 1 && (
          <div className="task-selection">
            <p className="tasks-title">Choose how I can help:</p>
            <div className="tasks-grid">
              {Object.entries(tasks).map(([taskId, task]) => (
                <button
                  key={taskId}
                  className="task-button"
                  onClick={() => startTask(taskId)}
                >
                  <div className="task-emoji">{task.emoji}</div>
                  <div className="task-name">{task.name}</div>
                  <div className="task-desc">{task.description}</div>
                </button>
              ))}
            </div>
            <div className="tasks-divider">OR</div>
            <p className="freeform-text">Ask me any question directly</p>
          </div>
        )}

        {/* Chat Interface */}
        <div className="chat-interface">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-loading">
                <div className="loading-spinner"></div>
                <p>{t('chatbot.loading', { defaultValue: 'Loading conversation...' })}</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender} ${
                      msg.isSystemMessage ? 'system-message' : ''
                    } ${msg.isStepGuide ? 'step-guide' : ''} ${
                      msg.isError ? 'error-message' : ''
                    }`}
                  >
                    <div className="message-avatar">
                      {msg.sender === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <div className="message-bubble">
                        {typeof msg.text === 'string'
                          ? msg.text.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))
                          : msg.text}
                      </div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="typing-indicator">
                    <div className="typing-avatar">
                      🤖
                    </div>
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.placeholder', { defaultValue: 'Ask me about your legal rights...' })}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                className="chat-input"
                rows="1"
              />
              <button
                type="button"
                className={`voice-button ${isListening ? 'listening' : ''}`}
                onClick={startVoiceInput}
                disabled={isListening}
                title={t('chatbot.voice', { defaultValue: 'Voice input' })}
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
            </div>
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isTyping}
            >
              <span>{isTyping ? '⏳' : 'Send'}</span>
              <span>→</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="chatbot-footer">
          <p className="footer-text">
            {t('chatbot.disclaimer', {
              defaultValue: '⚠️ This AI assistant provides general information. For legal advice, consult a qualified attorney.'
            })}
          </p>
          <p className="emergency-text">
            🚨 Emergency? Call <strong>100 (Police)</strong> or <strong>181 (Women\'s Helpline)</strong>
          </p>
        </div>
      </div>

      {isListening && (
        <div className="voice-listening-overlay">
          <div className="voice-listening-card">
            <div className="voice-icon">🎤</div>
            <div className="voice-text">
              {t('chatbot.listening', { defaultValue: 'Listening...' })}
            </div>
            <div className="voice-subtitle">
              {t('chatbot.speakClearly', { defaultValue: 'Speak your question clearly' })}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Chatbot;

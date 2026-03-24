import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  }, []);

  const saveHistory = (newMessages) => {
    localStorage.setItem('chatbotHistory', JSON.stringify(newMessages));
    setConversationHistory(newMessages);
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
      const response = await axios.post('/ai/chatbot', { message: input, context: 'human rights education' });
      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        id: Date.now() + 1
      };
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);

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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setConversationHistory([]);
    localStorage.removeItem('chatbotHistory');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const suggestedQuestions = [
    t('chatbot.suggestion1', { defaultValue: 'What are my basic rights?' }),
    t('chatbot.suggestion2', { defaultValue: 'How to file a complaint?' }),
    t('chatbot.suggestion3', { defaultValue: 'Legal aid services?' }),
    t('chatbot.suggestion4', { defaultValue: 'Domestic violence help?' })
  ];

  return (
    <>
      {/* Chat Widget Toggle Button */}
      <div className="chatbot-widget-toggle" onClick={toggleChat}>
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <div className="chat-icon">
            <span>💬</span>
            <div className="notification-dot"></div>
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="chatbot-widget">
          {/* Header */}
          <div className="chatbot-widget-header">
            <div className="header-info">
              <div className="bot-avatar">🤖</div>
              <div className="bot-info">
                <h3>{t('chatbot.title', { defaultValue: 'AI Legal Assistant' })}</h3>
                <span className="status">● Online</span>
              </div>
            </div>
            <button
              className="clear-chat-button"
              onClick={clearHistory}
              title={t('chatbot.clearChat', { defaultValue: 'Clear Chat History' })}
            >
              🗑️
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chatbot-widget-messages">
            {messages.length === 0 ? (
              <div className="chat-loading">
                <div className="loading-spinner"></div>
                <p>{t('chatbot.loading', { defaultValue: 'Loading conversation...' })}</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      <div className="message-bubble">
                        {msg.text}
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

          {/* Quick Suggestions */}
          {messages.length === 0 && (
            <div className="quick-suggestions">
              <p className="suggestions-title">
                {t('chatbot.tryAsking', { defaultValue: 'Try asking:' })}
              </p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className="suggestion-button"
                  onClick={() => setInput(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form className="chatbot-widget-input" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.placeholder', { defaultValue: 'Ask me about your legal rights...' })}
              onKeyPress={handleKeyPress}
              className="chat-input"
            />
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isTyping}
            >
              {isTyping ? '⏳' : '→'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

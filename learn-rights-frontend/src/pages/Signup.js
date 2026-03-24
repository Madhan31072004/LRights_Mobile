import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signupUser } from "../services/authService";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "en"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch', { defaultValue: 'Passwords do not match' }));
      return false;
    }
    if (form.password.length < 6) {
      setError(t('auth.passwordTooShort', { defaultValue: 'Password must be at least 6 characters' }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const signupData = {
        name: form.name,
        email: form.email,
        password: form.password,
        preferredLanguage: form.preferredLanguage
      };

      await signupUser(signupData);
      alert(t('auth.signupSuccess', { defaultValue: 'Account created successfully!' }));
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.signupFailed', { defaultValue: 'Failed to create account' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو (Urdu)', flag: '🇵🇰' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' }
  ];

  return (
    <div className="signup-container">
      {/* Animated Background */}
      <div className="signup-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
        <div className="bg-shape shape-5"></div>
        <div className="bg-shape shape-6"></div>
      </div>

      {/* Main Content */}
      <div className="signup-content">
        {/* Header */}
        <div className="signup-header">
          <div className="logo-section">
            <div className="logo-icon">📝</div>
            <h1 className="brand-name">Learn Rights</h1>
          </div>
          <p className="signup-subtitle">
            {t('auth.joinCommunity', { defaultValue: 'Join our community of empowered learners' })}
          </p>
        </div>

        {/* Signup Form */}
        <div className="signup-card">
          <div className="card-header">
            <h2 className="card-title">
              {t('auth.createAccount', { defaultValue: 'Create Your Account' })}
            </h2>
            <p className="card-subtitle">
              {t('auth.startJourney', { defaultValue: 'Start your legal education journey today' })}
            </p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                {t('auth.fullName', { defaultValue: 'Full Name' })}
              </label>
              <div className="input-wrapper">
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('auth.enterFullName', { defaultValue: 'Enter your full name' })}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                {t('auth.email', { defaultValue: 'Email Address' })}
              </label>
              <div className="input-wrapper">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('auth.enterEmail', { defaultValue: 'Enter your email address' })}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🌍</span>
                {t('auth.preferredLanguage', { defaultValue: 'Preferred Language' })}
              </label>
              <div className="select-wrapper">
                <select
                  name="preferredLanguage"
                  value={form.preferredLanguage}
                  onChange={handleChange}
                  className="form-select"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                {t('auth.password', { defaultValue: 'Password' })}
              </label>
              <div className="input-wrapper">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('auth.createPassword', { defaultValue: 'Create a strong password' })}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔐</span>
                {t('auth.confirmPassword', { defaultValue: 'Confirm Password' })}
              </label>
              <div className="input-wrapper">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('auth.confirmPassword', { defaultValue: 'Confirm your password' })}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>{t('auth.creatingAccount', { defaultValue: 'Creating Account...' })}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.createAccount', { defaultValue: 'Create Account' })}</span>
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="login-link">
            <p className="login-text">
              {t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?' })}
              <button
                type="button"
                className="login-button"
                onClick={() => navigate("/login")}
              >
                {t('auth.signIn', { defaultValue: 'Sign In' })}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="signup-footer">
          <p className="footer-text">
            {t('auth.agreeToTerms', {
              defaultValue: 'By creating an account, you agree to our Terms of Service and Privacy Policy'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

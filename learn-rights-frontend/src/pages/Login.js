import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginUser, googleLoginUser } from "../services/authService";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser(form);
      console.log("Login successful, token:", res.token);
      localStorage.setItem("token", res.token);
      navigate("/home");
    } catch (err) {
      console.error(err.message);
      setError(err.message || t("login.failed", { defaultValue: "Login failed. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Elements */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Login Form */}
      <div className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">⚖️</div>
              <h1 className="app-title">
                {t("app.name", { defaultValue: "Learn Rights" })}
              </h1>
            </div>
            <h2 className="login-title">
              {t("login.welcome_back", { defaultValue: "Welcome Back" })}
            </h2>
            <p className="login-subtitle">
              {t("login.sign_in_continue", { defaultValue: "Sign in to continue your learning journey" })}
            </p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="input-group">
              <label className="input-label">
                {t("login.email", { defaultValue: "Email Address" })}
              </label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder={t("login.email_placeholder", { defaultValue: "Enter your email" })}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label className="input-label">
                {t("login.password", { defaultValue: "Password" })}
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder={t("login.password_placeholder", { defaultValue: "Enter your password" })}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkmark"></span>
                {t("login.remember_me", { defaultValue: "Remember me" })}
              </label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => navigate("/forgot-password")}
              >
                {t("login.forgot_password", { defaultValue: "Forgot Password?" })}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  {t("login.signing_in", { defaultValue: "Signing In..." })}
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  {t("login.sign_in", { defaultValue: "Sign In" })}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">
              {t("login.or", { defaultValue: "or" })}
            </span>
          </div>

          {/* Social Login Options */}
          <GoogleLoginButton 
            setLoading={setLoading} 
            setError={setError} 
            navigate={navigate} 
            t={t}
          />

          {/* Sign Up Link */}
          <div className="signup-section">
            <p className="signup-text">
              {t("login.no_account", { defaultValue: "Don't have an account?" })}
              <button
                type="button"
                className="signup-link"
                onClick={() => navigate("/signup")}
              >
                {t("login.sign_up", { defaultValue: "Sign Up" })}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            {t("login.footer", { defaultValue: "By signing in, you agree to our Terms of Service and Privacy Policy" })}
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleLoginButton = ({ setLoading, setError, navigate, t }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await googleLoginUser(tokenResponse.access_token);
        localStorage.setItem("token", res.token);
        navigate("/home");
      } catch (err) {
        setError(err.message || "Google Login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google Login failed"),
  });

  return (
    <div className="social-login">
      <button 
        className="social-button google" 
        onClick={() => login()}
        type="button"
      >
        <span className="social-icon">🌐</span>
        {t("login.continue_google", { defaultValue: "Continue with Google" })}
      </button>
    </div>
  );
};

export default Login;

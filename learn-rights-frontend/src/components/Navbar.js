import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/home">⚖️ LearnRights</Link>
        </div>

        <button 
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          {token && (
            <>
              <li><Link to="/home" onClick={() => setMobileMenuOpen(false)}>🏠 Home</Link></li>
              <li><Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>📊 Dashboard</Link></li>
              <li><Link to="/modules" onClick={() => setMobileMenuOpen(false)}>📚 Modules</Link></li>
              <li><Link to="/chatbot" onClick={() => setMobileMenuOpen(false)}>🤖 AI Assistant</Link></li>
              <li><Link to="/progress" onClick={() => setMobileMenuOpen(false)}>📈 Progress</Link></li>
              <li><Link to="/achievements" onClick={() => setMobileMenuOpen(false)}>🏆 Achievements</Link></li>
              <li><Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)}>⭐ Leaderboard</Link></li>
              <li><Link to="/emergency-help" onClick={() => setMobileMenuOpen(false)}>🆘 Help</Link></li>
              <li><Link to="/resources" onClick={() => setMobileMenuOpen(false)}>📖 Resources</Link></li>
              <li className="dropdown">
                <button 
                  className="dropdown-btn"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  👤 Account ▼
                </button>
                {dropdownOpen && (
                  <div 
                    className="dropdown-menu"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <Link to="/profile" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>👤 Profile</Link>
                    <Link to="/settings" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>⚙️ Settings</Link>
                    <button onClick={logout} className="logout-btn">🚪 Logout</button>
                  </div>
                )}
              </li>
            </>
          )}
          {!token && (
            <>
              <li><Link to="/home" onClick={() => setMobileMenuOpen(false)}>🏠 Home</Link></li>
              <li><Link to="/login" onClick={() => setMobileMenuOpen(false)}>🔐 Login</Link></li>
              <li><Link to="/signup" onClick={() => setMobileMenuOpen(false)}>📝 Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

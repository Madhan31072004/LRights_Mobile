import React, { useState, useEffect } from "react";
import API from "../api/axios";
import MainLayout from "../layouts/MainLayout";
import { useTranslation } from "react-i18next";
import "./Users.css";

function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || t("users.fetchError", { defaultValue: "Failed to fetch users" }));
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [t]);

  const filteredUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy]?.toLowerCase() || "";
      const bValue = b[sortBy]?.toLowerCase() || "";
      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="users-loading">
          <div className="loading-spinner"></div>
          <p>{t("users.loading", { defaultValue: "Loading users..." })}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="users-container">
        {/* Header */}
        <div className="users-header">
          <div className="header-content">
            <div className="header-icon">👥</div>
            <div className="header-text">
              <h1 className="users-title">
                {t("users.title", { defaultValue: "User Management" })}
              </h1>
              <p className="users-subtitle">
                {t("users.subtitle", { defaultValue: "View and manage all platform users" })}
              </p>
            </div>
          </div>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">
                {t("users.totalUsers", { defaultValue: "Total Users" })}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="users-controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder={t("users.searchPlaceholder", { defaultValue: "Search users by name or email..." })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sort-controls">
            <span className="sort-label">
              {t("users.sortBy", { defaultValue: "Sort by:" })}
            </span>
            <button
              className={`sort-button ${sortBy === "name" ? "active" : ""}`}
              onClick={() => handleSort("name")}
            >
              {t("users.name", { defaultValue: "Name" })}
              {sortBy === "name" && (
                <span className="sort-arrow">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
            <button
              className={`sort-button ${sortBy === "email" ? "active" : ""}`}
              onClick={() => handleSort("email")}
            >
              {t("users.email", { defaultValue: "Email" })}
              {sortBy === "email" && (
                <span className="sort-arrow">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
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

        {/* Users Grid/List */}
        <div className="users-content">
          {filteredUsers.length === 0 ? (
            <div className="no-users">
              <div className="no-users-icon">👤</div>
              <h3 className="no-users-title">
                {t("users.noUsers", { defaultValue: "No users found" })}
              </h3>
              <p className="no-users-text">
                {searchTerm
                  ? t("users.noSearchResults", { defaultValue: "Try adjusting your search criteria" })
                  : t("users.noUsersText", { defaultValue: "No users have registered yet" })
                }
              </p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-avatar">
                    <span className="avatar-text">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    <div className="user-details">
                      <span className="user-language">
                        🌍 {user.preferredLanguage || "en"}
                      </span>
                      <span className="user-points">
                        ⭐ {user.points || 0} {t("users.points", { defaultValue: "points" })}
                      </span>
                    </div>
                    <div className="user-meta">
                      <span className="user-joined">
                        {t("users.joined", { defaultValue: "Joined" })} {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="users-footer">
          <p className="footer-text">
            {t("users.footer", {
              defaultValue: "Showing {count} of {total} users",
              count: filteredUsers.length,
              total: users.length
            })}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default Users;

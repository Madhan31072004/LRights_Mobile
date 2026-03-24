import React from "react";
import { Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import LanguageSelect from "../pages/LanguageSelect";
import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import Modules from "../pages/Modules";
import Quiz from "../pages/Quiz";
import Chatbot from "../pages/Chatbot";
import Leaderboard from "../pages/Leaderboard";
import AdminDashboard from "../pages/AdminDashboard";
import Resources from "../pages/Resources";
import Settings from "../pages/Settings";
import Achievements from "../pages/Achievements";
import ProgressTracker from "../pages/ProgressTracker";
import EmergencyHelp from "../pages/EmergencyHelp";
import PrivateRoute from "../components/PrivateRoute";
import AdminRoute from "../components/AdminRoute";
import HomeRoute from "../components/HomeRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/language" element={<LanguageSelect />} />
    <Route path="/home" element={<HomeRoute><Home /></HomeRoute>} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
    <Route path="/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
    <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
    <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
    <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
    <Route path="/resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
    <Route path="/achievements" element={<PrivateRoute><Achievements /></PrivateRoute>} />
    <Route path="/progress" element={<PrivateRoute><ProgressTracker /></PrivateRoute>} />
    <Route path="/emergency-help" element={<PrivateRoute><EmergencyHelp /></PrivateRoute>} />
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
  </Routes>
);

export default AppRoutes;

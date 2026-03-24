import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="logo">LearnRights</h2>

      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/modules">Modules</NavLink>
        <NavLink to="/quiz">Quiz</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/chatbot">Chatbot</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [newModule, setNewModule] = useState({ title: '', description: '', content: '', language: '', category: '', difficulty: '', points: 0 });
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', questions: [] });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchReports();
    fetchModules();
    fetchQuizzes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('/admin/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const createModule = async () => {
    try {
      await axios.post('/modules', newModule);
      setNewModule({ title: '', description: '', content: '', language: '', category: '', difficulty: '', points: 0 });
      fetchModules();
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const createQuiz = async () => {
    try {
      await axios.post('/quizzes', newQuiz);
      setNewQuiz({ title: '', description: '', questions: [] });
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const generateReport = () => {
    // Simple report generation
    const report = {
      totalUsers: stats.totalUsers,
      totalModules: stats.totalModules,
      totalQuizzes: quizzes.length,
      generatedAt: new Date()
    };
    console.log('Report:', report);
    alert('Report generated and logged to console');
  };

  return (
    <div className="admin-dashboard">
      <h1>{t('admin.title')}</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>{t('admin.totalUsers')}</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>{t('admin.totalModules')}</h3>
          <p>{stats.totalModules}</p>
        </div>
        <div className="stat-card">
          <h3>{t('admin.completedModules')}</h3>
          <p>{stats.completedModules}</p>
        </div>
      </div>
      <div className="users-list">
        <h2>{t('admin.users')}</h2>
        <table>
          <thead>
            <tr>
              <th>{t('admin.name')}</th>
              <th>{t('admin.email')}</th>
              <th>{t('admin.points')}</th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.points}</td>
                <td>
                  <button onClick={() => deleteUser(user._id)}>{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="create-module">
        <h2>{t('admin.createModule')}</h2>
        <input placeholder="Title" value={newModule.title} onChange={(e) => setNewModule({...newModule, title: e.target.value})} />
        <input placeholder="Description" value={newModule.description} onChange={(e) => setNewModule({...newModule, description: e.target.value})} />
        <textarea placeholder="Content" value={newModule.content} onChange={(e) => setNewModule({...newModule, content: e.target.value})} />
        <input placeholder="Language" value={newModule.language} onChange={(e) => setNewModule({...newModule, language: e.target.value})} />
        <input placeholder="Category" value={newModule.category} onChange={(e) => setNewModule({...newModule, category: e.target.value})} />
        <input placeholder="Difficulty" value={newModule.difficulty} onChange={(e) => setNewModule({...newModule, difficulty: e.target.value})} />
        <input type="number" placeholder="Points" value={newModule.points} onChange={(e) => setNewModule({...newModule, points: parseInt(e.target.value)})} />
        <button onClick={createModule}>{t('create')}</button>
      </div>
      <div className="create-quiz">
        <h2>{t('admin.createQuiz')}</h2>
        <input placeholder="Title" value={newQuiz.title} onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})} />
        <input placeholder="Description" value={newQuiz.description} onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})} />
        <button onClick={createQuiz}>{t('create')}</button>
      </div>
      <div className="reports">
        <h2>{t('admin.reports')}</h2>
        <button onClick={generateReport}>{t('admin.generateReport')}</button>
        {/* Display reports */}
      </div>
    </div>
  );
};

export default AdminDashboard;

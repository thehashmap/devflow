import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Simple Login Component
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple mock login - in real app, this would call backend
    if (formData.username && formData.password) {
      onLogin({ username: formData.username, id: 1 });
    } else {
      alert('Please enter username and password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>DevFlow - Code Quality Platform</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button type="submit">Login</button>
        </form>
        <p>Demo: Use any username/password to login </p>
        <p>(Real application to roll out soon!)</p>
      </div>
    </div>
  );
};

// Simple Dashboard Component
const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalAnalyses: 24,
    pendingAnalyses: 3,
    avgQualityScore: 8.2,
    criticalIssues: 12
  });

  return (
    <div className="dashboard">
      <h2>Welcome, {user.username}!</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Analyses</h3>
          <p className="stat-number">{stats.totalAnalyses}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pendingAnalyses}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Quality Score</h3>
          <p className="stat-number">{stats.avgQualityScore}/10</p>
        </div>
        <div className="stat-card">
          <h3>Critical Issues</h3>
          <p className="stat-number">{stats.criticalIssues}</p>
        </div>
      </div>

      <div className="recent-analyses">
        <h3>Recent Analyses</h3>
        <div className="analysis-list">
          <div className="analysis-item">
            <span>user-service.java</span>
            <span className="status completed">Completed</span>
            <span>Score: 9.1</span>
          </div>
          <div className="analysis-item">
            <span>auth-controller.java</span>
            <span className="status pending">Analyzing...</span>
            <span>-</span>
          </div>
          <div className="analysis-item">
            <span>report-generator.java</span>
            <span className="status completed">Completed</span>
            <span>Score: 7.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Upload Component
const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    // Simulate upload and analysis
    setTimeout(() => {
      setResult({
        filename: file.name,
        score: Math.floor(Math.random() * 4) + 7, // Score between 7-10
        issues: Math.floor(Math.random() * 10) + 1,
        suggestions: [
          'Consider adding more comments',
          'Extract method for better readability',
          'Add error handling'
        ]
      });
      setUploading(false);
    }, 3000);
  };

  return (
    <div className="upload-container">
      <h2>Upload Code for Analysis</h2>

      <div className="upload-area">
        <input type="file" onChange={handleFileChange} accept=".java,.js,.py,.cpp" />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Analyzing...' : 'Upload & Analyze'}
        </button>
      </div>

      {uploading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>AI is analyzing your code...</p>
        </div>
      )}

      {result && (
        <div className="result-card">
          <h3>Analysis Results for {result.filename}</h3>
          <div className="result-stats">
            <div>Quality Score: <span className="score">{result.score}/10</span></div>
            <div>Issues Found: <span className="issues">{result.issues}</span></div>
          </div>
          <div className="suggestions">
            <h4>Suggestions:</h4>
            <ul>
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Analyses List Component
const Analyses = () => {
  const [analyses] = useState([
    { id: 1, filename: 'UserService.java', status: 'completed', score: 9.1, date: '2024-01-15' },
    { id: 2, filename: 'AuthController.java', status: 'pending', score: null, date: '2024-01-15' },
    { id: 3, filename: 'ReportGenerator.java', status: 'completed', score: 7.8, date: '2024-01-14' },
    { id: 4, filename: 'DataProcessor.java', status: 'failed', score: null, date: '2024-01-14' },
    { id: 5, filename: 'ApiGateway.java', status: 'completed', score: 8.5, date: '2024-01-13' }
  ]);

  return (
    <div className="analyses-container">
      <h2>All Analyses</h2>

      <div className="analyses-table">
        <div className="table-header">
          <span>File</span>
          <span>Status</span>
          <span>Score</span>
          <span>Date</span>
        </div>

        {analyses.map(analysis => (
          <div key={analysis.id} className="table-row">
            <span>{analysis.filename}</span>
//            <span className={`status ${analysis.status}`}>
//              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
//            </span>
//            <span>{analysis.score ? `${analysis.score}/10` : '-'}</span>
            <span>{analysis.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Navigation Component
const Navigation = ({ user, onLogout }) => (
  <nav className="navbar">
    <div className="nav-brand">
      <h1>DevFlow</h1>
    </div>
    <div className="nav-links">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/analyses">Analyses</Link>
      <button onClick={onLogout} className="logout-btn">Logout ({user.username})</button>
    </div>
  </nav>
);

// Main App Component
function App() {
  const [user, setUser] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('devflow-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('devflow-user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('devflow-user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <Navigation user={user} onLogout={handleLogout} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analyses" element={<Analyses />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
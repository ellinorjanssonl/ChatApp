import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import Login from './components/Login';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Register from './components/Register';
import FetchCsrfToken from './components/FetchCsrfToken';
import './index.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  return (
    <div>
      <FetchCsrfToken setCsrfToken={setCsrfToken} />
      <Router>
        <SideNav token={token} setToken={setToken} />
        <Routes>
          <Route path="/" element={<Register csrfToken={csrfToken} />} />
          <Route path="/login" element={<Login setToken={setToken} setUserId={setUserId} csrfToken={csrfToken} />} />
          {token ? (
            <>
              <Route path="/chat" element={<Chat token={token} userId={userId} />} />
              <Route path="/profile" element={<Profile token={token} setToken={setToken} />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Router>
    </div>
  );
};

export default App;

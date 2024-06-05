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
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div>
      <FetchCsrfToken setCsrfToken={setCsrfToken} />
      <Router>
        <SideNav token={token} setToken={setToken} />
        <Routes>
          <Route path="/" element={<Register csrfToken={csrfToken} />} />
          <Route path="/login" element={<Login setToken={setToken} csrfToken={csrfToken} />} />
          {token ? (
            <>
              <Route path="/chat" element={<Chat token={token} />} />
              <Route path="/profile" element={<Profile token={token} csrfToken={csrfToken} />} />
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

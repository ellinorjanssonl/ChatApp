import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './Css/Login.css';

const Login = ({ setToken, setUserId, csrfToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const message = location.state?.message || '';
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with', { username, password, csrfToken });
    fetch('https://chatify-api.up.railway.app/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        csrfToken, 
      }),
   
    })
    .then(res => res.json())
    .then(data => {
      const { token } = data;
      const decodedToken = parseJwt(token);
      const { id: userId, user, avatar, email, invite } = decodedToken;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', user);
      localStorage.setItem('avatar', avatar);
      localStorage.setItem('email', email);
      localStorage.setItem('invite', invite);
      setToken(token);
      setUserId(userId);
      setSuccess('Login successful');
      setError('');

      setTimeout(() => {
        navigate('/profile');
      }, 1000); 
    })
    .catch(err => {
      console.error('Failed to login:', err);
      setError('Invalid credentials');
      setSuccess('');
    });
  };

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }

  return (
    <div className="container">
      <div className="login-form">
        <h1>LOGIN</h1>
        {message && <p className="success">{message}</p>} 
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleLogin}>
          <label>
            <input type="text" placeholder='Username 🙂' value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label>
            <input type="password" placeholder='Password 🔒' value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button type="submit">Login</button>
        </form>
      </div>
      
    </div>
  );
}

export default Login;

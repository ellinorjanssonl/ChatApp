import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken, csrfToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with', { username, password, csrfToken });
    fetch('https://chatify-api.up.railway.app/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        csrfToken 
      })
    })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    })
    .then(data => {
      const { token } = data;
      const decodedToken = parseJwt(token);
      const { id: userId, user, avatar, email } = decodedToken;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', user);
      localStorage.setItem('avatar', avatar);
      localStorage.setItem('email', email);
      setToken(token);
      setSuccess('Login successful');
      setError('');

      // Navigate to profile after a delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000); // 2 seconds delay
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
    <div>
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <label>
          Username:
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;

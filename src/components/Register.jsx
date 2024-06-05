import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ csrfToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const avatars = [
      'https://i.pravatar.cc/200?img=1',
      'https://i.pravatar.cc/200?img=2',
      'https://i.pravatar.cc/200?img=3',
      'https://i.pravatar.cc/200?img=4',
      'https://i.pravatar.cc/200?img=5',
      'https://i.pravatar.cc/200?img=6',
      'https://i.pravatar.cc/200?img=7',
      'https://i.pravatar.cc/200?img=8',
    ];
    setImages(avatars);
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    const payload = {
      username,
      password,
      email,
      avatar,
      csrfToken
    };

    fetch('https://chatify-api.up.railway.app/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registered successfully', data);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('avatar', avatar);
      navigate('/login'); // Redirect to login page after successful registration
    })
    .catch(err => setError(err.message));
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form id="register" onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="avatar"
              width="100"
              height="100"
              onClick={() => setAvatar(image)}
              style={{ cursor: 'pointer', border: avatar === image ? '2px solid blue' : 'none' }}
            />
          ))}
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;

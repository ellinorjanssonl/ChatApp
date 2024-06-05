import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ csrfToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // When the component mounts, set initial images
    setImages(getRandomAvatars());
  }, []);

  const getRandomAvatars = () => {
    let randomAvatars = [];
    while (randomAvatars.length < 10) {
      const randomId = Math.floor(Math.random() * 70) + 1; // Generate random ID between 1 and 70
      const avatarUrl = `https://i.pravatar.cc/200?img=${randomId}`;
      if (!randomAvatars.includes(avatarUrl)) {
        randomAvatars.push(avatarUrl);
      }
    }
    return randomAvatars;
  };

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

  const handleChooseAvatar = () => {
    setImages(getRandomAvatars());
    setShowAvatarPicker(true);
  };

  const handleAvatarClick = (image) => {
    setAvatar(image);
    setShowAvatarPicker(false);
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
          <button type="button" onClick={handleChooseAvatar}>Choose Avatar</button>
          {showAvatarPicker && (
            <div>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="avatar"
                  width="100"
                  height="100"
                  onClick={() => handleAvatarClick(image)}
                  style={{ cursor: 'pointer', border: avatar === image ? '2px solid blue' : 'none' }}
                />
              ))}
            </div>
          )}
        </div>
        <button type="submit">Register</button>
      </form>
      {avatar && (
        <div>
          <h3>Selected Avatar:</h3>
          <img src={avatar} alt="Selected avatar" width="100" height="100" />
        </div>
      )}
    </div>
  );
};

export default Register;

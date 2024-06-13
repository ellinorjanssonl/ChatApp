import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from "@sentry/react";
import './Css/Register.css';

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
        throw new Error(data.message || 'username or email already exists');
        
      }

      console.log('Registered successfully', data);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('avatar', avatar);
      navigate('/login'); 
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
    <div className="container">
      <div className="register-form">
        <h1>REGISTER</h1>
        {error && <p className="error">{error}</p>}
        <form id="register" onSubmit={handleRegister}>
          <label>
            <input type="text" placeholder='Username 🙂' value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            <input type="password" placeholder='Password 🔒' value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            <input type="email" placeholder='Email ✉️' value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button  className="buttonavatar" type="button" onClick={handleChooseAvatar}>Choose Avatar</button>
          {showAvatarPicker && (
            <div className="avatar-picker">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="avatar"
                  width="90"
                  height="90"
                  onClick={() => handleAvatarClick(image)}
                  className={avatar === image ? 'selected' : ''}
                />
              ))}
            </div>
           
          )}
          {avatar && (
          <div>
            <h3>Selected Avatar:</h3>
            <img className='selectedavatar' src={avatar} alt="Selected avatar" width="200" height="200" />
          </div>
        )}
           <br />
          <button className='buttonsubmit' type="submit">Register</button>
        </form>
        
      </div>
    </div>
  );
};

export default Register;

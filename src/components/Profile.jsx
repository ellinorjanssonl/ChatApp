import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Css/Profile.css';

const Profile = ({ token, setToken }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [avatars, setAvatars] = useState([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  
  useEffect(() => {
    if (!token || !userId) {
      console.log('Missing token or userId:', { token, userId });
      setError('Missing Auth token or User ID');
      return;
    }

    console.log('Fetching user data with token and userId:', { token, userId });

    const fetchUserData = async () => {
      try {
        const res = await fetch(`https://chatify-api.up.railway.app/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await res.json();
        console.log('Fetched user data:', data);
        setUser(data[0]); 
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [token, userId]);

  const getRandomAvatars = () => {
    let randomAvatars = [];
    while (randomAvatars.length < 10) {
      const randomId = Math.floor(Math.random() * 70) + 1; 
      const avatarUrl = `https://i.pravatar.cc/200?img=${randomId}`;
      if (!randomAvatars.includes(avatarUrl)) {
        randomAvatars.push(avatarUrl);
      }
    }
    return randomAvatars;
  };

  const handleChooseAvatar = () => {
    setAvatars(getRandomAvatars());
    setShowAvatarPicker(true);
  };

  const handleAvatarClick = (image) => {
    setNewAvatar(image);
    setShowAvatarPicker(false);
  };

  const handleDelete = async () => {
    try {
      console.log('Attempting to delete user with:', { token, userId });

      const res = await fetch(`https://chatify-api.up.railway.app/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      console.log('User deleted successfully');
      setToken(''); 
      navigate('/login'); 
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const handleUserUpdate = async (updatedData) => {
    try {
      const res = await fetch(`https://chatify-api.up.railway.app/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          updatedData,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to update user');
      }

      console.log('User updated successfully');
      const data = await res.json();
      setUser((prevUser) => ({ ...prevUser, ...updatedData })); 
     
      setNewAvatar('');
      setNewUsername('');
      setNewEmail('');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Failed to update user: ${err.message}`);
    }
  };

  const handleUpdateAvatar = () => handleUserUpdate({ avatar: newAvatar });
  const handleUpdateUsername = () => handleUserUpdate({ username: newUsername });
  const handleUpdateEmail = () => handleUserUpdate({ email: newEmail });

  if (error) {
    return <p className="error-message">{error}</p>;
  }


  return (
    <div className="profile-container">
      <div className="profile-info">
        <div className="profile-header">
          {user ? (
            <>
              <img src={user.avatar} alt="avatar" />
              <h1>{user.username}</h1>
              <p>{user.email}</p>
            </>
          ) : (
            <div className="spinner">
            </div> 
          )}
        </div>
        {user && (
          <div className="profile-form">
            <button className="buttonavatars" onClick={handleChooseAvatar}>
              Choose New Avatar
            </button>
            {showAvatarPicker && (
              <div className="avatar-picker">
                {avatars.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="avatar"
                    onClick={() => handleAvatarClick(image)}
                    className={newAvatar === image ? 'selected' : ''}
                  />
                ))}
              </div>
            )}
            {newAvatar && (
              <div>
                <h3>Selected new avatar:</h3>
                <img src={newAvatar} className='new-avatars' alt="New avatar"/>
                <button className="uppdatebutton" onClick={handleUpdateAvatar}>
                  Update Avatar!
                </button>
              </div>
            )}
            <input
              type="text"
              placeholder="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <button className="uppdatebutton" onClick={handleUpdateUsername}>
              Update Username
            </button>
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button className="uppdatebutton" onClick={handleUpdateEmail}>
              Update Email
            </button>
            <button className="delete-button" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm">
          <div className="modal">
          <p>Are you sure you want to delete this user?</p>
          <button onClick={handleDelete} className="confirm-button">Yes</button>
          <button onClick={() => setShowDeleteConfirm(false)} className="cancel-button">No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

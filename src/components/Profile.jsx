import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Css/Profile.css';
import FetchAvatars from './FetchAvatar';

const Profile = ({ csrfToken, token, setToken }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!csrfToken) {
      console.log('Waiting for CSRF token...');
      return;
    }

    if (!token || !userId) {
      console.log('Missing token or userId:', { token, userId });
      setError('Missing Auth token or User ID');
      return;
    }

    console.log('Fetching user data with:', { csrfToken, token, userId });

    const fetchUserData = async () => {
      try {
        const res = await fetch(`https://chatify-api.up.railway.app/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await res.json();
        console.log('Fetched user data:', data);
        setUser(data[0]);  // Set user to the first element of the array
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [csrfToken, token, userId]);

  const handleDelete = async () => {
    try {
      console.log('Attempting to delete user with:', { csrfToken, token, userId });

      const res = await fetch(`https://chatify-api.up.railway.app/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      console.log('User deleted successfully');
      setToken(''); // Reset the token in the state
      navigate('/login'); // Redirect to login page after deletion
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
          'Content-Type': 'application/json',
         
        },
        body: JSON.stringify({
          userId,
          updatedData,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user');
      }

      console.log('User updated successfully');
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser); // Update local user state
      // Clear the form fields after successful update
      setNewAvatar('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const handleUpdateAvatar = () => handleUserUpdate({ avatar: newAvatar });
  const handleUpdateUsername = () => handleUserUpdate({ username: newUsername });
  const handleUpdateEmail = () => handleUserUpdate({ email: newEmail });
  const handleUpdatePassword = () => handleUserUpdate({ password: newPassword });

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
          <p className="loading-message">Loading...</p>
        )}
      </div>
      {user && (
        <div className="profile-form">
          <button
            className="avatar-button"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
            
          />
          <FetchAvatars setAvatar={setNewAvatar} />
          <button  className='uppdatebutton' onClick={handleUpdateAvatar}>Update Avatar</button>
          <input
            type="text"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
           
          />
          <button className='uppdatebutton' onClick={handleUpdateUsername}>Update Username</button>
          <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
           
          />
          <button className='uppdatebutton' onClick={handleUpdateEmail}>Update Email</button>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
           
          />
          <button className='uppdatebutton' onClick={handleUpdatePassword}>Update Password</button>
          <button className="delete-button" onClick={handleDelete}>Delete Account</button>
        </div>
      )}
    </div>
    </div>
  );
}

export default Profile;

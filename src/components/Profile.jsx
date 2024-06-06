import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {user ? (
        <div>
          <img src={user.avatar} alt="avatar" width="200" height="200" />
          <br />
          <input
            type="text"
            placeholder="New Avatar URL"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
          />
          <button onClick={handleUpdateAvatar}>Update Avatar</button>
          <br />
          <p>Username: {user.username}</p>
          <input
            type="text"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button onClick={handleUpdateUsername}>Update Username</button>
          <br />
          <p>Email: {user.email}</p>
          <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button onClick={handleUpdateEmail}>Update Email</button>
          <br />
          <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
          <p>Updated At: {new Date(user.updatedAt).toLocaleString()}</p>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleUpdatePassword}>Update Password</button>
          <br />
          <button onClick={handleDelete}>Delete Account</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;

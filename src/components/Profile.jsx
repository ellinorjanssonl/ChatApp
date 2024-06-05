import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ csrfToken, token }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const avatar = localStorage.getItem('avatar');

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
        setUser(data);
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
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('avatar');
      navigate('/login'); // Redirect to login page after deletion
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {user ? (
        <div>
          <img src={avatar} alt="avatar" width="100" height="100" />
          <p>Username: {username}</p>
          <p>Email: {email}</p>
          <button onClick={handleDelete}>Delete Account</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;

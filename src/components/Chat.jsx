import React, { useState, useEffect } from 'react';
import './Css/Chat.css';
import icon from './Assets/icon.png'; // Import the default icon

const generateGUID = () => {
  return crypto.randomUUID();
};

const sanitizeInput = (input) => {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

const Chat = ({ token, setToken }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [conversationId, setConversationId] = useState(localStorage.getItem('conversationId') || generateGUID());
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [users, setUsers] = useState([]);
  const [usersInConvo, setUsersInConvo] = useState([]);
  const userId = localStorage.getItem('userId');

  // hämtar användare när komponenten laddas
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://chatify-api.up.railway.app/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        console.log('Fetched users:', data);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      }
    };

    fetchUsers();
  }, [token]); // hämtar användare när token ändras

  // hämtar bara meddelanden om det finns användare
  useEffect(() => {
    if (users.length === 0) return; //Hämtar inte ut meddelanden om det inte finns några användare

    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://chatify-api.up.railway.app/messages?conversationId=${conversationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await res.json();
        console.log('Fetched messages:', data);
        setMessages(data);

       // hämtar ut användare som är inblandade i konversationen 
        const involvedUsers = data.map(msg => msg.userId).filter((v, i, a) => a.indexOf(v) === i); //när man har unika userID
        const usersInvolved = users.filter(user => involvedUsers.includes(user.userId));
        setUsersInConvo(usersInvolved);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
      }
    };

    fetchMessages();
  }, [conversationId, users, token]); 

  // loggar ut användaren efter 20 minuter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivityTime > 20 * 60 * 1000) {
        setToken(''); 
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [lastActivityTime, setToken]);

  const handleSendMessage = async () => {
    const sanitizedMessage = sanitizeInput(newMessage);

    try {
      console.log('Sending message with:', {
        text: sanitizedMessage,
        conversationId,
        token,
      });

      const res = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sanitizedMessage,
          conversationId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to send message');
      }

      const message = await res.json();
      console.log('Sent message:', message);
      setMessages([...messages, message]);
      setNewMessage('');
      setLastActivityTime(Date.now());
    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Failed to send message: ${err.message}`);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      console.log('Deleting message with id:', msgId);

      const res = await fetch(`https://chatify-api.up.railway.app/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete message');
      }

      console.log('Deleted message with id:', msgId);
      setMessages(messages.filter(message => message.id !== msgId));
      setLastActivityTime(Date.now());
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      const res = await fetch(`https://chatify-api.up.railway.app/invite/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId, 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to invite user');
      }

      const data = await res.json();
      console.log('Invited user:', data);
      alert(`User ${userId} invited successfully`);
    } catch (err) {
      console.error('Error inviting user:', err);
      setError('Failed to invite user');
    }
  };

  const search = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchValue));
    setUsers(filteredUsers);
  };

  const getUserInfo = (userId) => {
    const user = usersInConvo.find(u => u.userId === userId);
    return user || { username: 'Unknown', avatar: icon };
  };

  return (
    <div className="chatcontainer">
      <div className="user-list">
        <h3>Users</h3>
        <div className="divider">
          <input
            type="text"
            placeholder="Search users..."
            onChange={search}
            className="p-2 w-full rounded"
          />
        </div>
        <ul>
          {users.map((user) => (
            <li key={user.userId} className="user-item">
              <img
                src={user.avatar || 'default-avatar.png'}
                alt="avatar"
                className="w-8 h-8 rounded-full mr-2"
                onError={(e) => { e.target.onerror = null; e.target.src = icon; }} 
              />
              <span>{user.username}</span>
              <button onClick={() => handleInviteUser(user.userId)} className="ml-2 px-2 py-1 bg-blue-500 text-white rounded">
                Invite
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center p-4">
        <div className="mb-4">
        </div>
        <div className="w-full max-w-lg mb-4">  {/* hämtar ut användare som inte är den inloggade*/}
          {messages.map((message) => {
            const { username, avatar } = getUserInfo(message.userId);
            return (
              <div
                key={message.id}
                className={`flex items-start mb-4 ${message.userId?.toString() === userId?.toString() ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-center">
                  {message.userId?.toString() !== userId?.toString() && (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full mr-2"
                      onError={(e) => { e.target.onerror = null; e.target.src = icon; }}
                    />
                  )}
                  <div className={`chatbubbles ${message.userId?.toString() === userId?.toString() ? 'bg-blue-200' : 'bg-purple-200'}`}>
                    <div className="flex items-center mb-2">
                    <span className="font-semibold">{username}</span>
                      <span className="ml-2 text-xs text-gray-500">{new Date(message.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p>{message.text}</p>
                    {message.userId?.toString() === userId?.toString() && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="mt-2 text-red-500 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {message.userId?.toString() === userId?.toString() && (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full ml-2"
                      onError={(e) => { e.target.onerror = null; e.target.src = icon; }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-full max-w-lg flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="inputarea p-2 w-full rounded-l"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-pink-600 text-white rounded"
          >
            Send
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Chat;

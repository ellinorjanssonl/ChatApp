import React, { useState, useEffect } from 'react';
import './Css/Chat.css';

const generateGUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const sanitizeInput = (input) => {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

const Chat = ({ csrfToken, token, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); // Lägg till state för användardata
  const [conversationId, setConversationId] = useState(generateGUID());

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

    fetchUserData();
    fetchMessages();
  }, [csrfToken, token, userId]);

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
      setUser(data[0]); // Sätt användardata till state
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`https://chatify-api.up.railway.app/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    }
  };

  const handleSendMessage = async () => {
    const sanitizedMessage = sanitizeInput(newMessage);

    try {
      console.log('Sending message with:', {
        text: sanitizedMessage,
        conversationId,
        token,
        csrfToken
      });

      const res = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
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
      setUser(data[0]);  // Set user to the first element of the array
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      const res = await fetch(`https://chatify-api.up.railway.app/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete message');
      }

      setMessages(messages.filter(message => message.id !== msgId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const handleConversationChange = () => {
    const newConversationId = generateGUID();
    setConversationId(newConversationId);
    setMessages([]);
    fetchMessages();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4">
        <button onClick={handleConversationChange} className="px-4 py-2 bg-blue-500 text-white rounded">
          Start New Conversation
        </button>
      </div>
      <div className="w-full max-w-lg mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start mb-4 ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
          >
            {message.userId !== userId && (
              <img src={message.avatar} alt="avatar" className="w-10 h-10 rounded-full mr-2" />
            )}
            <div className={`p-4 rounded-lg ${message.userId === userId ? 'bg-blue-100' : 'bg-gray-200'}`}>
              <div className="flex items-center mb-2">
                {message.userId === userId && (
                  <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full mr-2" />
                )}
                <span className="font-semibold">{message.userId === userId ? user.username : message.username}</span>
                <span className="ml-2 text-xs text-gray-500">{new Date(message.createdAt).toLocaleTimeString()}</span>
              </div>
              <p>{message.text}</p>
              {message.userId === userId && (
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="mt-2 text-red-500 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full max-w-lg flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l"
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded-r"
        >
          Send
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Chat;

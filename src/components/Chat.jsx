import React, { useState, useEffect } from 'react';
import './Css/Chat.css';

const generateGUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 8);
    return v.toString(16);
  });
};

const sanitizeInput = (input) => {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

const Chat = ({ token, userId, setToken }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [conversationId, setConversationId] = useState(localStorage.getItem('conversationId') || generateGUID());

  useEffect(() => {
    if (!token || !userId) {
      console.log('Missing token or userId:', { token, userId });
      setError('Missing Auth token or User ID');
      return;
    }

    fetchMessages();

    const interval = setInterval(() => {
      if (Date.now() - lastActivityTime > 20 * 60 * 1000) {
        setToken(''); // Logga ut användaren
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [token, userId, lastActivityTime, setToken]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`https://chatify-api.up.railway.app/messages`, {
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

  const handleConversationChange = () => {
    const newConversationId = generateGUID();
    setConversationId(newConversationId);
    localStorage.setItem('conversationId', newConversationId);
    setMessages([]);
    fetchMessages();
    setLastActivityTime(Date.now());
  };

  return (
    <div className="chatcontainer">
      <div className="flex flex-col items-center p-4">
        <div className="mb-4">
          <button onClick={handleConversationChange} className="px-4 py-2 bg-purple-600 text-white rounded">
            Start New Conversation
          </button>
        </div>
        <div className="w-full max-w-lg mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start mb-4 ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-4 rounded-lg ${message.userId === userId ? 'bg-blue-200' : 'bg-purple-200'}`}>
                <div className="flex items-center mb-2">
                  <span className="font-semibold">{message.userId === userId ? 'You' : 'Other'}</span>
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
            className="p-2 bg-purple-800 text-white rounded-r"
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

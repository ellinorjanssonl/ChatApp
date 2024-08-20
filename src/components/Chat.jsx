import React, { useState, useEffect } from 'react';
import './Css/Chat.css';
import icon from './Assets/icon.png';
import InvitesList from './Invites';

const sanitizeInput = (input) => {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

const Chat = ({ token, setToken }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(localStorage.getItem('conversationId') || '');
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userId] = useState(localStorage.getItem('userId') || '');
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [usersInConvo, setUsersInConvo] = useState([]);
  const [invited, setInvited] = useState(JSON.parse(localStorage.getItem('invited')) || []);
  const [conversations, setConversations] = useState(JSON.parse(localStorage.getItem('conversations')) || []);
  const [activeConversation, setActiveConversation] = useState(conversationId);

  // hämtar användare när sidan laddas
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://chatify-api.up.railway.app/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch users');

        const data = await res.json();
        setAllUsers(data);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      }
    };

    fetchUsers();
  }, [token]);

  // hämtar meddelanden när en aktiv konversation ändras eller när användare ändras
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://chatify-api.up.railway.app/messages?conversationId=${activeConversation}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch messages');

        const data = await res.json();
        setMessages(data);

        // här uppdaterar jag användare i konversationen för att visa deras avatar och namn
        const involvedUsers = data.map((msg) => msg.userId).filter((v, i, a) => a.indexOf(v) === i);
        const usersInvolved = users.filter((user) => involvedUsers.includes(user.userId));
        setUsersInConvo(usersInvolved);

        // här sparar jag användare i localstorage så jag ska kunna uppdatera sidan och allt finns kvar
        if (!conversations.some((convo) => convo.id === activeConversation)) {
          const newConversation = {
            id: activeConversation,
            name: usersInvolved.map((user) => user.username).join(', ') || 'Me',
          };
          const updatedConversations = [...conversations, newConversation];
          setConversations(updatedConversations);
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
      }
    };

    fetchMessages();
  }, [activeConversation, users, token]);

  const handleSendMessage = async () => {
    const sanitizedMessage = sanitizeInput(newMessage);

    try {
      const res = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sanitizedMessage,
          conversationId: activeConversation,
        }),
      });

      if (!res.ok) throw new Error(await res.text() || 'Failed to send message');

      const data = await res.json();
      const latestMessage = data.latestMessage;

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...latestMessage,
          userId,
          username,
          avatar,
        },
      ]);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Failed to send message: ${err.message}`);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      const res = await fetch(`https://chatify-api.up.railway.app/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(await res.text() || 'Failed to delete message');

      setMessages((prevMessages) => prevMessages.filter((message) => message.id !== msgId));
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation,
        }),
      });

      if (!res.ok) throw new Error(await res.text() || 'Failed to invite user');

      alert(`User ${userId} invited successfully`);
    } catch (err) {
      console.error('Error inviting user:', err);
      setError('Failed to invite user');
    }
  };

  const search = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchValue(searchValue);

    // Filter users based on search value
    const filteredUsers = allUsers.filter((user) => user.username.toLowerCase().includes(searchValue));
    setUsers(filteredUsers);
  };

  const getUserInfo = (userId) => {
    const user = usersInConvo.find((u) => u.userId === userId);
    return user || { username, avatar };
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation.id);
    localStorage.setItem('conversationId', conversation.id);
  };

  return (
    <div className="chatcontainer">
      <div className="user-list">
        <div className="divider">
          <input
            type="text"
            placeholder="Search users..."
            value={searchValue}
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = icon;
                }}
              />
              <span>{user.username}</span>
              <button
                onClick={() => handleInviteUser(user.userId)}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
              >
                Invite
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex">
        <div className="conversation-list w-1/6 h-[70vh] fixed top-1/2 transform -translate-y-1/2 left-0 flex flex-col items-center p-4 bg-gradient-to-b from-purple-900 to-purple-400 shadow-lg rounded-r-lg">
          <h4 className="text-lg text-pink-100 font-light mb-4">Conversations</h4>
          <ul className="space-y-2 w-full">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className={`cursor-pointer p-2 rounded text-center ${conversation.id === activeConversation ? 'bg-pink-500 text-white' : 'bg-purple-200'}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                {conversation.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center p-4 w-full">
        <h2 className="text-m text-pink-100 font-light mb-4">
          Currently chatting with: {conversations.find((convo) => convo.id === activeConversation)?.name || 'Unknown'}
        </h2>
        <div className="w-full max-w-lg mb-4">
          {messages.map((message, index) => {
            const { username, avatar } = getUserInfo(message.userId);
            const isCurrentUser = message.userId?.toString() === userId?.toString();
            return (
              <div
                key={`${message.id}-${index}`}
                className={`flex items-start mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-center">
                  {!isCurrentUser && (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = icon;
                      }}
                    />
                  )}
                  <div className={`chatbubbles ${isCurrentUser ? 'bg-blue-200' : 'bg-purple-200'}`}>
                    <div className="flex items-center mb-2">
                      <span className="font-semibold">{username}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{message.text}</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="mt-2 text-red-500 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {isCurrentUser && (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full ml-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = icon;
                      }}
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
          <button onClick={handleSendMessage} className="p-2 bg-pink-600 text-white rounded">
            Send
          </button>
        </div>
        <div className="w-full max-w-lg mt-8">
          <InvitesList onAcceptInvite={(invite) => setActiveConversation(invite.conversationId)} />
        </div>
      </div>
    </div>
  );
};

export default Chat;

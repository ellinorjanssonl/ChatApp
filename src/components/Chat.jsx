import React from 'react';

const Chat = ({ user }) => {
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {user && (
          <>
            <img src={user.avatar} alt={user.username} width="50" height="50" />
            <span>{user.username}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;

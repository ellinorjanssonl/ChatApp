import React, { useState, useEffect } from 'react';

const InvitesList = ({ onAcceptInvite }) => {
  const [invited, setInvited] = useState([]);

  useEffect(() => {
    const parsedInvites = JSON.parse(localStorage.getItem('invite')) || [];
    setInvited(parsedInvites);
  }, []);

  const handleAcceptInvite = (invite) => {
    onAcceptInvite(invite);
    removeInvite(invite.conversationId);
    };

    const handleDeclineInvite = (invite) => {
        removeInvite(invite.conversationId);
    };
    
    const removeInvite = (conversationId) => {
      
        const updatedInvites = invited.filter((i) => i.conversationId !== conversationId);
        setInvited(updatedInvites);
        localStorage.setItem('invite', JSON.stringify(updatedInvites));
      };

  return (
    <div className="w-full max-w-lg mt-8 p-4 bg-gradient-to-r from-purple-500 via-pink-400 to-blue-900 rounded-lg shadow-lg">
      <h3 className="text-small font-light text-white mb-4">Your Invites</h3>
      {(invited.length > 0) ? (
        <ul className="space-y-4">
          {invited.map((invite) => (
                <li 
                key={invite.conversationId} 
                className="flex justify-between items-center p-4 bg-purple-900 rounded-lg shadow-md hover:bg-purple-800 transition-all duration-200"
              >
                <div>
                  <span className="font-medium text-purple-100">{invite.username}</span>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleAcceptInvite(invite)} 
                    className="bg-blue-500 hover:bg-green-500 text-white py-2 px-4 rounded-full transition-all duration-200"
                  >
                    Accept Invite
                  </button>
                  <button 
                    onClick={() => handleDeclineInvite(invite)} 
                    className="bg-purple-800 hover:bg-red-700 text-white py-2 px-4 rounded-full transition-all duration-200"
                  >
                    Decline Invite
                  </button>
                </div>
              </li>
          ))}
        </ul>
      ) : (
        <p className="text-white">You have no invites.</p>
      )}
    </div>
  );
};

export default InvitesList;

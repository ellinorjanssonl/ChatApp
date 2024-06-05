import React, { useState, useEffect } from 'react';

const FetchAvatars = ({ setAvatar }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    const avatars = [
      'https://i.pravatar.cc/200?img=1',
      'https://i.pravatar.cc/200?img=2',
      'https://i.pravatar.cc/200?img=3',
      'https://i.pravatar.cc/200?img=4',
      'https://i.pravatar.cc/200?img=5',
      'https://i.pravatar.cc/200?img=6',
      'https://i.pravatar.cc/200?img=7',
      'https://i.pravatar.cc/200?img=8',
    ];
    setAvatars(avatars);
  }, []);

  const handleSelectAvatar = (url) => {
    setSelectedAvatar(url);
    setAvatar(url);
  };


  return (
    <div>
      <h3>Select an Avatar</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {avatars.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt="avatar"
            style={{
              border: selectedAvatar === avatar ? '2px solid blue' : '1px solid gray',
              cursor: 'pointer',
              width: '100px',
              height: '100px',
              margin: '5px'
            }}
            onClick={() => handleSelectAvatar(avatar)}
          />
        ))}
      </div>
    </div>
  );
};

export default FetchAvatars;

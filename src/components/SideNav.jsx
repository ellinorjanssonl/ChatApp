import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Css/SideNav.css';

const SideNav = ({ token, setToken }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLogout = () => {
    console.log('Logging out');
    setToken('');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="hamburger-menu" onClick={toggleNav}>
        &#9776;
      </button>
      <div className={`sidenav ${isOpen ? 'open' : ''}`}>
        <nav className="mt-10">
          <ul className="space-y-4">
            {!isLoggedIn ? (
              <>
                <li><Link to="/" className="block px-4 py-2 hover:bg-gray-700">Register 🩷 </Link></li>
                <li><Link to="/login" className="block px-4 py-2 hover:bg-gray-700">Login 🩵</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/profile" className="block px-4 py-2 hover:bg-gray-700">Profile 😎 </Link></li>
                <li><Link to="/chat" className="block px-4 py-2 hover:bg-gray-700">Chat 🗯️ </Link></li>
                <li><button onClick={handleLogout} className="block px-4 py-2 w-full text-left hover:bg-gray-700">Logout 👋 </button></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideNav;

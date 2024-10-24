import React from 'react';
import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';
import './css/Navbar.css'; 

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const handleClick = () => {
    logout();
  };

  const handleHomeClick = () => {
    window.location.reload();
  };

  return (
    <header>
      <div className="container">
        <Link to="/" className="logo-link">
          <img
            src="https://res.cloudinary.com/djbspykue/image/upload/v1729760463/gegagcimrehfbsjidftq.png"
            alt="Jatra Logo"
            style={{ width: '90px', height: '80px', marginRight: '10px' }} // Adjust size as needed
          />
          <h1>Jatra</h1>
        </Link>
        <nav>
          {user && (
            <div>
              <span>{user.email}</span>
              <Link to="/" onClick={handleHomeClick}>Home</Link>
              <Link to="/gallery/x">Gallery</Link>
              <Link to="/blogs">Blogs</Link>
              <button onClick={handleClick}>Log out</button>
            </div>
          )}
          {!user && (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

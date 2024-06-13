import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  const username = localStorage.getItem('username');

  return (
    <div className="page-container">
      <header>
        <h1>Welcome to Ardur</h1>
        <nav>
          <ul>
            <li><Link to="/verification">FastApp Verification</Link></li>
            <li><Link to="">AppMark Verification</Link></li>
            <li><Link to="">Equity Verification</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      </header>
      <div className="container">
        <p className="mainareatext">Welcome, {username} on Process Portal!</p>
      </div>
      <footer>
        <p>&copy; 2024 Ardur Technology</p>
      </footer>
    </div>
  );
};

export default LandingPage;

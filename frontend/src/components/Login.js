import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password }, { withCredentials: true });
      if (response.data.success) {
        localStorage.setItem('username', username);
        navigate('/landing');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Invalid login or password.');
    }
  };

  return (
    <div className="page-container">
      <header>
        <h1>ARDUR</h1>
      </header>
      <div className="login-container">
        <div className="login-box">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            /><br />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            /><br />
            {error && <p className="error">{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
      <footer>
        <p>&copy; 2024 Ardur Technology</p>
      </footer>
    </div>
  );
};

export default Login;

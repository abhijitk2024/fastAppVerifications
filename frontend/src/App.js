import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import VerificationPortal from './components/VerificationPortal';
import FAVerForm from './components/FAVerForm';

import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/verification" element={<VerificationPortal />} />
          <Route path="/verform" element={<FAVerForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

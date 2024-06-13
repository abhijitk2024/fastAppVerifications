import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerificationPortal.css';
import '../css/jquery.dataTables.css';
import $ from 'jquery';
import 'datatables.net';

const VerificationPortal = () => {
  const navigate = useNavigate();
  const [todayCases, setTodayCases] = useState({});
  const [clientComments, setClientComments] = useState([]);
  const [quickUpdates, setQuickUpdates] = useState('');
  const [workSummary, setWorkSummary] = useState({});

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/');
    }

    const fetchTodayCases = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/today-cases');
        setTodayCases(response.data);
      } catch (error) {
        console.error('Error fetching today cases:', error);
      }
    };

    const fetchClientComments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/client-comments');
        setClientComments(response.data);
      } catch (error) {
        console.error('Error fetching client comments:', error);
      }
    };

    const fetchQuickUpdates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quick-updates');
        setQuickUpdates(response.data);
      } catch (error) {
        console.error('Error fetching quick updates:', error);
      }
    };

    const fetchWorkSummary = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/work-summary/${username}`);
        setWorkSummary(response.data);
      } catch (error) {
        console.error('Error fetching work summary:', error);
      }
    };

    fetchTodayCases();
    fetchClientComments();
    fetchQuickUpdates();
    fetchWorkSummary();
  }, [navigate]);

  const username = localStorage.getItem('username');

  const toggleMenu = () => {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
  };

  return (
    <div className="page-container">
      <header>
        <h1>Hello {username}</h1>
        <nav>
          <div className="burger-menu" id="burger-menu" onClick={toggleMenu}>&#9776;</div>
          <ul id="nav-links">
            <li><button onClick={() => navigate('/verform')}>Verification</button></li>
            <li><button onClick={() => navigate('/reverification')}>Re-Verification</button></li>
            <li><button onClick={() => navigate('/reports')}>Reports</button></li>
            <li><button onClick={() => navigate('/landing')}>Back Home</button></li>
          </ul>
        </nav>
      </header>
      <div className="container">
        <div className="dashboard-frame" id="frame1">
          <h2>Today's Cases</h2>
          <div className="content">
            <p>Total Cases: {todayCases.total}</p>
            <p>Completed: {todayCases.completed}</p>
            <p>In Process: {todayCases.inProcess}</p>
            <p>Pending: {todayCases.pending}</p>
            <p>On Hold: {todayCases.onHold}</p>
          </div>
        </div>
        <div className="dashboard-frame" id="frame2">
          <h2>Client Comments</h2>
          <div className="content">
            <table id="table1">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Client Comment</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {clientComments.map((comment, index) => (
                  <tr key={index}>
                    <td>{comment.caseNumber}</td>
                    <td>{comment.comment}</td>
                    <td>{comment.priority}</td>
                    <td>{comment.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="dashboard-frame" id="frame3">
          <h2>Quick Updates</h2>
          <div className="content">
            <p>{quickUpdates}</p>
          </div>
        </div>
        <div className="dashboard-frame" id="frame4">
          <h2>Work Summary</h2>
          <div className="content">
            <p>Positive: {workSummary.positive}</p>
            <p>Negative: {workSummary.negative}</p>
            <p>Pending: {workSummary.pending}</p>
            <p>Unverified: {workSummary.unverified}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPortal;

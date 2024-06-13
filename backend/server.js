const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db_conn');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000', // Allow only the frontend origin
  credentials: true // Allow credentials (cookies, headers)
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Existing API endpoints

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM fav_usermaster WHERE fav_username = ? AND fav_userpwd = ?', [username, password]);
    if (rows.length > 0) {
      req.session.username = username;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
  }
});

// Fetch dropdown items from FAV_VerSecMaster
app.get('/api/dropdown-items', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT FAV_VerSecName FROM FAV_VerSecMaster Order By FAV_VerSecID ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching dropdown items:', error);
    res.status(500).json({ message: 'An error occurred while fetching dropdown items.' });
  }
});

// Added dropdown list code for parameter check field
app.get('/api/dropdown-items1', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT FAV_ChkParam FROM fav_casedetails Order By FAV_FileNo ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching dropdown items:', error);
    res.status(500).json({ message: 'An error occurred while fetching dropdown items.' });
  }
});

// Save form data
app.post('/api/save-form', async (req, res) => {
  const formData = req.body;
  try {
    const [result] = await db.query('INSERT INTO FAV_CaseDetails SET ?', formData);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ message: 'An error occurred while saving form data.' });
  }
});

// New API endpoints

// API endpoint to get today's cases
app.get('/api/today-cases', async (req, res) => {
  /*const today = new Date().toISOString().split('T')[0];*/
  const today = new Date().toISOString().substring(0, 10);
  try {
    const [results] = await db.query(
      'SELECT FAV_DBStatus, COUNT(*) as count FROM FAV_DBCaseSummary WHERE FAV_CreatedDate = ? GROUP BY FAV_DBStatus',
      [today]
    );
    const data = { total: 0, completed: 0, inProcess: 0, pending: 0, onHold: 0 };
    results.forEach(row => {
      data.total += row.count;
      if (row.FAV_DBStatus === 'Completed') data.completed = row.count;
      if (row.FAV_DBStatus === 'In_process') data.inProcess = row.count;
      if (row.FAV_DBStatus === 'Pending') data.pending = row.count;
      if (row.FAV_DBStatus === 'On_Hold') data.onHold = row.count;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching today cases:', error);
    res.status(500).json({ error: 'Error fetching today cases.' });
  }
});

// API endpoint to get client comments
app.get('/api/client-comments', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM FAV_DBClientCmnts');
    res.json(results);
  } catch (error) {
    console.error('Error fetching client comments:', error);
    res.status(500).json({ error: 'Error fetching client comments.' });
  }
});

// API endpoint to get quick updates
app.get('/api/quick-updates', async (req, res) => {
  try {
    const [results] = await db.query('SELECT FAV_DBQUUpdateTxt FROM FAV_DBQuickUpdts ORDER BY FAV_CreatedDate DESC');
    res.json(results[0]?.FAV_DBQUUpdateTxt || '');
  } catch (error) {
    console.error('Error fetching quick updates:', error);
    res.status(500).json({ error: 'Error fetching quick updates.' });
  }
});

// API endpoint to get work summary for a specific user
app.get('/api/work-summary/:username', async (req, res) => {
  const username = req.params.username;
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7); // YYYY-MM
  try {
    const [results] = await db.query(
      'SELECT * FROM FAV_DBWorkSumry WHERE FAV_CreatedBy = ? AND DATE_FORMAT(FAV_DBQSMonth, "%Y-%m") = ?',
      [username, currentMonth]
    );
    res.json(results[0] || {});
  } catch (error) {
    console.error('Error fetching work summary:', error);
    res.status(500).json({ error: 'Error fetching work summary.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



/* API for Insert data into FAV_CaseDetals table */
app.post('/api/save-initial-data', (req, res) => {
  const { FAV_FileNo, FAV_VendorName, FAV_CaseStatus } = req.body;

  const query = 'INSERT INTO FAV_CaseDetails (FAV_FileNo, FAV_VendorName, FAV_CaseStatus) VALUES (?, ?, ?)';
  db.query(query, [FAV_FileNo, FAV_VendorName, FAV_CaseStatus], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Error inserting data' });
    } else {
      res.status(200).json({ message: 'Data saved successfully' });
    }
  });
});

/* API end point to save the verification remark against selected file no
   and corresponding section and parameter in FAV_CaseDetails table */
app.post('/api/save-remark', (req, res) => {
  const { FAV_FileNo, FAV_VerRemark } = req.body;

  const query = 'UPDATE FAV_CaseDetails SET verification_remark = ? WHERE FAV_FileNo = ?';
  db.query(query, [FAV_VerRemark, FAV_FileNo], (err, result) => {
    if (err) {
      console.error('Error updating remark:', err);
      res.status(500).json({ error: 'Error updating remark' });
    } else {
      res.status(200).json({ message: 'Remark saved successfully' });
    }
  });
});

/* The API end point will update the case status as verificatio complete once all 
   sections and check parameters are completed. */
app.post('/api/submit-case', (req, res) => {
  const { FAV_FileNo } = req.body;

  const query = 'UPDATE FAV_CaseDetails SET FAV_FileVerStatus = "Verification Complete" WHERE FAV_FileNo = ?';
  db.query(query, [FAV_FileNo], (err, result) => {
    if (err) {
      console.error('Error submitting case:', err);
      res.status(500).json({ error: 'Error submitting case' });
    } else {
      res.status(200).json({ message: 'Case submitted successfully' });
    }
  });
});

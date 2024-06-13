const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost', // Change to your MySQL host
  user: 'root', // Change to your MySQL user
  password: 'root', // Change to your MySQL password
  database: 'ardurdev'
});

module.exports = pool;

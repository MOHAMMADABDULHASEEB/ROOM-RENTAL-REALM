// db.js
const mysql = require('mysql');

// Direct connection details without using .env
const connection = mysql.createConnection({
  host: 'localhost',       // Database host
  user: 'root',            // MySQL username
  password: 'Dathraj@16', // MySQL password
  database: 'room_rental_realm' // Database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

module.exports = connection;

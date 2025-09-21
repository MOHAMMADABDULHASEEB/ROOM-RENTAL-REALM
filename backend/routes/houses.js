// backend/routes/houses.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = 'your_secret_key'; // Use environment variables in production

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Add House Route
router.post('/add', verifyToken, (req, res) => {
    if (req.userRole !== 'landlord') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { location, type, rent, description } = req.body;
    const query = 'INSERT INTO houses (landlord_id, location, type, rent, description) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [req.userId, location, type, rent, description], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to add house' });
        res.json({ message: 'House added successfully' });
    });
});



// Get All Houses Route
router.get('/', verifyToken, (req, res) => {
    const query = 'SELECT houses.*, users.name AS landlord_name FROM houses JOIN users ON houses.landlord_id = users.id';

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch houses' });
        res.json({ houses: results });
    });
});

module.exports = router;
// backend/routes/login.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const SECRET_KEY = 'your_secret_key'; // Use environment variables in production

router.post('/', (req, res) => {
    const { email, password } = req.body;

    User.login(email, password, (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: 'Login successful', token });
    });
});

module.exports = router;

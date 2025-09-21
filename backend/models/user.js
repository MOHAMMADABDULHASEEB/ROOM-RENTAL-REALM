// backend/models/user.js
const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {
    register: (userData, callback) => {
        const { name, email, password, role } = userData;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(query, [name, email, hashedPassword, role], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    login: (email, password, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);

            const user = results[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) return callback(null, null);

            callback(null, user);
        });
    }
};

module.exports = User;

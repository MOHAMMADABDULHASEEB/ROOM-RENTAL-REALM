const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Dathraj@16',
    database: 'room_rental_realm'
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const query = `SELECT id, password, role, name FROM users WHERE email = ? AND role = ? LIMIT 1`;

    db.query(query, [email, role], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or role' });
        }

        const user = results[0];
        if (user.password === password) {
            res.status(200).json({
                message: `${role} logged in successfully`,
                role: user.role,
                userId: user.id,
                name: user.name
            });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    });
});

// User details endpoint
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const query = `SELECT id, name, email, role FROM users WHERE id = ?`;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    });
});

// Add property endpoint
app.post('/api/properties', (req, res) => {
    const { propertyName, address, numberOfRooms, landlordId, rent } = req.body;

    console.log('Received property data:', req.body);

    if (!propertyName || !address || !numberOfRooms || !landlordId) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        INSERT INTO rooms 
        (property_name, address, number_of_rooms, landlord_id, rent) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [propertyName, address, numberOfRooms, landlordId, rent], (err, result) => {
        if (err) {
            console.error('Database insert error:', err);
            return res.status(500).json({ error: 'Failed to add property', details: err.message });
        }

        res.status(201).json({
            message: 'Property added successfully',
            propertyId: result.insertId
        });
    });
});

// Fetch properties endpoint
app.get('/api/properties/:landlordId', (req, res) => {
    const landlordId = req.params.landlordId;

    const query = `
        SELECT id, property_name, address, number_of_rooms, status 
        FROM rooms 
        WHERE landlord_id = ?
    `;

    db.query(query, [landlordId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Failed to fetch properties', details: err.message });
        }

        res.status(200).json(results);
    });
});

// Update property endpoint
app.put('/api/properties/:propertyId', (req, res) => {
    const propertyId = req.params.propertyId;
    const { propertyName, address, numberOfRooms, status } = req.body;

    const query = `
        UPDATE rooms 
        SET property_name = ?, address = ?, number_of_rooms = ?, status = ?
        WHERE id = ?
    `;

    db.query(query, [propertyName, address, numberOfRooms, status, propertyId], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).json({ error: 'Failed to update property', details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.status(200).json({ message: 'Property updated successfully' });
    });
});
// Delete property endpoint
app.delete('/api/properties/:propertyId', (req, res) => {
    const propertyId = req.params.propertyId;

    const query = `
        DELETE FROM rooms 
        WHERE id = ?
    `;

    db.query(query, [propertyId], (err, result) => {
        if (err) {
            console.error('Database delete error:', err);
            return res.status(500).json({ error: 'Failed to delete property', details: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.status(200).json({ message: 'Property deleted successfully' });
    });
});

// Add these new endpoints to your existing server.js

// Book a room endpoint
// Improved Book a room endpoint with more comprehensive error handling
app.post('/api/book-room', (req, res) => {
    const { roomId, tenantId } = req.body;

    // Enhanced input validation
    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Validate roomId and tenantId are numbers
    if (isNaN(parseInt(roomId)) || isNaN(parseInt(tenantId))) {
        return res.status(400).json({ error: 'Room ID and Tenant ID must be valid numbers' });
    }

    // First, check if the tenant exists
    const checkTenantQuery = `
        SELECT id FROM users 
        WHERE id = ? AND role = 'tenant'
    `;

    db.query(checkTenantQuery, [tenantId], (tenantErr, tenantResults) => {
        if (tenantErr) {
            console.error('Tenant check error:', tenantErr);
            return res.status(500).json({ 
                error: 'Database error occurred while checking tenant', 
                details: tenantErr.message 
            });
        }

        if (tenantResults.length === 0) {
            return res.status(404).json({ error: 'Tenant not found or invalid tenant role' });
        }

        // Then, check room availability
        const checkAvailabilityQuery = `
            SELECT id, status 
            FROM rooms 
            WHERE id = ? 
            AND status = 'active'
        `;

        db.query(checkAvailabilityQuery, [roomId], (checkErr, checkResults) => {
            if (checkErr) {
                console.error('Room availability check error:', checkErr);
                return res.status(500).json({ 
                    error: 'Failed to check room availability', 
                    details: checkErr.message 
                });
            }

            if (checkResults.length === 0) {
                return res.status(400).json({ 
                    error: 'Room is not available for booking', 
                    details: 'Room may already be booked or not active' 
                });
            }

            // Book the room
            const bookRoomQuery = `
                UPDATE rooms 
                SET 
                    status = 'booked', 
                    tenant_id = ?, 
                    booking_date = CURRENT_TIMESTAMP 
                WHERE id = ? AND status = 'active'
            `;

            db.query(bookRoomQuery, [tenantId, roomId], (err, result) => {
                if (err) {
                    console.error('Database booking error:', err);
                    return res.status(500).json({ 
                        error: 'Failed to book room', 
                        details: err.message 
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(400).json({ 
                        error: 'Room could not be booked', 
                        details: 'Room may have been booked by another tenant' 
                    });
                }

                res.status(200).json({ 
                    message: 'Room booked successfully',
                    roomId: roomId 
                });
            });
        });
    });
});

// Update search rooms endpoint to only show active rooms
// Update search rooms endpoint to use more flexible searching
app.get('/api/search-rooms', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    // Split the query into individual words
    const searchWords = query.split(/\s+/);

    // Create a dynamic search condition that looks for any word match
    const searchConditions = searchWords.map(() => 
        `(r.property_name LIKE ? OR r.address LIKE ?)`
    ).join(' OR ');

    const searchQuery = `
        SELECT r.id, r.property_name, r.address, r.number_of_rooms, r.rent, 
               r.status, u.name AS landlord_name, u.email AS landlord_contact
        FROM rooms r
        JOIN users u ON r.landlord_id = u.id
        WHERE r.status = 'active' AND (${searchConditions})
    `;

    // Prepare parameters: each word is used twice (for property_name and address)
    const searchParams = searchWords.flatMap(word => {
        const searchParam = `%${word}%`;
        return [searchParam, searchParam];
    });

    db.query(searchQuery, searchParams, (err, results) => {
        if (err) {
            console.error('Database search error:', err);
            return res.status(500).json({ error: 'Failed to search properties', details: err.message });
        }

        res.status(200).json(results);
    });
});

// New endpoint to fetch rooms booked by a specific tenant
app.get('/api/tenant-rooms/:tenantId', (req, res) => {
    const tenantId = req.params.tenantId;

    const query = `
        SELECT id, property_name, address, number_of_rooms, rent, booking_date, status 
        FROM rooms 
        WHERE tenant_id = ? AND status = 'booked'
    `;

    db.query(query, [tenantId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Failed to fetch tenant rooms', details: err.message });
        }

        res.status(200).json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
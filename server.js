// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

const cors = require('cors');

const bodyParser = require('body-parser');

// Middleware to parse JSON and handle CORS
app.use(cors());
app.use(bodyParser.json()); // Parses application/json
app.use(bodyParser.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded


// Connect to the MySQL database

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "hostfinder"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Serve static files
app.use(express.static('public'));

// ---------------------------home page display accommodation details------------------------------------

// API route to fetch accommodations data
app.get('/api/accommodation', (req, res) => {
    const sql = 'SELECT * FROM accommodation';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});
// Fetch single accommodation by ID
app.get('/api/accommodation/:id', (req, res) => {
    const accommodationId = req.params.id;

    const query = 'SELECT * FROM accommodation WHERE accommodation_id = ?';
    db.query(query, [accommodationId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Accommodation not found' });
        }
        res.status(200).json(results[0]);
    });
});
// Fetch owner details by accommodation ID, contact button
app.get('/api/owner/details/:accommodation_id', (req, res) => {
    const accommodationId = req.params.accommodation_id;
    const query = `
        SELECT o.email
        FROM owner o
        JOIN accommodation a ON o.owner_id = a.owner_id
        WHERE a.accommodation_id = ?
    `;

    db.query(query, [accommodationId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch owner details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Owner not found' });
        }

        res.json(results[0]);
    });
});

// ---------------------------owner page login and register------------------------------------

app.post('/api/owner/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const query = 'SELECT * FROM owner WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: "Internal server error." });
        }

        if (results.length > 0) {
            // Login successful
            return res.json({
                success: true,
                owner_id: results[0].owner_id,
                message: "Login successful.",
            });
        } else {
            // Invalid credentials
            return res.status(401).json({ message: "Invalid username or password." });
        }
    });
});

app.post('/api/owner/register', (req, res) => {
    console.log('Request Body:', req.body); // Log the incoming request body

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const query = 'SELECT email FROM owner WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const insertQuery = 'INSERT INTO owner (email, password) VALUES (?, ?)';
        db.query(insertQuery, [email, password], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            res.json({ success: true, message: 'Registration successful' });

        });
    });
});

// ---------------------------owner page display accommodation details------------------------------------

// app.get('/api/accommodation', (req, res) => {
//     const ownerId = req.query.owner_id;

//     const query = 'SELECT * FROM accommodation WHERE owner_id = ?';
//     db.query(query, [ownerId], (err, results) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.status(500).json({ success: false, message: 'Database error' });
//         }

//         res.json(results);
//     });
// });

app.get('/api/accommodation/:owner_id', (req, res) => {
    const ownerId = req.params.owner_id;
    const query = `SELECT * FROM accommodation WHERE owner_id = ?`;

    db.query(query, [ownerId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "No accommodation found" });
        }

        // Ensure facilities and pictures are properly formatted JSON strings
        const accommodation = results[0];
        accommodation.facilities = JSON.parse(accommodation.facilities || "[]");
        accommodation.pictures = JSON.parse(accommodation.pictures || "[]");

        res.json(accommodation);
    });
});

// ---------------------------owner page request edit accommodation details------------------------------------

// Route to add accommodation request
app.post('/api/accommodation-requests', (req, res) => {
    const {
        owner_id,
        accommodation_name,
        price,
        location,
        address,
        landmark,
        description,
        total_rooms,
        gender_preference,
        food_type,
        room_sharing,
        bathroom,
        restrictions,
        facilities,
        pictures,
        contact
    } = req.body;

    const query = `
        INSERT INTO accommodation_requests (
            owner_id, accommodation_name, price, location, address, landmark, description, 
            total_rooms, gender_preference, food_type, room_sharing, bathroom, restrictions, 
            facilities, pictures, contact
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(query, [
        owner_id,
        accommodation_name,
        price,
        location,
        address,
        landmark,
        description,
        total_rooms,
        gender_preference,
        food_type,
        room_sharing,
        bathroom,
        restrictions,
        JSON.stringify(facilities), // Assuming facilities is an array
        JSON.stringify(pictures),   // Assuming pictures is an array
        contact
    ], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Accommodation request submitted successfully' });
    });
});

app.put('/api/accommodation/:id', (req, res) => {
    const {
        accommodation_id, // Include accommodation_id for checking existence
        owner_id,
        accommodation_name,
        price,
        location,
        address,
        landmark,
        description,
        total_rooms,
        gender_preference,
        food_type,
        room_sharing,
        bathroom,
        restrictions,
        facilities,
        pictures,
        contact,
    } = req.body;

    // SQL query to insert or update accommodation details
    const query = `
        INSERT INTO accommodation (
            accommodation_id,
            owner_id,
            accommodation_name,
            price,
            location,
            address,
            landmark,
            description,
            total_rooms,
            gender_preference,
            food_type,
            room_sharing,
            bathroom,
            restrictions,
            facilities,
            pictures,
            contact
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON DUPLICATE KEY UPDATE
            accommodation_name = VALUES(accommodation_name),
            price = VALUES(price),
            location = VALUES(location),
            address = VALUES(address),
            landmark = VALUES(landmark),
            description = VALUES(description),
            total_rooms = VALUES(total_rooms),
            gender_preference = VALUES(gender_preference),
            food_type = VALUES(food_type),
            room_sharing = VALUES(room_sharing),
            bathroom = VALUES(bathroom),
            restrictions = VALUES(restrictions),
            facilities = VALUES(facilities),
            pictures = VALUES(pictures),
            contact = VALUES(contact);
    `;

    db.query(
        query,
        [
            accommodation_id || null, // Pass null if no ID is provided
            owner_id,
            accommodation_name,
            price,
            location,
            address,
            landmark,
            description,
            total_rooms,
            gender_preference,
            food_type,
            room_sharing,
            bathroom,
            restrictions,
            JSON.stringify(facilities), // Convert facilities array to JSON
            JSON.stringify(pictures),   // Convert pictures array to JSON
            contact,
        ],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const message = accommodation_id
                ? 'Accommodation updated successfully'
                : 'Accommodation added successfully';

            res.json({ success: true, message });
        }
    );
});



// ---------------------------roommate page display roommate details------------------------------------

app.get('/api/roommates', (req, res) => {
    const query = 'SELECT * FROM roommate_requests';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json(results);
    });
});

app.get('/api/roommate/:id', (req, res) => {
    const requestId = req.params.id;

    const query = 'SELECT * FROM roommate_requests WHERE request_id = ?';
    db.query(query, [requestId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Roommate request not found' });
        }

        res.json(results[0]);
    });
});

// ---------------------------roommate page login and register------------------------------------

app.post('/api/user/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: "Internal server error." });
        }

        if (results.length > 0) {
            // Login successful
            return res.json({
                success: true,
                user_id: results[0].user_id,
                message: "Login successful.",
            });
        } else {
            // Invalid credentials
            return res.status(401).json({ message: "Invalid email or password." });
        }
    });
});

app.post('/api/user/register', (req, res) => {
    const { email, password } = req.body;

    const query = 'INSERT INTO user (email, password) VALUES (?, ?)';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            console.error('Error during registration:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.status(201).json({ success: true, message: 'Registration successful' });
    });
});

// ---------------------------roommate page edit details------------------------------------

app.get('/api/roommate_requests/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const query = 'SELECT * FROM roommate_requests WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results[0] || null);
        }
    });
});

app.post('/api/roommate_requests/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const { name, age, gender, profession, room_sharing,location, address, description, requirements, contact, email, pictures } = req.body;

    const checkQuery = `SELECT * FROM roommate_requests WHERE user_id = ?`;
    db.query(checkQuery, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (results.length > 0) {
            // Record exists, update it
            const updateQuery = `
                UPDATE roommate_requests
                SET 
                    name = ?, 
                    age = ?, 
                    gender = ?, 
                    profession = ?, 
                    room_sharing = ?, 
                    location = ?, 
                    address = ?, 
                    description = ?, 
                    requirements = ?, 
                    contact = ?,
                    email = ?,
                    pictures = ?
                WHERE user_id = ?
            `;
            db.query(updateQuery, [name, age, gender, profession, room_sharing, location, address, description, requirements, contact, email, pictures, userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    res.status(500).json({ error: 'Database error' });
                } else {
                    res.json({ success: true, message: 'Record updated successfully.' });
                }
            });
        } else {
            // Record does not exist, insert a new one
            const insertQuery = `
                INSERT INTO roommate_requests (user_id, name, age, gender, profession, room_sharing,location, address, description, requirements, contact, email, pictures)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(insertQuery, [userId, name, age, gender, profession, room_sharing, location, address, description, requirements, contact, email, pictures], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    res.status(500).json({ error: 'Database error' });
                } else {
                    res.json({ success: true, message: 'New record created successfully.' });
                }
            });
        }
    });
});

// ---------------------------------------admin page delete -----------------------------


// Route to get all pending accommodation requests
app.get('/api/admin/accommodation-requests', (req, res) => {
    const query = `SELECT * FROM accommodation_requests`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json(results);
    });
});

// Reject an accommodation request
app.delete('/api/admin/reject-accommodation/:id', (req, res) => {
    const requestId = req.params.id;

    const query = `DELETE FROM accommodation_requests WHERE request_id = ?`;
    db.query(query, [requestId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({ success: true, message: 'Request rejected successfully' });
    });
});


app.delete('/api/accommodation/:id', (req, res) => {
    const query = 'DELETE FROM accommodation WHERE accommodation_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) {
            console.error('Error deleting accommodation:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(200).json({ message: 'Accommodation deleted successfully' });
        }
    });
});

app.delete('/api/roommate/:id', (req, res) => {
    const query = 'DELETE FROM roommate_requests WHERE request_id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) {
            console.error('Error deleting roommate request:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.status(200).json({ message: 'Roommate request deleted successfully' });
        }
    });
});

// ---------------------------admin page accommodation and user search------------------------------------

app.get('/api/admin/accommodation', (req, res) => {
    const { query } = req.query; // Get the search query from the URL

    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const sql = `
        SELECT * 
        FROM accommodation 
        WHERE 
            accommodation_name LIKE ? 
            OR location LIKE ?
            OR address LIKE ?
            OR landmark LIKE ?
            OR description LIKE ?
            OR facilities LIKE ?
            OR restrictions LIKE ?
    `;

    // Prepare the values for each search field
    const searchQuery = `%${query}%`;

    db.query(sql, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery], (err, results) => {
        if (err) {
            console.error('Error fetching accommodation:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


app.get('/api/admin/user', (req, res) => {
    const { query } = req.query; // Get the search query from the URL
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const sql = 'SELECT * FROM roommate_requests WHERE name LIKE ?';
    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});




app.get('/api/locations', (req, res) => {
    const query = 'SELECT DISTINCT location FROM location';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results); // Return the list of locations
    });
});

// Fetch accommodations for a specific location
app.get('/api/accommodation-location', (req, res) => {
    const location = req.query.location;
    const query = `SELECT 
                    a.accommodation_id, 
                    a.accommodation_name, 
                    a.address,
                    a.price,
                    a.total_rooms,
                    a.pictures,
                    a.contact,
                    a.location, 
                    l.latitude, 
                    l.longitude
                FROM accommodation a
                JOIN location l ON a.accommodation_id = l.accommodation_id
                WHERE l.location = ?`;
    db.query(query, [location], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

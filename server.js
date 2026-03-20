const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5001; // Node servers usually run on port 5000

// Middleware: Allow React to talk to this API
app.use(cors());
app.use(express.json());

// Connect to your existing Python-created database!
const dbPath = path.resolve(__dirname, 'job_tracker.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('[-] Error opening database:', err.message);
    } else {
        console.log('[+] Connected to the SQLite database.');
    }
});

// --- API ROUTES ---

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Node.js Job Tracker API!" });
});

app.get('/api/jobs/recent', (req, res) => {
    const query = `
        SELECT id, title, company, location, url, experience_level, tech_stack, salary 
        FROM jobs 
        ORDER BY id DESC 
        LIMIT 20
    `;

    // db.all() grabs all the rows and turns them into an array of JS objects
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`[+] Node Server is running on http://localhost:${PORT}`);
});
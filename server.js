const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const passport = require('./passportConfig');
const { insertUser, insertAdmin } = require('./UserLogin');
const { sendEmail, sendSMS } = require('./notification');
const studentFaculty = require('./studentFaculty');
const { getAllUsers } = require('./Database'); // Importing getAllUsers for admin signup

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_Secret = process.env.JWT_SECRET || 'neha'; // Use environment variable for secret key
const tokenBlacklist = new Set();

app.use(bodyParser.json());
app.use(cors());

// Basic Server Route
app.get('/', (req, res) => {
    res.send("Hello World");
});

// User Signup Route
app.post('/signup', async (req, res) => {
    const { username, age, email, mobile, aadhar, password } = req.body;
    if (!username || !age || !email || !mobile || !aadhar || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await insertUser(username, age, email, mobile, aadhar, hashedPassword);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (err.message === 'User already exists') {
            res.status(409).json({ message: "User already exists" });
        } else {
            console.log("Error occurred while registering", err);
            res.status(500).json({ message: "Failed to register user" });
        }
    }
});

// User Login Route
app.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: info.message });
        }

        const token = jwt.sign({ username: user.USERNAME, role: user.ROLE }, JWT_Secret, { expiresIn: '9h' });
        try {
            sendEmail(user.EMAIL, 'Login Notification', 'You have successfully logged in.');
            sendSMS(user.MOBILE, 'You have successfully logged in.');
        } catch (error) {
            console.log("Error sending notifications", error);
        }
        res.json({ token, user });
    })(req, res, next);
});

// Admin Signup Route
app.post('/admin/signup', async (req, res) => {
    const { username, age, email, mobile, aadhar, password } = req.body;
    if (!username || !age || !email || !mobile || !aadhar || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await insertAdmin(username, age, email, mobile, aadhar, hashedPassword);
        res.status(201).json({ message: "Admin registered successfully", admin: result });
    } catch (err) {
        if (err.message === 'Admin already exists') {
            res.status(409).json({ message: "Admin already exists" });
        } else {
            console.log("Error occurred while registering admin", err);
            res.status(500).json({ message: "Failed to register admin" });
        }
    }
});

// Admin Login Route
app.post('/admin/login', (req, res, next) => {
    passport.authenticate('admin', { session: false }, (err, admin, info) => {
        if (err || !admin) {
            return res.status(400).json({ message: info.message });
        }

        const token = jwt.sign({ username: admin.USERNAME, role: 'admin' }, JWT_Secret, { expiresIn: '9h' });
        res.json({ token });
    })(req, res, next);
});

// Middleware to verify the JWT Token and check role
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    jwt.verify(token, JWT_Secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded; // Ensure req.user includes both username and role
        next();
    });
}

// Logout Route for users
app.post('/logout', (req, res) => {
    const token = req.body.token;
    if (token) {
        tokenBlacklist.add(token);
        res.status(200).json({ message: "Successfully Logged Out" });
    } else {
        res.status(401).json({ message: "Please provide a valid token to logout successfully" });
    }
});

// Admin Logout Route
app.post('/admin/logout', (req, res) => {
    const token = req.body.token;
    if (token) {
        tokenBlacklist.add(token);
        res.status(200).json({ message: "Successfully logged out as admin" });
    } else {
        res.status(401).json({ message: "Please provide a valid token to logout successfully" });
    }
});

// Accessing the Protected Route
app.use('/api', verifyToken, studentFaculty);

// Initialize Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

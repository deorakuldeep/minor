const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Assume you have a DB config file
const teacherRoutes = require('./routes/teacherRoutes');
const cors = require('cors'); // Required for frontend communication

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json()); // Body parser middleware
app.use(cors()); // Allow all origins for development (configure in production)

// Use the Teacher Routes
app.post('/api/teacher/login', (req, res) => {
    // If the server hits this, the 404 is fixed!
    console.log("SUCCESS: SERVER HIT THE POST ROUTE!");
    res.json({ message: "Login endpoint reached." });
});
app.use('/api/teacher', teacherRoutes);

// --- Your other routes (Admin, Student, Registration, etc.) would go here ---
// app.use('/register_student', yourRegistrationRoute); 

// Basic Error Handling Middleware (optional but recommended)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
const express = require('express');
const asyncHandler = require('express-async-handler');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Student = require('../models/Student'); // Assuming you have a Student Model
const Attendance = require('../models/Attendance');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------------------------------------------------- //
// 1. POST /api/teacher/login - Public Route
// ---------------------------------------------------------------- //
router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const teacher = await Teacher.findOne({ username });

    if (teacher && (await teacher.matchPassword(password))) {
        res.json({
            _id: teacher._id,
            username: teacher.username,
            name: `${teacher.firstName} ${teacher.lastName}`,
            token: generateToken(teacher._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid username or password');
    }
}));

// ---------------------------------------------------------------- //
// 2. GET /api/teacher/classes - Protected Route
//    (Fetches ONLY classes assigned to the logged-in teacher)
// ---------------------------------------------------------------- //
router.get('/classes', protect, asyncHandler(async (req, res) => {
    // req.teacher is available from the 'protect' middleware
    const teacherId = req.teacher._id;

    // Data Scoping: Find all classes where the 'teacher' field matches the logged-in teacher's ID
    const classes = await Class.find({ teacher: teacherId }).select('name subject semester branch');

    res.json({ classes });
}));

// ---------------------------------------------------------------- //
// 3. GET /api/teacher/class/:classId/students - Protected Route
//    (Fetches students for a specific class, ensuring teacher is assigned)
// ---------------------------------------------------------------- //
router.get('/class/:classId/students', protect, asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const teacherId = req.teacher._id;

    // Authorization Check: Find the class AND ensure the logged-in teacher is assigned to it
    const classData = await Class.findOne({ _id: classId, teacher: teacherId }).populate('students');

    if (!classData) {
        res.status(403);
        throw new Error('Access Denied: Class not found or not assigned to this teacher');
    }

    // Return the list of students (populated)
    res.json({ students: classData.students });
}));

// ---------------------------------------------------------------- //
// 4. POST /api/teacher/attendance - Protected Route
//    (Marks attendance for a student)
// ---------------------------------------------------------------- //
router.post('/attendance', protect, asyncHandler(async (req, res) => {
    const { studentId, classId, date, status } = req.body;
    const teacherId = req.teacher._id;

    // Input Validation
    if (!studentId || !classId || !date || !status || !['Present', 'Absent'].includes(status)) {
        res.status(400);
        throw new Error('Invalid data provided for attendance.');
    }

    // Authorization Check (Crucial): Ensure the teacher is authorized to mark this class
    const classCheck = await Class.findOne({ _id: classId, teacher: teacherId });
    if (!classCheck) {
        res.status(403);
        throw new Error('Access Denied: Cannot mark attendance for an unassigned class.');
    }

    // Convert date to start of day to ensure unique index works correctly
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Update or Insert Attendance Record (Upsert)
    const attendanceRecord = await Attendance.findOneAndUpdate(
        { 
            student: studentId, 
            class: classId, 
            date: attendanceDate // Use the unique index fields
        },
        { 
            status, 
            markedBy: teacherId, 
            // set the date again, just in case it's a new record
            date: attendanceDate 
        },
        { 
            new: true, 
            upsert: true, // Create a new document if one doesn't exist
            setDefaultsOnInsert: true 
        }
    );

    res.status(200).json({ 
        message: 'Attendance recorded successfully', 
        attendanceId: attendanceRecord._id,
        status: attendanceRecord.status
    });
}));

module.exports = router;
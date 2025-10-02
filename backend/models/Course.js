const mongoose = require('mongoose');

// Renamed from ClassSchema to CourseSchema
const CourseSchema = new mongoose.Schema({
    name: { // e.g., "CS 501"
        type: String,
        required: true,
        trim: true
    },
    subject: { // e.g., "Data Structures"
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    // Reference to the Teacher who teaches this course
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    // Array of references to enrolled students
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, { timestamps: true });

// Renamed the model export from Class to Course
const Course = mongoose.model('Course', CourseSchema); 
module.exports = Course;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all required components
import RegistrationForm from './components/RegistrationForm'; // Your original component
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import AttendanceManager from './pages/AttendanceManager';
import Gate from './components/Gate'; // The route protector

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* --- Protected Routes (Teacher Portal) --- */}
          {/* Only users with a 'teacherToken' can access nested routes */}
          <Route element={<Gate role="teacher" />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/class/:classId" element={<AttendanceManager />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
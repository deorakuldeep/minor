import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AttendanceManager = () => { // <--- RENAMED COMPONENT
    const { classId } = useParams(); // Gets the ID from the URL
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State to hold today's attendance status (key: studentId, value: 'Present' or 'Absent')
    const [attendanceStatus, setAttendanceStatus] = useState({});

    useEffect(() => {
        const fetchStudents = async () => {
            const token = localStorage.getItem('teacherToken');
            
            if (!token) {
                navigate('/teacher/login');
                return;
            }

            try {
                // 1. Fetch Students for this specific class
                const studentsResponse = await fetch(`http://localhost:5000/api/teacher/class/${classId}/students`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!studentsResponse.ok) {
                    // Handle 401/403 or other errors (e.g., if teacher isn't assigned to this class)
                    if (studentsResponse.status === 401 || studentsResponse.status === 403) {
                         localStorage.removeItem('teacherToken');
                         navigate('/teacher/login');
                         throw new Error('Access denied or session expired.');
                    }
                    throw new Error('Failed to load class data.');
                }
                
                const data = await studentsResponse.json();
                setStudents(data.students); 
                
                // 2. Initialize attendance status (set all to Absent by default, or load from backend)
                const initialAttendance = data.students.reduce((acc, student) => {
                    // NOTE: In a production app, you would fetch today's status here
                    acc[student._id] = 'Absent'; 
                    return acc;
                }, {});
                setAttendanceStatus(initialAttendance);
                setLoading(false);

            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchStudents();
    }, [classId, navigate]);

    const handleMarkAttendance = async (studentId, status) => {
        const token = localStorage.getItem('teacherToken');
        
        // Optimistic UI update: update state immediately
        setAttendanceStatus(prev => ({ ...prev, [studentId]: status })); 

        try {
            const response = await fetch('http://localhost:5000/api/teacher/attendance', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    studentId, 
                    classId, 
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                    status,
                }),
            });

            if (!response.ok) {
                // If API fails, revert the optimistic update
                setAttendanceStatus(prev => ({ ...prev, [studentId]: status === 'Present' ? 'Absent' : 'Present' }));
                throw new Error('Failed to update attendance on server.');
            }
            console.log(`Attendance marked for ${studentId}: ${status}`);

        } catch (err) {
            console.error(err.message);
            alert(`Attendance update failed for student ${studentId}. UI reverted.`);
            // Update error message or handle notification
        }
    };

    if (loading) return <div className="loading">Loading student list...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="class-attendance-container">
            <h2>Attendance Manager for Class {classId}</h2>
            <button className="btn-back" onClick={() => navigate('/teacher/dashboard')}>
                &larr; Back to Classes
            </button>

            {students.length === 0 ? (
                <p>No students registered in this class.</p>
            ) : (
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td>{student.rollNo}</td>
                                <td>{student.firstName} {student.lastName}</td>
                                <td className={`status-cell status-${attendanceStatus[student._id]}`}>
                                    {attendanceStatus[student._id]}
                                </td>
                                <td>
                                    <button 
                                        onClick={() => handleMarkAttendance(student._id, 'Present')}
                                        disabled={attendanceStatus[student._id] === 'Present'}
                                        className="btn-present"
                                    >
                                        Present
                                    </button>
                                    <button 
                                        onClick={() => handleMarkAttendance(student._id, 'Absent')}
                                        disabled={attendanceStatus[student._id] === 'Absent'}
                                        className="btn-absent"
                                    >
                                        Absent
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
             {/* Basic CSS for the table and buttons (for quick integration) */}
             <style jsx="true">{`
                .class-attendance-container { max-width: 900px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-back { margin-bottom: 20px; padding: 10px 15px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; transition: background 0.3s; }
                .btn-back:hover { background: #e0e0e0; }
                .student-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .student-table th, .student-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .student-table th { background-color: #f4f4f4; }
                .status-cell { font-weight: bold; }
                .status-Present { color: #28a745; }
                .status-Absent { color: #dc3545; }
                .btn-present, .btn-absent { padding: 8px 12px; margin-right: 10px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: opacity 0.2s, background 0.3s; }
                .btn-present { background-color: #28a745; color: white; }
                .btn-absent { background-color: #dc3545; color: white; }
                .btn-present:disabled, .btn-absent:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default AttendanceManager;
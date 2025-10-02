import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            const token = localStorage.getItem('teacherToken');
            if (!token) {
                // If no token, redirect to login
                navigate('/teacher/login'); 
                return;
            }

            try {
                // Backend ensures only assigned classes are returned (Data Scoping)
                const response = await fetch('http://localhost:5000/api/teacher/classes', {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch classes. Access denied or token expired.');
                }

                const data = await response.json();
                setClasses(data.classes); // Assume backend returns { classes: [...] }
                setLoading(false);

            } catch (err) {
                setError(err.message);
                setLoading(false);
                // In case of 401/403, clear token and redirect
                if (err.message.includes('Access denied')) {
                     localStorage.removeItem('teacherToken');
                     navigate('/teacher/login');
                }
            }
        };

        fetchClasses();
    }, [navigate]);

    const handleClassClick = (classId) => {
        // Navigate to the detail view for attendance marking
        navigate(`/teacher/class/${classId}`);
    };

    if (loading) return <p>Loading classes...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="dashboard-container">
            <h2>My Assigned Classes</h2>
            {classes.length === 0 ? (
                <p>You are not currently assigned to any classes.</p>
            ) : (
                <div className="class-list">
                    {classes.map((cls) => (
                        <div 
                            key={cls._id} 
                            className="class-card" 
                            onClick={() => handleClassClick(cls._id)}
                        >
                            <h3>{cls.name}</h3>
                            <p>Subject: {cls.subject}</p>
                            <p>Semester: {cls.semester}</p>
                            <p>Click to take attendance.</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
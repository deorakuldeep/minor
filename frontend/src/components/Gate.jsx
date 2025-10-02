import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Gate Component
 * Acts as a security checkpoint, checking for a role-specific token 
 * before allowing access to the protected route content.
 */
const Gate = ({ role = 'teacher' }) => { // <--- RENAMED COMPONENT
    // The token key is dynamically created, e.g., 'teacherToken'
    const token = localStorage.getItem(`${role}Token`); 

    // If no token is found, redirect to the corresponding login page
    if (!token) {
        return <Navigate to={`/${role}/login`} replace />;
    }

    // If the token is present, grant access by rendering the nested route content
    return <Outlet />;
};

export default Gate;
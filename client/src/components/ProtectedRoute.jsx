import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session } = UserAuth();
  const navigate = useNavigate();

  // If session is explicitly null (not undefined, which is the initial state), 
  // the user is not authenticated
  if (session === null) {
    return <Navigate to="/signin" />;
  }

  // When we have a defined session state (either logged in or not)
  if (session !== undefined) {
    // If we have session data, render the children
    if (session) {
      return children;
    } else {
      // Otherwise redirect to signin
      return <Navigate to="/signin" />;
    }
  }

  // Return null while still loading the session
  return null;
};

export default ProtectedRoute; 
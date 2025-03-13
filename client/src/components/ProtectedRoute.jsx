import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, hasRole } = UserAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      if (requireAdmin) {
        const isAdmin = await hasRole("admin");
        setAuthorized(isAdmin);
      } else {
        setAuthorized(true);
      }

      setChecking(false);
    };

    if (!loading) {
      checkAuthorization();
    }
  }, [user, loading, requireAdmin, hasRole]);

  if (loading || checking) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default ProtectedRoute; 
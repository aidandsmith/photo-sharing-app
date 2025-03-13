import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:3000";

const Dashboard = () => {
  const { user, signOut, hasRole } = UserAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await hasRole("admin");
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Error checking admin status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [hasRole]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const result = await signOut();
      if (result.success) {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Error Loading Dashboard</h1>
        <p className="mb-4">{error}</p>
        <button 
          onClick={handleSignOut} 
          className="px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <h2 className="text-xl mb-4">Welcome, {user?.email}</h2>
      
      {loading ? (
        <p>Checking permissions...</p>
      ) : (
        <>
          {isAdmin && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
              <p className="mb-3">You have administrator privileges.</p>
              <Link to="/admin">
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </>
      )}
      
      <div className="mt-6">
        <button 
          onClick={handleSignOut} 
          className="px-4 py-3 bg-green-500 text-white rounded"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const Dashboard = () => {
  const { user, signOut } = UserAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error("No authentication token");
        }
        
        const response = await fetch(`${API_URL}/api/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <h2 className="text-xl mb-4">Welcome, {user?.email}</h2>
      <div>
        <button 
          onClick={handleSignOut} 
          className="px-4 py-3 mt-6 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
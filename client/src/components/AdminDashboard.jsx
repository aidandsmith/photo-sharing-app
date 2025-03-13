import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000";

const AdminDashboard = () => {
  const { user } = UserAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-4">
        <p>Logged in as: {user?.email}</p>
      </div>
    </div>
  );
};

export default AdminDashboard; 
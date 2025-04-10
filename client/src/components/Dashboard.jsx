import React, { useState, useEffect } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const API_URL = "http://localhost:3000";

const Dashboard = () => {
  const { user, session, signOut, hasRole } = UserAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [bio, setBio] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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
    fetchUserProfile();
  }, [hasRole, user]);

  // Fetch user profile data including bio
  const fetchUserProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setBio(data.bio || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Update user bio
  const handleUpdateBio = async (e) => {
    e.preventDefault();
    setBioLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          bio,
          updated_at: new Date()
        });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Bio updated successfully");
      }
    } catch (err) {
      console.error("Error updating bio:", err);
      setError("Failed to update bio");
    } finally {
      setBioLoading(false);
    }
  };

  // Update user email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    if (!newEmail) {
      setError("Email is required");
      setEmailLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Verification email sent. Please check your inbox to confirm the email change.");
        setNewEmail("");
      }
    } catch (err) {
      console.error("Error updating email:", err);
      setError("Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  // Update user password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setPasswordLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      const result = await signOut();
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Failed to sign out");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    }
  };

  if (error) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-6 text-red-400">Error Loading Dashboard</h1>
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
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* User Info Section */}
      <div className="mb-8 p-4  rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Information</h2>
        <p>Logged in as: <span className="font-medium text-gray-300">{user?.email}</span></p>
        {isAdmin && (
          <p className="mt-2 text-green-400">
            You have admin access. <Link to="/admin" className="underline">Go to Admin Dashboard</Link>
          </p>
        )}
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-3 bg-green-900 text-green-300 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Profile Management Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Manage Your Profile</h2>
        
        {/* Update Bio */}
        <div className="mb-6 p-4 rounded shadow-sm">
          <h3 className="text-lg font-medium mb-3">Your Bio</h3>
          <form onSubmit={handleUpdateBio}>
            <div className="mb-3">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 border rounded bg-[#171718] text-white border-gray-600"
                rows="4"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={bioLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {bioLoading ? "Updating..." : "Update Bio"}
            </button>
          </form>
        </div>
        
        {/* Update Email */}
        <div className="mb-6 p-4 rounded shadow-sm">
          <h3 className="text-lg font-medium mb-3">Update Email</h3>
          <form onSubmit={handleUpdateEmail}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-300">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-3 border rounded bg-[#171718] text-white border-gray-600"
                placeholder="Enter new email address"
                required
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {emailLoading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>
        
        {/* Change Password */}
        <div className="p-4 rounded shadow-sm">
          <h3 className="text-lg font-medium mb-3">Change Password</h3>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded bg-[#171718] text-white border-gray-600"
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded bg-[#171718] text-white border-gray-600"
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {passwordLoading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
      
      {/* Sign Out Button */}
      <div>
        <button 
          onClick={handleSignOut} 
          className="px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
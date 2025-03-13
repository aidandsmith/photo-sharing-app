import { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();
const API_URL = "http://localhost:3000"; // Change to your server URL

// Stores JWT token
const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Get token
const getToken = () => {
  return localStorage.getItem('authToken');
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If token is invalid, clear it
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign up function
  const signUpNewUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Signup error:", data.error);
        return { success: false, error: data.error };
      }

      if (data.token) {
        setToken(data.token);
        setUser(data.user);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign in function
  const signInUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Signin error:", data.error);
        return { success: false, error: data.error };
      }

      setToken(data.token);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      console.error("Signin error:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    const token = getToken();
    
    if (!token) {
      setUser(null);
      return { success: true };
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      // Always clear token on the client side regardless of server response
      setToken(null);
      setUser(null);
      
      if (!response.ok) {
        const data = await response.json();
        console.error("Signout error:", data.error);
      }

      return { success: true };
    } catch (error) {
      console.error("Signout error:", error);
      setToken(null);
      setUser(null);
      return { success: true, error: error.message };
    }
  };

  // Check if user has a specific role
  const hasRole = async (role) => {
    if (!user) return false;
    
    const token = getToken();
    if (!token) return false;

    try {
      // For admins, check the admin dashboard endpoint
      if (role === "admin") {
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        return response.ok;
      }

      return false;
    } catch (error) {
      console.error("Role check error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUpNewUser,
        signInUser,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
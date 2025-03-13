import { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();
const API_URL = "http://localhost:3000";

// Store token in localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if token, and validate
  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setUser(null);
        setLoading(false);
        setAuthInitialized(true);
        return;
      }
      
      try {
        // Validate the token with the server
        const response = await fetch(`${API_URL}/auth/validate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.valid) {
          console.log("Token validated successfully", data.user);
          setUser(data.user);
        } else {
          console.log("Token invalid, clearing", data.error);
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    validateToken();
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

      console.log("Sign in successful:", data);
      
      if (data.token) {
        console.log("Saving token and user data");
        setToken(data.token);
        setUser(data.user);
      } else {
        console.error("No token received from server");
      }
      
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
        authInitialized,
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
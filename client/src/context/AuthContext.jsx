import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [session, setSession] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        setUser(currentSession.user);
      }
      
      // Setup auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
      );
      
      setLoading(false);
      setAuthInitialized(true);
      
      // Cleanup subscription
      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  // Sign up function using Supabase directly
  const signUpNewUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error("Signup error:", error.message);
        return { success: false, error: error.message };
      }

      // Note: Supabase may require email verification by default
      // so the user might not be immediately signed in
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign in function using Supabase directly
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Signin error:", error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Signin error:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign out function using Supabase directly
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Signout error:", error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      setSession(null);
      
      return { success: true };
    } catch (error) {
      console.error("Signout error:", error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has admin role - this may need to be adapted based on your setup
  const hasRole = async (role) => {
    if (!user) return false;
    
    if (role === "admin") {
      // This is a simple check - you might want to add a custom claim or use RLS in Supabase
      // For now, just checking if user exists
      return Boolean(user);
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
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
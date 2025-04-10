import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, session, signInUser } = UserAuth();
  const navigate = useNavigate();
  
  // If user is already signed in, redirect to dashboard
  if (user && session) {
    return <Navigate to="/dashboard" />;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signInUser(email, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSignIn} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-4 text-center">Sign In</h2>
        <p className="text-center">Don't have an account? <Link to= '/signup'>Sign up</Link></p>
        <div className="flex flex-col gap-5 mt-5">
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            className="p-4 mt-2" 
            placeholder="Email" 
            type="email" 
            required
          />
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            className="p-4 mt-2" 
            placeholder="Password" 
            type="password" 
            required
          />
          <button 
            className="bg-green-500 p-4 text-white rounded hover:bg-green-600" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          {error && <p className="text-red-600 font-medium pt-4 text-center">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default Signin;
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user, session, signUpNewUser } = UserAuth();
  const navigate = useNavigate();
  
  // If user is already signed in, redirect to dashboard
  if (user && session) {
    return <Navigate to="/dashboard" />;
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      const result = await signUpNewUser(email, password);

      if (result.success) {
        if (result.data?.session) {
          // If we get a session back, user is signed in
          navigate('/dashboard');
        } else {
          // Email confirmation may be required - show message
          setSuccessMessage('Please check your email for a confirmation link before signing in.');
          setEmail('');
          setPassword('');
        }
      } else {
        setError(result.error || 'Failed to create account');
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
      <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-4 text-center">Sign Up</h2>
        <p className="text-center">Already have an account? <Link to= '/signin'>Sign in</Link></p>
        <div className="flex flex-col gap-5 mt-5">
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email}
            className="p-4 mt-2" 
            placeholder="Email" 
            type="email"
            required 
          />
          <input 
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="p-4 mt-2" 
            placeholder="Password" 
            type="password"
            required
            minLength="6" 
          />
          <button 
            className="bg-green-500 p-4 text-white rounded hover:bg-green-600" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          {error && <p className="text-red-600 font-medium pt-4 text-center">{error}</p>}
          {successMessage && <p className="text-green-600 font-medium pt-4 text-center">{successMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default Signup;
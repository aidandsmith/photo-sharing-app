import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const { session, signUpNewUser } = UserAuth();
  const navigate = useNavigate();
  console.log(session);

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signUpNewUser(email, password);

      if(result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError ('an error occured');
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
            className="p-4 mt-2" 
            placeholder="Email" 
            type="email" 
          />
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            className="p-4 mt-2" 
            placeholder="Password" 
            type="password" 
          />
          <button className="bg-green-500" type="submit" disabled={loading}>Sign Up</button>
          { error && <p className="text-red-600 font-medium pt-4 text-center">{error}</p>}
        </div>
      </form>
    </div>
  )
}

export default Signup
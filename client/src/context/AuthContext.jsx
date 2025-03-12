import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
  const [session, setSession] = useState(undefined)

  // Sign up func 
  const signUpNewUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email, 
      password: password,
    });

    if(error) {
      console.error("there was a problem with the sign up", error);
      return { success: false, error };
    }
    return {success: true, data};
  };

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  },[])

  //Sign in func
  const signInUser = async ( email, password ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.error('sign in error occured: ', error);
        return { success: false, error: error.message};
      }
      console.log("sign in success: ", data);
      return { success: true, data};
    } catch(error) {
      console.error("an error occured: ", error);
    }
  };

  //Sign out func
  const signOut = () => {
    const { error } = supabase.auth.signOut();
    if(error) {
      console.error("an error occcured:", error)
    }
  };
  
  return (
    <AuthContext.Provider value={{session, signUpNewUser, signInUser, signOut}}>
      {children}
    </AuthContext.Provider>
  )
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
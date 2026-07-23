"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase';
import { User } from '@supabase/supabase-js'; // Added type import

export const AuthPanel = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState<User | null>(null); // Updated type
    const [authMessage, setAuthMessage] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user || null);
        });
    
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });
    
        return () => subscription.unsubscribe();
      }, []);

      const handleSignUp = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setAuthMessage("Signing up...");
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setAuthMessage(`❌ ${error.message}`);
        else setAuthMessage("✅ Success! (Click the confirmation link in your email)");
      };
    
      const handleSignIn = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setAuthMessage("Signing in...");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthMessage(`❌ ${error.message}`);
        else setAuthMessage("✅ Signed in successfully!");
      };
    
      const handleSignOut = async () => {
        await supabase.auth.signOut();
        setAuthMessage("Signed out.");
      };
    
    return (
        // Changed w-80 to w-full so it adapts to its parent container perfectly
        <div className="flex flex-col gap-4 w-full bg-[#f0f0f0]/50 p-6 border border-[#f0f0f0] rounded-lg">
          <h2 className="text-2xl font-semibold mb-2 text-[#333]">Account</h2>
          
          {user ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#119f98] font-medium">Logged in as:</p>
              <p className="text-xs truncate bg-[#f0f0f0] p-2 rounded">{user.email}</p>
              <button 
                onClick={handleSignOut}
                className="mt-4 bg-[#f0f0f0] text-[#333] font-bold py-2 px-4 rounded hover:bg-[#e0e0e0] transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-[#f0f0f0] p-2 rounded outline-none focus:border-[#ff0080] bg-white"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-[#f0f0f0] p-2 rounded outline-none focus:border-[#ff0080] bg-white"
              />
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={handleSignIn}
                  className="flex-1 bg-[#2873b5] text-white font-bold py-2 rounded hover:opacity-90 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUp}
                  className="flex-1 border border-[#2873b5] text-[#2873b5] font-bold py-2 rounded hover:bg-[#2873b5]/10 transition"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}
          {authMessage && (
            <p className="text-sm mt-2 text-center font-medium text-[#8a2be2]">{authMessage}</p>
          )}
        </div>
    )
}
"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // Updated to use @supabase/ssr
import { useRouter } from 'next/navigation';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  // Initialize the browser-specific client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else if (data.user) {
        // Successful login!
        // We use window.location.href for a 'hard' redirect. 
        // This ensures the Middleware sees the new session immediately.
        window.location.href = '/'; 
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Check your internet connection.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FootwearPro Login</h1>
          <p className="text-gray-500 text-sm">Owner & Sales Officer Access Only</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Checking..." : <><LogIn size={20}/> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}

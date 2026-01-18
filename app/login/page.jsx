"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Lock, Mail, LogIn } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Login Failed: " + error.message);
    } else {
      router.push('/'); // Send to Dashboard on success
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FootwearPro Access</h1>
          <p className="text-gray-500 text-sm">Please sign in to manage tours & stock</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            {loading ? "Authenticating..." : <><LogIn size={20}/> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}

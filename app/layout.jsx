"use client";
export const dynamic = 'force-dynamic';

import './globals.css';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Box, ShoppingCart, 
  Banknote, Building2, FileText, LogOut, Plus 
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <nav className="bg-blue-900 text-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">FootwearPro</h1>
              <div className="space-x-6 hidden md:flex">
                 <Link href="/" className="hover:text-blue-200">Home</Link>
                 <Link href="/inventory/status" className="hover:text-blue-200">Stock</Link>
                 <Link href="/sales/new" className="hover:text-blue-200">Sale</Link>
              </div>
              <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold">Logout</button>
            </div>
          </nav>
  
          {/* Content Area */}
          <main className="flex-grow max-w-7xl mx-auto w-full p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center space-x-1 hover:text-blue-200 transition text-sm font-medium">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center text-gray-500 hover:text-blue-700">
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </Link>
  );
}

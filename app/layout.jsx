"use client";
import React, { Suspense } from 'react'; // Added Suspense
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Box, ShoppingCart, 
  MapPin, Banknote, Building2, FileText, LogOut 
} from 'lucide-react';

// Use empty strings as fallback to prevent build-time crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RootLayout({ children }) {
  // Wrap the main return in a try-catch or ensure hooks are handled safely
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // More reliable for hard redirect
  };

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 pb-20 md:pb-0">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex flex-col min-h-screen">
            {/* ... rest of your existing nav code ... */}
            
            <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold tracking-tight">FootwearPro</span>
                  </div>
                  <div className="hidden md:flex space-x-6 items-center">
                    <NavLink href="/" icon={<LayoutDashboard size={18}/>} label="Home" />
                    <NavLink href="/inventory/status" icon={<Box size={18}/>} label="Stock" />
                    <NavLink href="/sales/new" icon={<ShoppingCart size={18}/>} label="Sale" />
                    <NavLink href="/recovery/new" icon={<Banknote size={18}/>} label="Recovery" />
                    <NavLink href="/ledger" icon={<FileText size={18}/>} label="Ledger" />
                    <button onClick={handleLogout} className="flex items-center gap-1 bg-blue-700 hover:bg-red-600 px-3 py-1.5 rounded-lg transition text-sm">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full flex justify-around py-3 z-50 shadow-lg">
               <MobileNavLink href="/" icon={<LayoutDashboard size={20}/>} label="Home" />
               <MobileNavLink href="/inventory/status" icon={<Box size={20}/>} label="Stock" />
               <MobileNavLink href="/sales/new" icon={<ShoppingCart size={20}/>} label="Sale" />
               <MobileNavLink href="/recovery/new" icon={<Banknote size={20}/>} label="Recovery" />
               <button onClick={handleLogout} className="flex flex-col items-center text-gray-500">
                  <LogOut size={20} />
                  <span className="text-[10px] mt-1 font-medium">Exit</span>
               </button>
            </div>
          </div>
        </Suspense>
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

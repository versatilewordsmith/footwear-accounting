"use client";
export const dynamic = 'force-dynamic';

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
      <body className="bg-gray-100 text-gray-900 pb-20 md:pb-0">
        <Suspense fallback={<div className="p-10 text-center">Loading FootwearPro...</div>}>
          <div className="flex flex-col min-h-screen">
            
            {!isLoginPage && (
              <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold tracking-tight border-r pr-4 border-blue-700">FootwearPro</span>
                      
                      <div className="hidden md:flex space-x-4 items-center">
                        <NavLink href="/" icon={<LayoutDashboard size={18}/>} label="Home" />
                        <div className="h-6 w-px bg-blue-700 mx-1"></div>
                        <NavLink href="/inventory/status" icon={<Box size={18}/>} label="Stock" />
                        <NavLink href="/inventory/in" icon={<Plus size={18}/>} label="Stock-In" />
                        <div className="h-6 w-px bg-blue-700 mx-1"></div>
                        <NavLink href="/sales/new" icon={<ShoppingCart size={18}/>} label="Sale" />
                        <NavLink href="/recovery/new" icon={<Banknote size={18}/>} label="Recovery" />
                        <NavLink href="/payments" icon={<Building2 size={18}/>} label="Supplier" />
                        <div className="h-6 w-px bg-blue-700 mx-1"></div>
                        <NavLink href="/ledger" icon={<FileText size={18}/>} label="Ledger" />
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition text-sm font-bold shadow-sm"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </nav>
            )}

            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>

            {!isLoginPage && (
              <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full flex justify-around py-3 z-50 shadow-lg">
                 <MobileNavLink href="/" icon={<LayoutDashboard size={20}/>} label="Home" />
                 <MobileNavLink href="/inventory/status" icon={<Box size={20}/>} label="Stock" />
                 <MobileNavLink href="/sales/new" icon={<ShoppingCart size={20}/>} label="Sale" />
                 <MobileNavLink href="/recovery/new" icon={<Banknote size={20}/>} label="Rec" />
                 <button onClick={handleLogout} className="flex flex-col items-center text-gray-500">
                    <LogOut size={20} />
                    <span className="text-[10px] mt-1 font-medium">Exit</span>
                 </button>
              </div>
            )}
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

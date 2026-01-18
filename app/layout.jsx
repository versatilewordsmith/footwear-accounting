"use client";
import './globals.css';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Box, ShoppingCart, 
  Banknote, Building2, FileText, LogOut, Plus 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Suspense fallback={<div className="p-10 text-center text-blue-600 font-bold">Loading FootwearPro...</div>}>
          <div className="flex flex-col min-h-screen">
            
            {/* DESKTOP HEADER */}
            {!isLoginPage && (
              <nav className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black tracking-tighter italic">FootwearPro</span>
                    <div className="hidden lg:flex items-center gap-5">
                      <NavLink href="/" label="Home" />
                      <NavLink href="/inventory/status" label="Stock" />
                      <NavLink href="/inventory/in" label="Stock-In" />
                      <NavLink href="/sales/new" label="Sale" />
                      <NavLink href="/recovery/new" label="Recovery" />
                      <NavLink href="/ledger" label="Ledger" />
                    </div>
                  </div>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Logout
                  </button>
                </div>
              </nav>
            )}

            {/* MAIN CONTENT AREA */}
            <main className={`flex-grow container mx-auto px-4 py-8 ${!isLoginPage ? 'pb-24' : ''}`}>
              {children}
            </main>

              {/* MOBILE BOTTOM NAVIGATION - Hidden on tablets (md) and desktops (lg) */}
              {!isLoginPage && (
                <div 
                  className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[70px] z-[1000] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
                  style={{
                    // We keep only the positioning styles that Tailwind might miss 
                    // but remove 'display: flex' from here so 'md:hidden' works.
                  }}
                >
                   <MobileLink href="/" icon={<LayoutDashboard size={22}/>} label="Home" />
                   <MobileLink href="/inventory/status" icon={<Box size={22}/>} label="Stock" />
                   <MobileLink href="/sales/new" icon={<ShoppingCart size={22}/>} label="Sale" />
                   <MobileLink href="/recovery/new" icon={<Banknote size={22}/>} label="Rec" />
                   <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-500">
                      <LogOut size={22} />
                      <span className="text-[10px] font-bold uppercase">Exit</span>
                   </button>
                </div>
              )}
            )} {/* Fixed: Changed from '}' to ')}' */}
            
          </div>
        </Suspense>
      </body>
    </html>
  );
}

// Sub-component for Desktop Links
function NavLink({ href, label }) {
  return (
    <Link href={href} className="text-sm font-semibold text-blue-100 hover:text-white transition-colors">
      {label}
    </Link>
  );
}

// Sub-component for Mobile Links
function MobileLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-gray-500 active:text-blue-600 focus:text-blue-600">
      {icon}
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </Link>
  );
}

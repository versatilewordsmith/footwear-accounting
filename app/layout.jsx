"use client";
import './globals.css';
import React, { Suspense, useState } from 'react'; // Added useState
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Box, ShoppingCart, 
  Banknote, Building2, FileText, LogOut, Plus, MoreHorizontal, X 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isLoginPage = pathname === '/login';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const toggleMenu = () => setIsMoreMenuOpen(!isMoreMenuOpen);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Suspense fallback={<div className="p-10 text-center text-blue-600 font-bold">Loading...</div>}>
          <div className="flex flex-col min-h-screen">
            
            {!isLoginPage && (
              <nav className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black tracking-tighter italic">FootwearPro</span>
                    <div className="hidden md:flex items-center gap-5">
                      <NavLink href="/" label="Home" />
                      <NavLink href="/inventory/status" label="Stock" />
                      <NavLink href="/partners" label="Partners" />
                      <NavLink href="/recovery/new" label="Recovery" />
                      <NavLink href="/payments" label="Payments" />
                      <NavLink href="/inventory/in" label="Stock-In" />
                      <NavLink href="/sales/new" label="Sale" />
                      <NavLink href="/tours" label="Tours" />
                      <NavLink href="/ledger" label="Ledger" />
                    </div>
                  </div>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Logout
                  </button>
                </div>
              </nav>
            )}

            <main className={`flex-grow container mx-auto px-4 py-8 ${!isLoginPage ? 'pb-24 md:pb-8' : ''}`}>
              {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}
            {!isLoginPage && (
              <>
                {/* The Slide-up "More" Menu Overlay */}
                {isMoreMenuOpen && (
                  <div className="fixed inset-0 bg-black/50 z-[1001] animate-in fade-in duration-300" onClick={toggleMenu}>
                    <div 
                      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <MenuTile href="/tours" icon={<CalendarDays />} label="Tours" onClick={toggleMenu} />
                        <MenuTile href="/partners" icon={<UserGroupIcon className="w-6 h-6" />} label="Partners" onClick={toggleMenu} />
                        <MenuTile href="/inventory/in" icon={<Plus />} label="Stock-In" onClick={toggleMenu} />
                        <MenuTile href="/payments" icon={<Building2 />} label="Payments" onClick={toggleMenu} />
                        <MenuTile href="/ledger" icon={<FileText />} label="Ledger" onClick={toggleMenu} />
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl font-bold border border-red-100"
                      >
                        <LogOut size={20} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[75px] z-[1000] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                   <MobileLink href="/" icon={<LayoutDashboard size={22}/>} label="Home" />
                   <MobileLink href="/inventory/status" icon={<Box size={22}/>} label="Stock" />
                   <MobileLink href="/recovery/new" icon={<Banknote size={22}/>} label="Receipt" />
                   <MobileLink href="/sales/new" icon={<ShoppingCart size={22}/>} label="Sale" />
                   <button onClick={toggleMenu} className="flex flex-col items-center gap-1 text-gray-500">
                      {isMoreMenuOpen ? <X size={22} className="text-blue-600" /> : <MoreHorizontal size={22} />}
                      <span className="text-[10px] font-bold uppercase">More</span>
                   </button>
                </div>
              </>
            )}
          </div>
        </Suspense>
      </body>
    </html>
  );
}

function NavLink({ href, label }) {
  return (
    <Link href={href} className="text-sm font-semibold text-blue-100 hover:text-white transition-colors">
      {label}
    </Link>
  );
}

function MobileLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-gray-400 focus:text-blue-600 active:text-blue-600">
      {icon}
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </Link>
  );
}

function MenuTile({ href, icon, label, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className="bg-gray-50 p-4 rounded-2xl text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[11px] font-bold text-gray-700">{label}</span>
    </Link>
  );
}

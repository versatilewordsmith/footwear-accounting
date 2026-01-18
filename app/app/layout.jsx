"use client";
import React from 'react';
import Link from 'next/link';
// 1. Added "Banknote" to the icons list below
import { LayoutDashboard, Box, ShoppingCart, MapPin, Banknote } from 'lucide-react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 pb-20 md:pb-0">
        <div className="flex flex-col min-h-screen">
          
          {/* Top Navigation Bar (Desktop) */}
          <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight">FootwearPro</span>
                </div>
                
                <div className="hidden md:flex space-x-8">
                  <NavLink href="/" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
                  <NavLink href="/inventory/new" icon={<Box size={18}/>} label="Inventory" />
                  <NavLink href="/sales/new" icon={<ShoppingCart size={18}/>} label="New Sale" />
                  {/* 2. Added Recovery link for Desktop */}
                  <NavLink href="/recovery/new" icon={<Banknote size={18}/>} label="Recovery" />
                  <NavLink href="/tour" icon={<MapPin size={18}/>} label="Tour Report" />
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full flex justify-around py-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
             <MobileNavLink href="/" icon={<LayoutDashboard size={20}/>} label="Home" />
             <MobileNavLink href="/inventory/new" icon={<Box size={20}/>} label="Stock" />
             <MobileNavLink href="/sales/new" icon={<ShoppingCart size={20}/>} label="Sale" />
             {/* 3. Added Recovery link for Mobile */}
             <MobileNavLink href="/recovery/new" icon={<Banknote size={20}/>} label="Recovery" />
             <MobileNavLink href="/tour" icon={<MapPin size={20}/>} label="Tour" />
          </div>
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
    <Link href={href} className="flex flex-col items-center text-gray-500 hover:text-blue-700 transition active:scale-90">
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </Link>
  );
}

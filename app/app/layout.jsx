"use client";
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Box, ShoppingCart, MapPin } from 'lucide-react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="flex flex-col min-h-screen">
          
          {/* Top Navigation Bar */}
          <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight">FootwearPro</span>
                </div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8">
                  <NavLink href="/" icon={<LayoutDashboard size={18}/>} label="Dashboard" />
                  <NavLink href="/inventory/new" icon={<Box size={18}/>} label="Inventory" />
                  <NavLink href="/sales/new" icon={<ShoppingCart size={18}/>} label="New Sale" />
                  <NavLink href="/tour" icon={<MapPin size={18}/>} label="Tour Report" />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Page Content */}
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>

          {/* Mobile Bottom Navigation (Best for Sales Officers in the field) */}
          <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full flex justify-around py-3 z-50">
             <MobileNavLink href="/" icon={<LayoutDashboard size={20}/>} label="Home" />
             <MobileNavLink href="/inventory/new" icon={<Box size={20}/>} label="Stock" />
             <MobileNavLink href="/sales/new" icon={<ShoppingCart size={20}/>} label="Sale" />
             <MobileNavLink href="/tour" icon={<MapPin size={20}/>} label="Tour" />
          </div>
        </div>
      </body>
    </html>
  );
}

// Small helper component for Desktop Links
function NavLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center space-x-1 hover:text-blue-200 transition">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Small helper component for Mobile Links
function MobileNavLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center text-gray-600 active:text-blue-800 focus:text-blue-800">
      {icon}
      <span className="text-[10px] mt-1">{label}</span>
    </Link>
  );
}

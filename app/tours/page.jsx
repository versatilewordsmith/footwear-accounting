"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, User, ArrowRight, CalendarDays } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function WeeklyTourPlan() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function fetchRoutes() {
      const { data } = await supabase
        .from('routes')
        .select(`
          *,
          route_cities (
            visit_order,
            cities (name)
          )
        `)
        .order('id');
      setRoutes(data || []);
    }
    fetchRoutes();
  }, []);

  return (
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link href="/tours/manage">
          <button className="bg-[#1e3a8a] text-white p-5 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white">
            <Plus size={28} strokeWidth={3} />
          </button>
        </Link>
      </div>

    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <header className="px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Weekly Tour Plan</h1>
        <p className="text-gray-500 font-medium">Fixed routing for sales officers</p>
      </header>

      <div className="space-y-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#1e3a8a] text-white p-3 rounded-2xl shadow-md">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800 uppercase">{route.day_of_week}</h2>
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase">
                    <User size={12} /> {route.officer_name}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
                {route.route_name}
              </span>
            </div>

            {/* Path of Cities */}
            <div className="flex items-center flex-wrap gap-3">
              {route.route_cities?.sort((a,b) => a.visit_order - b.visit_order).map((stop, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl group hover:bg-blue-50 hover:border-blue-200 transition-all">
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {stop.visit_order}
                    </div>
                    <span className="font-bold text-gray-700">{stop.cities?.name}</span>
                  </div>
                  {index < route.route_cities.length - 1 && (
                    <ArrowRight size={16} className="text-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

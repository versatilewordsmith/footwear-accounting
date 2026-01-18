"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, User, CalendarDays, Plus } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function TourSchedule() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    async function fetchTours() {
      // Joining with cities table to get the City Name instead of just the ID
      const { data } = await supabase
        .from('tour_schedule')
        .select(`
          id,
          day_of_week,
          officer_name,
          cities (name)
        `)
        .order('id');
      setTours(data || []);
    }
    fetchTours();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Tour Plan</h1>
          <p className="text-gray-500 font-medium">Weekly Recurring Schedule</p>
        </div>
        <button className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg hover:rotate-90 transition-transform duration-300">
          <Plus size={24} />
        </button>
      </div>

      <div className="grid gap-4">
        {tours.map((tour) => (
          <div key={tour.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{tour.day_of_week}</h2>
                  <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                    <MapPin size={14} />
                    <span>{tour.cities?.name || `City ID: ${tour.city_id}`}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                  <User size={12} /> Officer
                </div>
                <p className="text-gray-700 font-extrabold">{tour.officer_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

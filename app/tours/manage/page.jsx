"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Plus, Trash2, Save, GripVertical, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ManageTourPlan() {
  const [cities, setCities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for the "New/Edit Plan" form
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [officerName, setOfficerName] = useState('');
  const [selectedStops, setSelectedStops] = useState([]); // Array of city objects

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    const { data: cityData } = await supabase.from('cities').select('*').order('name');
    const { data: routeData } = await supabase.from('routes').select('*, route_cities(city_id)');
    setCities(cityData || []);
    setRoutes(routeData || []);
  }

  const addCityToRoute = (cityId) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    if (city && !selectedStops.find(s => s.id === city.id)) {
      setSelectedStops([...selectedStops, city]);
    }
  };

  const removeCity = (cityId) => {
    setSelectedStops(selectedStops.filter(s => s.id !== cityId));
  };

  const saveRoutePlan = async () => {
    if (!officerName || selectedStops.length === 0) return alert("Please fill all details");
    setLoading(true);

    // 1. Create/Update the Route Header
    const { data: routeHeader, error: hError } = await supabase
      .from('routes')
      .upsert({ officer_name: officerName, day_of_week: selectedDay, route_name: `${selectedDay} Route` })
      .select()
      .single();

    if (!hError) {
      // 2. Clear old stops and Insert new ones
      await supabase.from('route_cities').delete().eq('route_id', routeHeader.id);
      
      const stopsToInsert = selectedStops.map((city, index) => ({
        route_id: routeHeader.id,
        city_id: city.id,
        visit_order: index + 1
      }));

      const { error: sError } = await supabase.from('route_cities').insert(stopsToInsert);
      if (!sError) {
        alert("Plan Updated Successfully!");
        window.location.href = '/tours';
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 px-4">
      <div className="flex items-center gap-4 py-4">
        <Link href="/tours" className="p-2 bg-gray-100 rounded-xl text-gray-600"><ChevronLeft /></Link>
        <h1 className="text-2xl font-black text-gray-900">Route Designer</h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
        {/* Step 1: Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Visit Day</label>
            <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Officer Name</label>
            <input value={officerName} onChange={e => setOfficerName(e.target.value)} placeholder="e.g. Zubair"
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all" />
          </div>
        </div>

        {/* Step 2: Add Cities */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Add Cities to Route</label>
          <select onChange={(e) => addCityToRoute(e.target.value)}
            className="w-full p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold border-none outline-none">
            <option value="">Select a city to add...</option>
            {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </div>

        {/* Step 3: Arrange stops */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Stop Sequence</label>
          {selectedStops.map((city, index) => (
            <div key={city.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group">
              <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg font-black text-xs">{index + 1}</span>
              <span className="font-bold text-gray-700 flex-grow">{city.name}</span>
              <button onClick={() => removeCity(city.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          ))}
          {selectedStops.length === 0 && <p className="text-center text-gray-400 py-8 italic">No cities added yet.</p>}
        </div>

        <button disabled={loading} onClick={saveRoutePlan}
          className="w-full py-5 bg-[#1e3a8a] text-white rounded-[1.5rem] font-black shadow-xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all">
          <Save size={20} /> {loading ? 'Saving Plan...' : 'Save Weekly Plan'}
        </button>
      </div>
    </div>
  );
}

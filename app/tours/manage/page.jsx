"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Plus, Trash2, Save, ChevronLeft, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ManageTourPlan() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [officerName, setOfficerName] = useState('');
  const [selectedStops, setSelectedStops] = useState([]);

  useEffect(() => {
    fetchCities();
    loadExistingRoute(selectedDay);
  }, [selectedDay]);

  async function fetchCities() {
    const { data } = await supabase.from('cities').select('*').order('name');
    setCities(data || []);
  }

  // FUNCTION TO ALTER/LOAD EXISTING PLAN
  async function loadExistingRoute(day) {
    setLoading(true);
    const { data: route } = await supabase
      .from('routes')
      .select(`*, route_cities(visit_order, cities(*))`)
      .eq('day_of_week', day)
      .single();

    if (route) {
      setOfficerName(route.officer_name);
      // Sort by visit_order and extract city objects
      const sortedStops = route.route_cities
        .sort((a, b) => a.visit_order - b.visit_order)
        .map(rc => rc.cities);
      setSelectedStops(sortedStops);
    } else {
      setOfficerName('');
      setSelectedStops([]);
    }
    setLoading(false);
  }

  // RE-ARRANGE FUNCTIONS
  const moveUp = (index) => {
    if (index === 0) return;
    const newStops = [...selectedStops];
    [newStops[index], newStops[index - 1]] = [newStops[index - 1], newStops[index]];
    setSelectedStops(newStops);
  };

  const moveDown = (index) => {
    if (index === selectedStops.length - 1) return;
    const newStops = [...selectedStops];
    [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    setSelectedStops(newStops);
  };

  const addCityToRoute = (cityId) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    if (city && !selectedStops.find(s => s.id === city.id)) {
      setSelectedStops([...selectedStops, city]);
    }
  };

  const saveRoutePlan = async () => {
    setLoading(true);
    // 1. Update/Insert Header
    const { data: routeHeader } = await supabase
      .from('routes')
      .upsert({ officer_name: officerName, day_of_week: selectedDay, route_name: `${selectedDay} Route` }, { onConflict: 'day_of_week' })
      .select().single();

    // 2. Clear and Replace Stops
    await supabase.from('route_cities').delete().eq('route_id', routeHeader.id);
    const stopsToInsert = selectedStops.map((city, index) => ({
      route_id: routeHeader.id, city_id: city.id, visit_order: index + 1
    }));

    await supabase.from('route_cities').insert(stopsToInsert);
    alert("Route Plan Altered Successfully!");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      <div className="flex items-center justify-between py-6">
        <Link href="/tours" className="p-2 bg-gray-100 rounded-xl"><ChevronLeft /></Link>
        <h1 className="text-xl font-black">Alter Route Design</h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Select Day to Edit</label>
            <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
              className="w-full p-4 bg-blue-50 text-blue-700 rounded-2xl font-black outline-none">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Officer</label>
            <input value={officerName} onChange={e => setOfficerName(e.target.value)} 
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder="Officer Name" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Add New Stop</label>
          <select onChange={(e) => addCityToRoute(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none">
            <option value="">Choose City...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase text-gray-400 ml-2">Route Sequence (Re-arrange)</p>
          {selectedStops.map((city, index) => (
            <div key={city.id} className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveUp(index)} className="text-gray-300 hover:text-blue-600"><ArrowUp size={14}/></button>
                <button onClick={() => moveDown(index)} className="text-gray-300 hover:text-blue-600"><ArrowDown size={14}/></button>
              </div>
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg font-black text-[10px]">{index + 1}</span>
              <span className="font-bold text-gray-700 flex-grow">{city.name}</span>
              <button onClick={() => setSelectedStops(selectedStops.filter(s => s.id !== city.id))} className="text-red-300 p-2"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <button onClick={saveRoutePlan} disabled={loading}
          className="w-full py-5 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest">
          {loading ? <RefreshCcw className="animate-spin" /> : <Save size={20} />}
          Update Route Plan
        </button>
      </div>
    </div>
  );
}

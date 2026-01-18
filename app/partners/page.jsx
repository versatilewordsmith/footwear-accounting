"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
// Switched to Lucide icons which are already in your project
import { Users, Building2, MapPin, Plus, ShieldCheck } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [activeTab, setActiveTab] = useState('Customer');

  useEffect(() => {
    async function fetchPartners() {
      // Note: city_id is used, fetching city name from joined 'cities' table
      const { data } = await supabase
        .from('partners')
        .select('*, cities(name)')
        .eq('type', activeTab);
      setPartners(data || []);
    }
    fetchPartners();
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Partners</h1>
          <p className="text-gray-500 font-medium text-sm">Review credit limits and terms</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          {['Customer', 'Supplier'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === tab ? 'bg-[#1e3a8a] text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:border-blue-300 transition-all shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a8a]">
                {partner.type === 'Supplier' ? <Building2 size={24} /> : <Users size={24} />}
              </div>
              <span className="text-[10px] font-black bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest text-green-700 flex items-center gap-1">
                <ShieldCheck size={10} /> {partner.default_schema}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-gray-800 mb-1 leading-tight">{partner.name}</h3>
            <div className="flex items-center gap-1 text-gray-400 text-sm font-bold mb-6">
              <MapPin size={14} />
              <span>{partner.cities?.name || 'Loading location...'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Credit Limit</p>
                <p className="font-bold text-gray-900">Rs. {Number(partner.credit_limit).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Credit Days</p>
                <p className="font-bold text-gray-900">{partner.credit_days} Days</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button className="border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all group min-h-[220px]">
          <Plus size={40} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">New {activeTab}</span>
        </button>
      </div>
    </div>
  );
}

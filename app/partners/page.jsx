"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Building2, MapPin, Plus, ShieldCheck, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [activeTab, setActiveTab] = useState('Customer');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    city_id: 1,
    credit_limit: 0,
    credit_days: 30,
    default_schema: 'Straight'
  });

  useEffect(() => {
    fetchPartners();
  }, [activeTab]);

  async function fetchPartners() {
    // Fetching partners with their related transactions
    const { data, error } = await supabase
      .from('partners')
      .select(`
        *,
        cities(name),
        sales(total_amount),
        recovery(amount_collected),
        payments(amount_paid)
      `)
      .eq('type', activeTab);

    if (error) return;

    const processed = data.map(p => {
      const opBal = Number(p.opening_balance || 0);
      
      let currentBalance = 0;
      if (p.type === 'Customer') {
        // Customer: OpBal + Sales - Recoveries
        const totalSales = p.sales?.reduce((sum, s) => sum + Number(s.total_amount || 0), 0) || 0;
        const totalRec = p.recovery?.reduce((sum, r) => sum + Number(r.amount_collected || 0), 0) || 0;
        currentBalance = opBal + totalSales - totalRec;
      } else {
        // Supplier: OpBal + Purchases (not yet in schema) - Payments
        // For now, using: OpBal - Payments (assuming OpBal includes purchases)
        const totalPaid = p.payments?.reduce((sum, pay) => sum + Number(pay.amount_paid || 0), 0) || 0;
        currentBalance = opBal - totalPaid;
      }
      return { ...p, currentBalance };
    });

    setPartners(processed);
  }

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('partners').insert([{
      ...formData,
      type: activeTab // Strictly inserts based on the active tab
    }]);

    if (!error) {
      setShowModal(false);
      fetchPartners();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900">Partner Directory</h1>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {['Customer', 'Supplier'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-2 rounded-xl font-bold transition-all ${activeTab === tab ? 'bg-[#1e3a8a] text-white shadow-lg' : 'text-gray-500'}`}>
              {tab}s
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a8a]">
                {partner.type === 'Supplier' ? <Building2 size={24} /> : <Users size={24} />}
              </div>
              <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase text-gray-500">
                {partner.default_schema}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-gray-800">{partner.name}</h3>
            <div className="flex items-center gap-1 text-gray-400 text-sm font-bold mb-4">
              <MapPin size={14} /> <span>{partner.cities?.name}</span>
            </div>

            {/* LIVE BALANCE DISPLAY */}
            <div className="p-4 rounded-2xl bg-gray-50 flex justify-between items-center mb-4 border border-gray-100">
              <span className="text-[10px] font-black uppercase text-gray-400">Ledger Balance</span>
              <span className={`font-black text-lg ${partner.currentBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rs. {Math.abs(partner.currentBalance).toLocaleString()}
                <span className="text-[10px] ml-1">{partner.currentBalance >= 0 ? 'DR' : 'CR'}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 p-2 rounded-xl">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Limit</p>
                <p className="font-bold text-gray-700 text-sm">{partner.credit_limit}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-xl">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Days</p>
                <p className="font-bold text-gray-700 text-sm">{partner.credit_days}</p>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => setShowModal(true)} className="border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all min-h-[250px]">
          <Plus size={40} className="mb-2" />
          <span className="font-bold text-sm uppercase">Add {activeTab}</span>
        </button>
      </div>

      {/* ADD PARTNER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-gray-400"><X /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">New {activeTab}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Name</label>
                <input className="w-full p-4 bg-gray-100 rounded-2xl font-bold focus:ring-2 ring-blue-500 outline-none" 
                  placeholder="Business Name" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Credit Limit</label>
                  <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none" 
                    placeholder="Limit" onChange={e => setFormData({...formData, credit_limit: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Credit Days</label>
                  <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none" 
                    placeholder="Days" onChange={e => setFormData({...formData, credit_days: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Default Schema</label>
                <select className="w-full p-4 bg-gray-100 rounded-2xl font-bold outline-none appearance-none"
                  onChange={e => setFormData({...formData, default_schema: e.target.value})}>
                  <option value="Straight">Straight</option>
                  <option value="List-Disc">List-Disc</option>
                  <option value="List-Disc-Comm">List-Disc-Comm</option>
                </select>
              </div>

              <button disabled={loading} onClick={handleSave} className="w-full py-5 bg-[#1e3a8a] text-white rounded-2xl font-black shadow-xl hover:bg-blue-800 transition-all uppercase tracking-widest disabled:bg-gray-400">
                {loading ? 'Saving...' : `Save ${activeTab}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

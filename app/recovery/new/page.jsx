"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Banknote, CreditCard, Save, History } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function RecoveryEntry() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    partner_id: '',
    amount: '',
    mode: 'Cash',
    reference_no: '',
    tx_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase.from('partners').select('id, name').eq('type', 'Customer').order('name');
      setCustomers(data || []);
    }
    fetchCustomers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.partner_id || !form.amount) return alert("Please fill Customer and Amount");
    
    setLoading(true);
    const { error } = await supabase.from('transactions').insert([{
      partner_id: form.partner_id,
      amount: parseFloat(form.amount),
      tx_type: 'Recovery_From_Customer',
      mode: form.mode,
      reference_no: form.reference_no,
      tx_date: form.tx_date
    }]);

    setLoading(false);
    if (error) {
      alert("Error saving recovery: " + error.message);
    } else {
      alert("Recovery Recorded Successfully!");
      setForm({ ...form, amount: '', reference_no: '', partner_id: '' }); // Reset form
    }
  };

  return (
    <div className="max-w-md mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-green-100 p-2 rounded-lg text-green-600">
          <Banknote size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Payment Recovery</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <select 
            className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
            value={form.partner_id}
            onChange={(e) => setForm({...form, partner_id: e.target.value})}
          >
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Collected (PKR)</label>
          <input 
            type="number"
            placeholder="0.00"
            className="w-full border-gray-200 border p-3 rounded-xl text-lg font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none"
            value={form.amount}
            onChange={(e) => setForm({...form, amount: e.target.value})}
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Cheque', 'Bank Transfer'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setForm({...form, mode: m})}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${form.mode === m ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Number (For Cheques) */}
        {form.mode !== 'Cash' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Cheque No.</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Enter cheque or TX ID"
                className="w-full border-gray-200 border p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={form.reference_no}
                onChange={(e) => setForm({...form, reference_no: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Date</label>
          <input 
            type="date"
            className="w-full border-gray-200 border p-3 rounded-xl outline-none"
            value={form.tx_date}
            onChange={(e) => setForm({...form, tx_date: e.target.value})}
          />
        </div>

        {/* Submit Button */}
        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 flex items-center justify-center gap-2 transition active:scale-95"
        >
          {loading ? "Processing..." : <><Save size={20}/> Save Recovery</>}
        </button>
      </form>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, Building2, CreditCard, ArrowLeftCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function SupplierPayment() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    partner_id: '',
    amount: '',
    mode: 'Cash',
    reference_no: '',
    tx_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function fetchSuppliers() {
      // Fetching only partners marked as 'Supplier'
      const { data } = await supabase.from('partners').select('id, name').eq('type', 'Supplier').order('name');
      setSuppliers(data || []);
    }
    fetchSuppliers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.partner_id || !form.amount) return alert("Please select Supplier and enter Amount");
    
    setLoading(true);
    const { error } = await supabase.from('transactions').insert([{
      partner_id: form.partner_id,
      amount: parseFloat(form.amount),
      tx_type: 'Payment_To_Supplier', // Important for Dashboard math
      mode: form.mode,
      reference_no: form.reference_no,
      tx_date: form.tx_date
    }]);

    setLoading(true);
    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      alert("Payment recorded successfully!");
      setForm({ ...form, amount: '', reference_no: '', partner_id: '' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-20">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
          <Building2 size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Supplier Payment</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Supplier Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Supplier</label>
          <select 
            className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.partner_id}
            onChange={(e) => setForm({...form, partner_id: e.target.value})}
          >
            <option value="">Select Vendor</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (PKR)</label>
          <input 
            type="number"
            placeholder="0.00"
            className="w-full border-gray-200 border p-3 rounded-xl text-lg font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.amount}
            onChange={(e) => setForm({...form, amount: e.target.value})}
          />
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Cheque', 'Bank Transfer'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setForm({...form, mode: m})}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${form.mode === m ? 'bg-blue-800 text-white border-blue-800' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Reference */}
        {form.mode !== 'Cash' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cheque / Slip No.</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="text"
                className="w-full border-gray-200 border p-3 pl-10 rounded-xl outline-none"
                value={form.reference_no}
                onChange={(e) => setForm({...form, reference_no: e.target.value})}
              />
            </div>
          </div>
        )}

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-blue-800 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-900 flex items-center justify-center gap-2 transition"
        >
          {loading ? "Saving..." : <><Send size={20}/> Post Payment</>}
        </button>
      </form>
    </div>
  );
}

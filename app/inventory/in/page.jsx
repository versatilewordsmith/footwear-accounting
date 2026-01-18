"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Truck, Plus, Trash2, Save } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function StockIn() {
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchase, setPurchase] = useState({
    supplier_id: '',
    items: [{ variant_id: '', qty: 0, cost_price: 0 }]
  });

  useEffect(() => {
    async function fetchData() {
      const { data: sups } = await supabase.from('partners').select('id, name').eq('type', 'Supplier');
      const { data: vars } = await supabase.from('article_variants')
        .select(`id, size_range, articles(brand_name, partners(name))`);
      setSuppliers(sups || []);
      setVariants(vars || []);
    }
    fetchData();
  }, []);

  const addItem = () => setPurchase({
    ...purchase, 
    items: [...purchase.items, { variant_id: '', qty: 0, cost_price: 0 }]
  });

  const updateItem = (index, field, value) => {
    const newItems = [...purchase.items];
    newItems[index][field] = value;
    setPurchase({ ...purchase, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = purchase.items.filter((_, i) => i !== index);
    setPurchase({ ...purchase, items: newItems });
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (!purchase.supplier_id) return alert("Select a supplier");
    setLoading(true);

    const total_amt = purchase.items.reduce((sum, i) => sum + (i.qty * i.cost_price), 0);

    // 1. Create Purchase Invoice (to update Supplier Ledger)
    const { data: inv, error: invErr } = await supabase.from('invoices').insert([{
      partner_id: purchase.supplier_id,
      total_amount: total_amt,
      invoice_number: `PUR-${Date.now()}`
    }]).select().single();

    if (inv) {
      for (const item of purchase.items) {
        // 2. Increment Stock Count
        const { data: currentVar } = await supabase.from('article_variants')
          .select('current_stock').eq('id', item.variant_id).single();
        
        await supabase.from('article_variants')
          .update({ current_stock: (currentVar.current_stock || 0) + parseInt(item.qty) })
          .eq('id', item.variant_id);

        // 3. Save Invoice Items
        await supabase.from('invoice_items').insert([{
          invoice_id: inv.id,
          variant_id: item.variant_id,
          quantity: item.qty,
          net_unit_price: item.cost_price
        }]);
      }
      alert("Stock updated and purchase recorded!");
      setPurchase({ supplier_id: '', items: [{ variant_id: '', qty: 0, cost_price: 0 }] });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
          <Truck size={24} />
        </div>
        <h1 className="text-2xl font-bold">Stock In / Purchase</h1>
      </div>

      <form onSubmit={handleSavePurchase} className="space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium mb-2">Select Vendor</label>
          <select 
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
            value={purchase.supplier_id}
            onChange={e => setPurchase({...purchase, supplier_id: e.target.value})}
          >
            <option value="">-- Choose Supplier (e.g. BATA) --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {purchase.items.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="text-[10px] uppercase font-bold text-gray-400">Article & Size</label>
                <select 
                  className="w-full border p-2 rounded-lg mt-1"
                  onChange={e => updateItem(idx, 'variant_id', e.target.value)}
                >
                  <option>Select Item</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>{v.articles.brand_name} | {v.size_range}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase font-bold text-gray-400">Qty (Pairs)</label>
                <input 
                  type="number" className="w-full border p-2 rounded-lg mt-1" 
                  onChange={e => updateItem(idx, 'qty', e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase font-bold text-gray-400">Cost Price</label>
                <input 
                  type="number" className="w-full border p-2 rounded-lg mt-1" 
                  onChange={e => updateItem(idx, 'cost_price', e.target.value)}
                />
              </div>
              <div className="md:col-span-1 text-right">
                <button type="button" onClick={() => removeItem(idx)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button type="button" onClick={addItem} className="flex items-center gap-2 text-orange-600 font-bold border-2 border-orange-600 px-4 py-2 rounded-xl hover:bg-orange-50">
            <Plus size={20} /> Add Item
          </button>
          
          <button 
            disabled={loading}
            type="submit" 
            className="flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 disabled:bg-gray-400"
          >
            <Save size={20} /> {loading ? "Saving..." : "Record Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function SalesInvoice() {
  const [invoice, setInvoice] = useState({ partner_id: '', items: [] });
  const [lookups, setLookups] = useState({ customers: [], variants: [] });
  const [selectedSchema, setSelectedSchema] = useState('Straight');

  useEffect(() => {
    async function fetchData() {
      // Fetch Customers
      const { data: custs } = await supabase.from('partners').select('*').eq('type', 'Customer');
      // Fetch Stock Items (Joined with Article info for identification string)
      const { data: stocks } = await supabase.from('article_variants')
        .select(`id, size_range, list_price, articles(brand_name, supplier_id, partners(name), item_types(name), genders(name))`);
      
      setLookups({ customers: custs || [], variants: stocks || [] });
    }
    fetchData();
  }, []);

  const addItem = () => {
    setInvoice({ ...invoice, items: [...invoice.items, { variant_id: '', qty: 1, list_price: 0, discount: 0, comm: 0, isCommFlat: false, net: 0 }] });
  };

  const calculateRowNet = (item) => {
    let total = item.list_price * item.qty;
    // Schema 2 & 3: Apply Discount
    if (selectedSchema !== 'Straight') {
      total = total - (total * (item.discount / 100));
    }
    // Schema 3: Apply Commission
    if (selectedSchema === 'List-Disc-Comm') {
      if (item.isCommFlat) { total -= item.comm; } 
      else { total = total - (total * (item.comm / 100)); }
    }
    return total;
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    
    // Auto-fill price if variant is selected
    if (field === 'variant_id') {
      const v = lookups.variants.find(v => v.id == value);
      newItems[index].list_price = v.list_price;
    }
    
    newItems[index].net = calculateRowNet(newItems[index]);
    setInvoice({ ...invoice, items: newItems });
  };

  const saveInvoice = async () => {
    const total_invoice_amount = invoice.items.reduce((sum, item) => sum + item.net, 0);
    const { data: inv, error } = await supabase.from('invoices').insert([{
      partner_id: invoice.partner_id,
      total_amount: total_invoice_amount
    }]).select().single();

    if (inv) {
      const itemsToInsert = invoice.items.map(i => ({
        invoice_id: inv.id,
        variant_id: i.variant_id,
        quantity: i.qty,
        unit_list_price: i.list_price,
        net_unit_price: i.net / i.qty
      }));
      await supabase.from('invoice_items').insert(itemsToInsert);
      alert("Invoice Saved Successfully!");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">New Sales Invoice</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-2 gap-4">
        <select className="border p-2 rounded" onChange={e => {
          const cust = lookups.customers.find(c => c.id == e.target.value);
          setInvoice({...invoice, partner_id: e.target.value});
          setSelectedSchema(cust?.default_schema || 'Straight');
        }}>
          <option>Select Customer</option>
          {lookups.customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.default_schema})</option>)}
        </select>
        <div className="p-2 font-semibold text-blue-700">Active Schema: {selectedSchema}</div>
      </div>

      <div className="space-y-2">
        {invoice.items.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Item (Vendor | Brand | Type | Gender | Size)</label>
              <select className="w-full border p-2 rounded text-sm" onChange={e => updateItem(idx, 'variant_id', e.target.value)}>
                <option>Select Stock Item</option>
                {lookups.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.articles.partners.name} | {v.articles.brand_name} | {v.size_range} (Rs. {v.list_price})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Qty</label>
              <input type="number" className="w-full border p-2 rounded" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
            </div>
            {selectedSchema !== 'Straight' && (
              <div>
                <label className="text-xs text-gray-500">Disc %</label>
                <input type="number" className="w-full border p-2 rounded" placeholder="%" onChange={e => updateItem(idx, 'discount', e.target.value)} />
              </div>
            )}
            {selectedSchema === 'List-Disc-Comm' && (
              <div>
                <label className="text-xs text-gray-500">Comm (Value)</label>
                <input type="number" className="w-full border p-2 rounded" onChange={e => updateItem(idx, 'comm', e.target.value)} />
                <label className="text-[10px] flex items-center mt-1">
                  <input type="checkbox" className="mr-1" onChange={e => updateItem(idx, 'isCommFlat', e.target.checked)} /> Flat?
                </label>
              </div>
            )}
            <div className="text-right font-bold text-green-700">Rs. {item.net.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded text-sm">+ Add Item</button>
      
      <div className="mt-8 bg-white p-6 rounded shadow flex justify-between items-center">
        <div className="text-2xl font-bold">Total: Rs. {invoice.items.reduce((sum, i) => sum + i.net, 0).toFixed(2)}</div>
        <button onClick={saveInvoice} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">Save & Post Invoice</button>
      </div>
    </div>
  );
}

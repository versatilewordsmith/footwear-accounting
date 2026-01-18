import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function StockEntry() {
  const [article, setArticle] = useState({ supplier_id: '', brand_name: '', type_id: '', gender_id: '', article_code: '' });
  const [variants, setVariants] = useState([{ size_range: '', list_price: '' }]);
  const [lookups, setLookups] = useState({ suppliers: [], types: [], genders: [] });

  // Fetching dropdown data from Supabase
  useEffect(() => {
    async function fetchData() {
      const { data: partners } = await supabase.from('partners').select('id, name').eq('type', 'Supplier');
      const { data: types } = await supabase.from('item_types').select('*');
      const { data: genders } = await supabase.from('genders').select('*');
      setLookups({ suppliers: partners, types, genders });
    }
    fetchData();
  }, []);

  const addVariantRow = () => setVariants([...variants, { size_range: '', list_price: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Insert the Article
    const { data: newArticle, error: artError } = await supabase.from('articles').insert([article]).select().single();
    
    if (newArticle) {
      // 2. Insert all variants linked to that Article ID
      const variantsToInsert = variants.map(v => ({ ...v, article_id: newArticle.id }));
      await supabase.from('article_variants').insert(variantsToInsert);
      alert("Stock Article Registered Successfully!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Register New Stock Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Article Identification Section */}
        <div className="grid grid-cols-2 gap-4">
          <select className="border p-2 rounded" onChange={e => setArticle({...article, supplier_id: e.target.value})}>
            <option>Select Vendor (BATA/Service...)</option>
            {lookups.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="border p-2 rounded" placeholder="Brand Name (e.g. Plaza)" onChange={e => setArticle({...article, brand_name: e.target.value})} />
          <select className="border p-2 rounded" onChange={e => setArticle({...article, type_id: e.target.value})}>
            <option>Select Type (Slipper/Boot...)</option>
            {lookups.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="border p-2 rounded" onChange={e => setArticle({...article, gender_id: e.target.value})}>
            <option>Gender (Gents/Ladies...)</option>
            {lookups.genders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        {/* Dynamic Size Ranges Section */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Size Ranges & List Prices</h3>
          {variants.map((v, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <input className="border p-2 flex-1 rounded" placeholder="Size Range (e.g. 5-8)" 
                onChange={e => {
                  const newVars = [...variants];
                  newVars[index].size_range = e.target.value;
                  setVariants(newVars);
                }} />
              <input className="border p-2 w-32 rounded" placeholder="List Price" 
                onChange={e => {
                  const newVars = [...variants];
                  newVars[index].list_price = e.target.value;
                  setVariants(newVars);
                }} />
            </div>
          ))}
          <button type="button" onClick={addVariantRow} className="text-blue-600 text-sm font-medium">+ Add Another Size Range</button>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold mt-4 hover:bg-blue-700 transition">
          Save Article to Inventory
        </button>
      </form>
    </div>
  );
}

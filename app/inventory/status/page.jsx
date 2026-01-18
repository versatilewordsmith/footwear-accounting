"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Box, Search, AlertCircle, TrendingDown } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function StockStatus() {
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStock() {
      // Fetching stock variants joined with article and category details
      const { data, error } = await supabase.from('article_variants')
        .select(`
          id, 
          size_range, 
          current_stock, 
          list_price,
          articles (
            brand_name,
            article_code,
            partners (name),
            item_types (name),
            genders (name)
          )
        `);
      
      if (!error) setStock(data);
      setLoading(false);
    }
    fetchStock();
  }, []);

  // Filter logic for search bar
  const filteredStock = stock.filter(item => 
    item.articles.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.articles.partners.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.articles.item_types.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Box className="text-orange-500" /> Warehouse Stock Status
        </h1>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search Brand, Vendor or Type..."
            className="w-full border-gray-200 border p-2.5 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Loading Warehouse Data...</div>
        ) : filteredStock.length > 0 ? (
          filteredStock.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {item.articles.partners.name}
                  </p>
                  <h3 className="text-lg font-bold text-gray-800">{item.articles.brand_name}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.current_stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.current_stock} Pairs
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">{item.articles.item_types.name}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">{item.articles.genders.name}</span>
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Size: {item.size_range}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="text-gray-400 text-xs">List Price</div>
                <div className="font-bold text-gray-700">Rs. {item.list_price.toLocaleString()}</div>
              </div>

              {item.current_stock <= 5 && (
                <div className="mt-3 flex items-center gap-1.5 text-red-600 text-[10px] font-bold animate-pulse">
                  <TrendingDown size={14} /> LOW STOCK ALERT - REORDER SOON
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No stock items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

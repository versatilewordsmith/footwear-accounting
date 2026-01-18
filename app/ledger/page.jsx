"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, FileText, Printer, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function LedgerPage() {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPartners() {
      const { data } = await supabase.from('partners').select('id, name, type').order('name');
      setPartners(data || []);
    }
    fetchPartners();
  }, []);

  const fetchLedger = async (partnerId) => {
    setLoading(true);
    setSelectedPartner(partnerId);

    // 1. Get all Invoices for this partner
    const { data: invs } = await supabase.from('invoices')
      .select('invoice_date, total_amount, invoice_number')
      .eq('partner_id', partnerId);

    // 2. Get all Transactions for this partner
    const { data: txs } = await supabase.from('transactions')
      .select('tx_date, amount, tx_type, mode, reference_no')
      .eq('partner_id', partnerId);

    // 3. Combine and Sort
    let combined = [
      ...(invs || []).map(i => ({ date: i.invoice_date, desc: `Invoice #${i.id}`, debit: i.total_amount, credit: 0 })),
      ...(txs || []).map(t => ({ 
        date: t.tx_date, 
        desc: `${t.tx_type.replace(/_/g, ' ')} (${t.mode})`, 
        debit: 0, 
        credit: t.amount 
      }))
    ];

    combined.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 4. Calculate Running Balance
    let runningBalance = 0;
    const finalLedger = combined.map(row => {
      runningBalance += (row.debit - row.credit);
      return { ...row, balance: runningBalance };
    });

    setLedgerData(finalLedger);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> Account Ledger
        </h1>
        <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg text-sm">
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Partner Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <select 
            className="w-full border-gray-200 border p-2.5 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => fetchLedger(e.target.value)}
          >
            <option value="">Search Customer or Supplier...</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="p-4 border-b">Date</th>
              <th className="p-4 border-b">Description</th>
              <th className="p-4 border-b text-right">Debit (+)</th>
              <th className="p-4 border-b text-right">Credit (-)</th>
              <th className="p-4 border-b text-right bg-blue-50 text-blue-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Loading records...</td></tr>
            ) : ledgerData.length > 0 ? (
              ledgerData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 border-b text-gray-500">{row.date}</td>
                  <td className="p-4 border-b font-medium">{row.desc}</td>
                  <td className="p-4 border-b text-right text-red-600">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                  <td className="p-4 border-b text-right text-green-600">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
                  <td className="p-4 border-b text-right font-bold bg-blue-50">{row.balance.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Select a partner to view statement</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

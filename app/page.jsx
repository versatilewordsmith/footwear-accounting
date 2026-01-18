"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Wallet, Map, AlertTriangle, CheckCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const [summary, setSummary] = useState({ cashBalance: 0, tourData: [], loading: true });

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Fetch Total Cash Balance (Sum of all Recoveries minus Payments)
      const { data: trans } = await supabase.from('transactions').select('amount, tx_type');
      const balance = trans?.reduce((acc, curr) => {
        return curr.tx_type === 'Recovery_From_Customer' ? acc + curr.amount : acc - curr.amount;
      }, 0) || 0;

      // 2. Fetch Today's Tour Summary from the View we created
      const { data: tour } = await supabase.from('daily_tour_report').select('*');

      setSummary({ cashBalance: balance, tourData: tour || [], loading: false });
    }
    fetchDashboardData();
  }, []);

  if (summary.loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Sales Overview</h1>
        <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Financial Status Card */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <p className="text-blue-100 text-sm font-medium">Current Cash in Hand</p>
          <h2 className="text-3xl font-extrabold mt-1">Rs. {summary.cashBalance.toLocaleString()}</h2>
        </div>
        <div className="bg-blue-500 p-3 rounded-full">
          <Wallet size={32} />
        </div>
      </div>

      {/* Today's Tour Summary */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Map size={20} className="text-blue-600" /> 
            Today's Visit: <span className="text-blue-600">{summary.tourData[0]?.city_name || "No Tour Scheduled"}</span>
          </h3>
        </div>

        {summary.tourData.length > 0 ? (
          <div className="space-y-3">
            {summary.tourData.map((cust, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{cust.customer_name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Last Pay: Rs. {cust.last_payment_amt || 0} ({cust.last_payment_date || 'No Date'})</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${cust.credit_status === 'OVER LIMIT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {cust.credit_status === 'OVER LIMIT' ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
                    {cust.credit_status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 mt-4 pt-3 border-t border-gray-50 text-sm">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase">Outstanding</p>
                    <p className="font-bold text-gray-700">Rs. {cust.outstanding_balance.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] uppercase">Weekly Sales</p>
                    <p className="font-bold text-blue-600">Rs. {cust.weekly_invoices.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-400">Enjoy your day! No customers are scheduled for today's city.</p>
            <p className="text-gray-400">For feedback & queries, please contact us: Versatile Webworks, Lahore WhatsApp +92 342-4021533</p>
          </div>
        )}
      </section>
    </div>
  );
}

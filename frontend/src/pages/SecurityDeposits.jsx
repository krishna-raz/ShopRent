import React, { useState } from 'react';
import { useData, calculateRefundableAmount } from '../context/DataContext';
import { ShieldCheck, Search, FileText, Building2, Wallet, AlertTriangle, RefreshCcw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';

const SecurityDeposits = () => {
  const { tenants, shops, processRefund, deductDues, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <Loader />;

  const activeTenants = tenants.filter(t =>
    t.depositStatus !== 'Refunded' &&
    t.depositStatus !== 'Deducted'
  );

  const filteredTenants = activeTenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const summary = {
    active: activeTenants.length,
    totalDeposit: activeTenants.reduce((sum, t) => sum + t.securityDeposit, 0),
    totalDues: activeTenants.reduce((sum, t) => sum + t.unpaidRent, 0),
    totalRefundable: activeTenants.reduce((sum, t) => sum + t.refundableAmount, 0)
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Security Deposits"
        description="Manage active security deposits, deduct pending dues, and process final refunds."
        icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
      />

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Active</p>
          </div>
          <p className="text-2xl font-black text-indigo-700">{summary.active}</p>
          <p className="text-[10px] text-indigo-400 mt-0.5">Deposits</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Deposit</p>
          </div>
          <p className="text-2xl font-black text-emerald-700">₹{summary.totalDeposit.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">Collected</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</p>
          </div>
          <p className="text-2xl font-black text-amber-700">₹{summary.totalDues.toLocaleString()}</p>
          <p className="text-[10px] text-amber-400 mt-0.5">Unpaid Rent</p>
        </div>
        <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCcw className="w-4 h-4 text-sky-500" />
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Refundable</p>
          </div>
          <p className="text-2xl font-black text-sky-700">₹{summary.totalRefundable.toLocaleString()}</p>
          <p className="text-[10px] text-sky-400 mt-0.5">Available</p>
        </div>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tenants..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {filteredTenants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No active security deposits found.</p>
          </div>
        ) : (
          filteredTenants.map(tenant => {
            const shop = shops.find(s => s._id === tenant.shopId);
            const refundable = tenant.refundableAmount;

            return (
              <motion.div key={tenant._id} variants={item}>
                <Card className="p-0 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-indigo-600">{tenant.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{tenant.name}</h3>
                            <Badge variant={tenant.depositStatus === 'Active' ? 'success' : 'warning'}>
                              {tenant.depositStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {shop ? `${shop.shopNumber} - ${shop.shopName}` : 'No Shop'} • Joined {new Date(tenant.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deposit Info */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Total Deposit</p>
                        <p className="font-black text-slate-900">₹{tenant.securityDeposit.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-rose-50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 mb-1">Unpaid Rent</p>
                        <p className="font-black text-rose-600">₹{tenant.unpaidRent.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-xl">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mb-1">Net Refundable</p>
                        <p className="font-black text-emerald-600">₹{refundable.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const amount = prompt(`Tenant has ₹${tenant.unpaidRent} unpaid rent. Enter amount to deduct from deposit:`, tenant.unpaidRent);
                          if (amount) deductDues(tenant._id, amount);
                        }}
                      >
                        Deduct Dues
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          if(window.confirm(`Process refund of ₹${refundable.toLocaleString()}? This will mark the shop as vacant.`)) {
                            processRefund(tenant._id, refundable);
                          }
                        }}
                      >
                        Process Refund
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};

export default SecurityDeposits;

import React, { useState } from 'react';
import { useData, calculateRefundableAmount } from '../context/DataContext';
import { ShieldCheck, Search, FileText } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';

const SecurityDeposits = () => {
  const { tenants, shops, processRefund, deductDues, loading } = useData();

  if (loading) return <Loader />;
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTenants = tenants.filter(t => 
    t.depositStatus !== 'Refunded' && 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="mb-6 relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search tenants..." 
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No active security deposits found.</p>
          </div>
        ) : (
          filteredTenants.map(tenant => {
            const shop = shops.find(s => s._id === tenant.shopId);
            const refundable = tenant.refundableAmount;
            
            return (
              <motion.div key={tenant._id} variants={item}>
                <Card className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{tenant.name}</h3>
                      <Badge variant={tenant.depositStatus === 'Active' ? 'success' : 'warning'}>{tenant.depositStatus}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {shop ? `${shop.shopNumber} - ${shop.shopName}` : 'No Shop Assigned'} • Joined {new Date(tenant.joiningDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap gap-6 w-full md:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total Deposit</p>
                      <p className="font-bold text-slate-900">₹{tenant.securityDeposit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Unpaid Rent</p>
                      <p className="font-bold text-rose-600">₹{tenant.unpaidRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Net Refundable</p>
                      <p className="font-bold text-indigo-600">₹{refundable.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto pt-2 md:pt-0">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        const amount = prompt(`Tenant has ₹${tenant.unpaidRent} unpaid rent. Enter amount to deduct from deposit:`, tenant.unpaidRent);
                        if (amount) deductDues(tenant._id, amount);
                      }}
                    >
                      Deduct Dues
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        if(window.confirm(`Process refund of ₹${refundable.toLocaleString()}? This will mark the shop as vacant.`)) {
                          processRefund(tenant._id);
                        }
                      }}
                    >
                      Process Refund
                    </Button>
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

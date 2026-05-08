import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ReceiptIndianRupee, Plus, Search, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';
import PaymentForm from '../components/payments/PaymentForm';

const RentPayments = () => {
  const location = useLocation();
  const { payments, rentTransactions, activityLogs, tenants, loading } = useData();
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(location.pathname === '/due-payments' ? 'pending' : 'rent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (location.pathname === '/due-payments') {
      setActiveTab('pending');
    } else if (location.pathname === '/rent-payments') {
      setActiveTab('rent');
    }
  }, [location.pathname]);

  // Merged monthly records for "Rent Payments" tab
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const tenant = tenants.find(t => t._id === p.tenantId);
      return (
        tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.shopNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [payments, tenants, searchTerm]);

  // Individual transactions for "Full History" tab
  const filteredTransactions = useMemo(() => {
    return rentTransactions.filter(t => 
      t.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shopNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rentTransactions, searchTerm]);

  // Deposit logs for "Deposit Transactions" tab
  const depositLogs = useMemo(() => {
    return activityLogs.filter(log => 
      (log.action.includes('Deposit') || log.action.includes('Dues')) &&
      (log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       log.action.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activityLogs, searchTerm]);

  // Combined history: oldest first, latest last
  const combinedHistory = useMemo(() => {
    const rentItems = filteredTransactions.map(t => ({
      ...t,
      displayId: t._id,
      type: 'rent',
      sortDate: new Date(t.date).getTime()
    }));
    
    const depositItems = depositLogs.map(l => ({
      ...l,
      displayId: l._id,
      type: 'deposit',
      sortDate: new Date(l.timestamp).getTime()
    }));
    
    // Sort: oldest first (a - b)
    return [...rentItems, ...depositItems].sort((a, b) => a.sortDate - b.sortDate);
  }, [filteredTransactions, depositLogs]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return <Loader />;

  return (
    <div className="pb-20">
      <PageHeader 
        title="Finance & History" 
        description="Track monthly rent collections and security deposit transactions."
        icon={<ReceiptIndianRupee className="w-6 h-6 text-emerald-600" />}
        actions={
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsPaymentFormOpen(true)}>
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        }
      />

      <PaymentForm 
        isOpen={isPaymentFormOpen} 
        onClose={() => setIsPaymentFormOpen(false)} 
      />

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('rent')}
          className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'rent' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Rent Payments
          {activeTab === 'rent' && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('deposit')}
          className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'deposit' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Deposit Transactions
          {activeTab === 'deposit' && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'all' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Full History
          {activeTab === 'all' && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder={`Search ${activeTab === 'rent' ? 'rent payments' : activeTab === 'deposit' ? 'deposit transactions' : 'full history'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm font-medium transition-all"
        />
      </div>

      {/* ===== TAB 1: Rent Payments (Merged Monthly) ===== */}
      {activeTab === 'rent' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filteredPayments.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
             <ReceiptIndianRupee className="w-12 h-12 mx-auto text-slate-300 mb-2" />
             <p className="text-slate-500">No rent payment records found.</p>
           </div>
          ) : (
            filteredPayments.map((payment) => {
              const tenant = tenants.find(t => t._id === payment.tenantId);
              return (
                <motion.div key={payment._id} variants={itemAnim}>
                  <Card className="hover:shadow-md transition-all cursor-pointer group">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{tenant?.name || 'Unknown Tenant'}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-slate-600">
                              {payment.month?.includes('-') 
                                ? new Date(payment.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
                                : payment.month + (payment.year ? ` ${payment.year}` : '')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-slate-900">
                            {payment.status === 'Partial' 
                              ? `₹${payment.paidAmount.toLocaleString()} / ₹${payment.rentAmount.toLocaleString()}`
                              : `₹${payment.paidAmount.toLocaleString()}`
                            }
                          </p>
                          {payment.status === 'Partial' && (
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">
                              Due: ₹{payment.dueAmount.toLocaleString()}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                             Paid on: {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                           </p>
                        </div>
                        <Badge variant={
                          payment.status === 'Paid' ? 'success' : 
                          payment.status === 'Partial' ? 'warning' : 'danger'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* ===== TAB 2: Deposit Transactions ===== */}
      {activeTab === 'deposit' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {depositLogs.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
             <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
             <p className="text-slate-500">No deposit transactions recorded yet.</p>
           </div>
          ) : (
            depositLogs.map((log) => {
              const isRefund = log.action.toLowerCase().includes('refund');
              const amountMatch = log.description.match(/₹([\d,]+)/);
              const amount = amountMatch ? amountMatch[0] : null;
              
              return (
                <motion.div key={log._id} variants={itemAnim}>
                  <Card className="hover:shadow-md transition-all">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isRefund ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{log.action}</p>
                          <p className="text-sm text-slate-500 font-medium">{log.description.split(' - ')[0]}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">
                            {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {amount && (
                          <p className={`text-lg font-black ${isRefund ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isRefund ? '-' : '+'}{amount}
                          </p>
                        )}
                        <Badge variant={isRefund ? 'warning' : 'success'} className="mt-1">
                          {isRefund ? 'Refund' : 'Deposit'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* ===== TAB 3: Full History (Individual Transactions) ===== */}
      {activeTab === 'all' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {combinedHistory.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500">No transactions found matching your search.</p>
            </div>
          ) : (
            combinedHistory.map((item) => {
              if (item.type === 'rent') {
                const monthLabel = item.month?.includes('-') 
                  ? new Date(item.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
                  : item.month;
                return (
                  <motion.div key={`rent-${item.displayId}`} variants={itemAnim}>
                    <Card className="hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                      <div className="p-4">
                        {/* Header: Name + Status */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{item.tenantName || 'Unknown'}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              Shop {item.shopNumber} • {monthLabel}
                            </p>
                          </div>
                          <Badge variant={item.status === 'Paid' ? 'success' : 'warning'}>
                            {item.status || (item.remainingDue === 0 ? 'Paid' : 'Partial')}
                          </Badge>
                        </div>

                        {/* Amount: transactionAmount (this payment) */}
                        <div className="space-y-2">
                          <p className="text-lg font-black text-emerald-600">
                            Paid ₹{(item.transactionAmount || item.paidAmount)?.toLocaleString()}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-slate-500">
                              Rent: ₹{item.rentAmount?.toLocaleString()}
                            </p>
                            {item.remainingDue > 0 ? (
                              <p className="font-bold text-rose-600">
                                Due: ₹{item.remainingDue?.toLocaleString()}
                              </p>
                            ) : (
                              <p className="font-bold text-emerald-600">
                                Due: ₹0
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-xs text-slate-400 italic mt-2 truncate">
                            📝 {item.notes}
                          </p>
                        )}

                        {/* Footer: Date + Mode */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <p className="text-[11px] text-slate-400 font-medium">
                            {new Date(item.date).toLocaleString('en-IN', { 
                              day: '2-digit', month: 'short', year: 'numeric', 
                              hour: '2-digit', minute: '2-digit', hour12: true 
                            })}
                          </p>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">
                            {item.paymentMode}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              } else {
                // Deposit transaction card
                const isRefund = item.action.toLowerCase().includes('refund');
                const amountMatch = item.description.match(/₹([\d,]+)/);
                const amount = amountMatch ? amountMatch[0] : null;
                return (
                  <motion.div key={`dep-${item.displayId}`} variants={itemAnim}>
                    <Card className="hover:shadow-md transition-all border-l-4 border-l-indigo-500">
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                          <div className={`p-3 rounded-xl ${isRefund ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{item.action}</p>
                            <p className="text-xs text-slate-500 font-medium">{item.description.split(' - ')[0]}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {amount && (
                            <p className={`text-sm font-black ${isRefund ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {isRefund ? '-' : '+'}{amount}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                             {new Date(item.timestamp || item.sortDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              }
            })
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RentPayments;

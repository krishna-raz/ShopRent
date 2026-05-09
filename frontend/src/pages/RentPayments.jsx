import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  ReceiptIndianRupee, Plus, Search, Calendar, ShieldCheck, FileText, 
  TrendingUp, TrendingDown, Wallet, X, Filter, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/ui/Loader';
import PaymentForm from '../components/payments/PaymentForm';

const RentPayments = () => {
  const location = useLocation();
  const { payments, rentTransactions, depositTransactions, tenants, loading } = useData();
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

  // Stats calculations
  const stats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayments = payments.filter(p => p.month === currentMonth);
    const totalCollected = monthPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    
    const pendingDues = tenants.reduce((sum, t) => sum + (t.pendingDues || 0), 0);
    const totalDeposits = tenants.reduce((sum, t) => 
      t.depositStatus !== 'Refunded' ? sum + t.securityDeposit : sum, 0
    );
    
    const partialPayments = payments.filter(p => p.status === 'Partial').length;
    
    return { totalCollected, pendingDues, totalDeposits, partialPayments };
  }, [payments, tenants]);

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
    return depositTransactions.map(d => ({
      _id: d._id,
      action: d.type === 'Collection' ? 'Deposit Collected' : d.type === 'Deduction' ? 'Dues Deducted' : 'Refund Processed',
      description: `${d.tenantName} - ${d.shopNumber} - ${d.reason || 'N/A'}`,
      amount: d.amount,
      balanceAfter: d.balanceAfter,
      timestamp: d.date
    }));
  }, [depositTransactions]);

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
    
    return [...rentItems, ...depositItems].sort((a, b) => a.sortDate - b.sortDate);
  }, [filteredTransactions, depositLogs]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/20 pb-24 lg:pb-20">
      <PageHeader 
        title="Finance & History" 
        description="Track monthly rent collections and security deposit transactions."
        icon={<ReceiptIndianRupee className="w-6 h-6 text-emerald-600" />}
        actions={
          <Button 
            size="sm" 
            className="gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setIsPaymentFormOpen(true)}
          >
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        }
      />

      <PaymentForm 
        isOpen={isPaymentFormOpen} 
        onClose={() => setIsPaymentFormOpen(false)} 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "This Month", value: `₹${stats.totalCollected.toLocaleString()}`, icon: Wallet, gradient: "from-indigo-600 to-blue-600", delay: 0 },
          { title: "Pending Dues", value: `₹${stats.pendingDues.toLocaleString()}`, icon: TrendingUp, gradient: "from-amber-600 to-orange-600", delay: 0.1 },
          { title: "Total Deposits", value: `₹${stats.totalDeposits.toLocaleString()}`, icon: ShieldCheck, gradient: "from-emerald-600 to-teal-600", delay: 0.2 },
          { title: "Partial Payments", value: stats.partialPayments, icon: Clock, gradient: "from-rose-600 to-pink-600", delay: 0.3 }
        ].map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
            <div className="relative p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Tabs with Gradient Underline */}
      <div className="flex gap-6 mb-6 border-b border-slate-200 bg-white/50 backdrop-blur-sm rounded-t-2xl px-2">
        {[
          { id: 'rent', label: 'Rent Payments', icon: ReceiptIndianRupee },
          { id: 'deposit', label: 'Deposit Transactions', icon: ShieldCheck },
          { id: 'all', label: 'Full History', icon: FileText }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative pb-3 px-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="tab-indicator" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar with Clear Button */}
      <div className="relative mb-6 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder={`Search ${activeTab === 'rent' ? 'rent payments' : activeTab === 'deposit' ? 'deposit transactions' : 'full history'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm font-medium transition-all duration-300"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* ===== TAB 1: Rent Payments (Merged Monthly) ===== */}
      {activeTab === 'rent' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {filteredPayments.length === 0 ? (
            <motion.div variants={itemAnim} className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
              <ReceiptIndianRupee className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No rent payment records found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or record a new payment</p>
              <Button 
                variant="outline" 
                className="mt-6 gap-2"
                onClick={() => setIsPaymentFormOpen(true)}
              >
                <Plus className="w-4 h-4" /> Record Payment
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredPayments.map((payment) => {
                const tenant = tenants.find(t => t._id === payment.tenantId);
                const isPartial = payment.status === 'Partial';
                return (
                  <motion.div key={payment._id} variants={itemAnim} layout>
                    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${isPartial ? 'bg-linear-to-b from-amber-400 to-amber-500' : 'bg-linear-to-b from-emerald-500 to-teal-500'}`} />
                      
                      <div className="p-5 pl-7">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              payment.status === 'Paid' ? 'bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-700' : 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-700'
                            }`}>
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg">{tenant?.name || 'Unknown Tenant'}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {payment.month?.includes('-')
                                    ? new Date(payment.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
                                    : payment.month + (payment.year ? ` ${payment.year}` : '')}
                                </span>
                                {tenant && (
                                  <span className="text-xs text-slate-400">• Shop {tenant.shopNumber}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 ml-auto">
                            <div className="text-right">
                              <p className={`text-2xl font-black ${isPartial ? 'text-amber-600' : 'text-emerald-600'}`}>
                                ₹{payment.paidAmount.toLocaleString()}
                              </p>
                              {payment.status === 'Partial' && (
                                <p className="text-xs text-rose-500 font-bold">
                                  Due: ₹{payment.dueAmount.toLocaleString()}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            </div>
                            <Badge 
                              variant={payment.status === 'Paid' ? 'success' : 'warning'} 
                              className="px-3 py-1 text-xs font-bold"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* ===== TAB 2: Deposit Transactions ===== */}
      {activeTab === 'deposit' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {depositLogs.length === 0 ? (
            <motion.div variants={itemAnim} className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
              <ShieldCheck className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No deposit transactions recorded</p>
              <p className="text-slate-400 text-sm">Security deposits and refunds will appear here</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {depositLogs.map((log) => {
                const isRefund = log.action.toLowerCase().includes('refund');
                const isDeduction = log.action.toLowerCase().includes('deduct');
                const amount = log.amount;

                return (
                  <motion.div key={log._id} variants={itemAnim} layout>
                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              isRefund ? 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-700' :
                              isDeduction ? 'bg-linear-to-br from-rose-100 to-rose-200 text-rose-700' :
                              'bg-linear-to-br from-indigo-100 to-indigo-200 text-indigo-700'
                            }`}>
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{log.action}</p>
                              <p className="text-sm text-slate-500">{log.tenantName} - {log.shopNumber}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-auto">
                            <p className={`text-2xl font-black ${
                              isRefund ? 'text-amber-600' :
                              isDeduction ? 'text-rose-600' :
                              'text-emerald-600'
                            }`}>
                              {isDeduction ? '-' : (isRefund ? '-' : '+')}₹{amount?.toLocaleString()}
                            </p>
                            <Badge variant={isRefund ? 'warning' : isDeduction ? 'danger' : 'success'} className="mt-1 px-3">
                              {isRefund ? 'Refund' : isDeduction ? 'Deduction' : 'Collection'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* ===== TAB 3: Full History (Individual Transactions) ===== */}
      {activeTab === 'all' && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {combinedHistory.length === 0 ? (
            <motion.div variants={itemAnim} className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
              <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No transactions found</p>
              <p className="text-slate-400 text-sm">Try adjusting your search keywords</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {combinedHistory.map((item) => {
                if (item.type === 'rent') {
                  const monthLabel = item.month?.includes('-')
                    ? new Date(item.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
                    : item.month;
                  const isPartial = item.status === 'Partial' || (item.remainingDue > 0);
                  
                  return (
                    <motion.div key={`rent-${item.displayId}`} variants={itemAnim} layout>
                      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                        <div className={`h-1.5 ${isPartial ? 'bg-linear-to-r from-amber-400 to-amber-500' : 'bg-linear-to-r from-emerald-500 to-teal-500'}`} />
                        
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                isPartial ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                <ReceiptIndianRupee className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-base">{item.tenantName || 'Unknown'}</h4>
                                <p className="text-xs text-slate-500">
                                  Shop {item.shopNumber} • {monthLabel}
                                </p>
                              </div>
                            </div>
                            <Badge variant={isPartial ? 'warning' : 'success'} className="px-3 py-1">
                              {isPartial ? 'Partial' : 'Paid'}
                            </Badge>
                          </div>

                          {/* Amounts */}
                          <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Payment</span>
                              <span className={`text-xl font-black ${isPartial ? 'text-amber-600' : 'text-emerald-600'}`}>
                                + ₹{(item.transactionAmount || item.paidAmount)?.toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Monthly Rent</p>
                                <p className="font-bold text-slate-700">₹{item.rentAmount?.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Paid</p>
                                <p className="font-bold text-emerald-600">₹{item.paidAmount?.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Remaining</p>
                                <p className={`font-bold ${item.remainingDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  ₹{item.remainingDue?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className="flex items-start gap-2 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                              <FileText className="w-4 h-4 text-indigo-400 mt-0.5" />
                              <p className="text-sm text-indigo-700">{item.notes}</p>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <p className="text-xs text-slate-500 font-medium">
                                {new Date(item.date).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', hour12: true
                                })}
                              </p>
                            </div>
                            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">
                              {item.paymentMode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  // Deposit transaction card
                  const isRefund = item.action.toLowerCase().includes('refund');
                  const amountMatch = item.description.match(/₹([\d,]+)/);
                  const amount = amountMatch ? amountMatch[0] : null;
                  
                  return (
                    <motion.div key={`dep-${item.displayId}`} variants={itemAnim} layout>
                      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                        <div className={`h-1.5 ${isRefund ? 'bg-linear-to-r from-amber-400 to-amber-500' : 'bg-linear-to-r from-indigo-500 to-indigo-600'}`} />
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                                isRefund ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                <ShieldCheck className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-lg">{item.action}</p>
                                <p className="text-sm text-slate-500">{item.description.split(' - ')[0]}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(item.timestamp || item.sortDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-auto">
                              {amount && (
                                <p className={`text-2xl font-black ${isRefund ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {isRefund ? '-' : '+'}{amount}
                                </p>
                              )}
                              <Badge variant={isRefund ? 'warning' : 'success'} className="mt-1">
                                {isRefund ? 'Refund' : 'Deposit'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RentPayments;
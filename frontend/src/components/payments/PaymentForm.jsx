import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { X, ReceiptIndianRupee, Calendar, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaymentForm = ({ isOpen, onClose }) => {
  const { tenants, payments, refreshData } = useData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    paidAmount: '',
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    notes: ''
  });

  const activeTenants = tenants.filter(t => t.status === 'Active');

  useEffect(() => {
    if (formData.tenantId && formData.month) {
      const selectedTenant = activeTenants.find(t => t._id === formData.tenantId);
      if (selectedTenant) {
        // Find if there's already a payment for this month to suggest the remaining due
        const existingPayment = payments.find(p => 
          p.tenantId === formData.tenantId && p.month === formData.month
        );

        setFormData(prev => ({
          ...prev,
          paidAmount: existingPayment ? existingPayment.dueAmount : selectedTenant.monthlyRent
        }));
      }
    }
  }, [formData.tenantId, formData.month, payments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenantId || !formData.paidAmount || !formData.month) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/payments', formData);
      toast.success('Payment recorded successfully');
      refreshData();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="overflow-hidden shadow-2xl border-none">
            <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ReceiptIndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Record Rent Payment</h2>
                  <p className="text-emerald-100 text-xs font-medium">Add monthly rent collection</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
              <div className="space-y-4">
                <FormField label="Select Tenant" icon={<User className="w-4 h-4" />}>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    required
                  >
                    <option value="">-- Choose a Tenant --</option>
                    {activeTenants.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} (Shop {t.shopNumber})
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Month" icon={<Calendar className="w-4 h-4" />}>
                    <input
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                      required
                    />
                  </FormField>

                  <FormField label="Monthly Rent (₹)" icon={<ReceiptIndianRupee className="w-4 h-4" />}>
                    <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500">
                      ₹{activeTenants.find(t => t._id === formData.tenantId)?.monthlyRent?.toLocaleString() || '0'}
                    </div>
                  </FormField>
                </div>

                <FormField label="Amount Being Paid (₹)" icon={<CreditCard className="w-4 h-4" />}>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-600"
                    placeholder="Enter amount"
                    required
                  />
                </FormField>

                <FormField label="Payment Date" icon={<Calendar className="w-4 h-4" />}>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
                    required
                  />
                </FormField>

                <FormField label="Payment Mode" icon={<CreditCard className="w-4 h-4" />}>
                  <div className="flex gap-3">
                    {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMode: mode })}
                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                          formData.paymentMode === mode 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Notes / Reference">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium min-h-[80px]"
                    placeholder="Transaction ID or extra details..."
                  />
                </FormField>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 border border-slate-200" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                  disabled={loading}
                >
                  {loading ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentForm;

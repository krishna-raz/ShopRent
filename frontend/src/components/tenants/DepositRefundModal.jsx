import React, { useState } from 'react';
import api from '../../services/api';
import { X, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const DepositRefundModal = ({ tenant, onClose, onSuccess }) => {
  const [deductionAmount, setDeductionAmount] = useState('');
  const [deductionReason, setDeductionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const originalDeposit = tenant.securityDeposit || 0;
  const currentDeduction = Number(deductionAmount) || 0;
  const finalRefund = originalDeposit - currentDeduction;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentDeduction > originalDeposit) {
      setError('Deduction cannot be greater than the security deposit.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Process Refund
      await api.put(`/tenants/${tenant._id}/refund`, {
        deductionAmount: currentDeduction,
      });
      
      // 2. Free up the shop
      if (tenant.shopId) {
        await api.put(`/shops/${tenant.shopId._id || tenant.shopId}`, {
          occupancyStatus: 'Vacant',
          tenantId: null
        });
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <h2 className="font-semibold text-lg text-indigo-900">Process Refund & Move Out</h2>
          <button onClick={onClose} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-900">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Processing a refund will mark this tenant as moved out and free up Shop {tenant.shopNumber}.</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Original Deposit:</span>
              <span className="font-semibold">₹{originalDeposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>Total Deductions:</span>
              <span>- ₹{currentDeduction.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-base">
              <span className="font-semibold">Final Refundable Amount:</span>
              <span className="font-bold text-green-600">₹{finalRefund > 0 ? finalRefund.toLocaleString() : 0}</span>
            </div>
          </div>

          <FormField
            label="Deduction Amount (₹)"
            name="deductionAmount"
            type="number"
            value={deductionAmount}
            onChange={(e) => setDeductionAmount(e.target.value)}
            placeholder="0"
          />

          {currentDeduction > 0 && (
            <FormField
              label="Reason for Deduction"
              name="deductionReason"
              value={deductionReason}
              onChange={(e) => setDeductionReason(e.target.value)}
              placeholder="e.g. Unpaid rent, damages, electric bill"
              required
            />
          )}

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Move Out'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositRefundModal;

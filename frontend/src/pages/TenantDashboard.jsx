import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Store, ReceiptIndianRupee, ShieldCheck } from 'lucide-react';

const TenantDashboard = () => {
  const { user } = useAuth();
  const { shops, tenants, payments } = useData();

  // Find tenant data based on logged in user's phone or ID
  const tenantData = tenants.find(t => t.phone === user?.phone || t.name === user?.name) || tenants[0]; // fallback for demo
  const shopData = shops.find(s => s._id === tenantData?.shopId);
  const myPayments = payments.filter(p => p.tenantId === tenantData?._id);

  if (!tenantData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-slate-500 font-medium">No tenant profile found for your account.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-6">
      <PageHeader 
        title={`Welcome, ${tenantData.name}`}
        description="View your shop details, rent history, and deposits."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Your Shop</p>
              <h3 className="text-xl font-bold text-slate-900">{shopData ? `${shopData.shopNumber} - ${shopData.shopName}` : 'Unassigned'}</h3>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <div>
              <p className="text-xs text-slate-500">Monthly Rent</p>
              <p className="font-bold text-slate-900">₹{tenantData.monthlyRent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Joining Date</p>
              <p className="font-bold text-slate-900">{new Date(tenantData.joiningDate).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Security Deposit</p>
                <h3 className="text-xl font-bold text-slate-900">₹{tenantData.securityDeposit.toLocaleString()}</h3>
              </div>
            </div>
            <Badge variant={tenantData.depositStatus === 'Active' ? 'success' : 'warning'}>{tenantData.depositStatus}</Badge>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <div>
              <p className="text-xs text-slate-500">Pending Dues</p>
              <p className="font-bold text-rose-600">₹{tenantData.pendingDues.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Refundable Amt.</p>
              <p className="font-bold text-indigo-600">₹{(tenantData.securityDeposit - tenantData.pendingDues).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <ReceiptIndianRupee className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-lg text-slate-900">My Rent Payments</h3>
        </div>
        <div className="p-0">
          {myPayments.length === 0 ? (
            <p className="text-center py-6 text-slate-500">No payment history found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {myPayments.map(payment => (
                <li key={payment._id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{payment.month} {payment.year}</p>
                    <p className="text-xs text-slate-500">Paid on {new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-slate-900">₹{payment.paidAmount.toLocaleString()}</p>
                    <Badge variant="success">Paid</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantDashboard;

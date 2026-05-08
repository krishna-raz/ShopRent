import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Pure function as requested
export const calculateRefundableAmount = (depositAmount, pendingDues) => {
  return Math.max(0, depositAmount - (pendingDues || 0));
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rentTransactions, setRentTransactions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [shopsRes, tenantsRes, paymentsRes, transactionsRes, logsRes] = await Promise.all([
        api.get('/shops'),
        api.get('/tenants'),
        api.get('/payments'),
        api.get('/payments/transactions'),
        api.get('/activity-logs')
      ]);

      // Map backend data to frontend structure to avoid breaking UI components
      const mappedShops = shopsRes.data.map(s => ({
        _id: s._id,
        shopNumber: s.shopNumber,
        floor: s.floor,
        shopName: s.shopName || 'Unnamed Shop',
        rentAmount: s.monthlyRent,
        status: s.occupancyStatus,
        currentTenant: s.tenantId?._id || s.tenantId // Backend populates tenantId object
      }));

      const mappedTenants = tenantsRes.data.map(t => {
        // Calculate total unpaid rent dues from the payments array
        const unpaidRent = (paymentsRes.data || [])
          .filter(p => (p.tenantId?._id || p.tenantId) === t._id)
          .reduce((sum, p) => sum + (p.dueAmount || 0), 0);

        return {
          _id: t._id,
          name: t.tenantName,
          phone: t.phone,
          aadhaar: t.aadhaar,
          address: t.address,
          shopId: t.shopId?._id || t.shopId,
          monthlyRent: t.rentAmount,
          joiningDate: t.joiningDate,
          securityDeposit: t.securityDeposit,
          refundableAmount: t.refundableAmount,
          depositStatus: t.depositStatus,
          shopNumber: t.shopNumber,
          status: t.status,
          unpaidRent: unpaidRent,
          deductedAmount: t.securityDeposit - (t.refundableAmount || 0)
        };
      });

      const mappedLogs = logsRes.data.map(l => ({
        _id: l._id,
        action: l.action,
        description: l.description,
        timestamp: l.createdAt,
        user: l.performedBy?.email || 'System'
      }));

      const mappedPayments = paymentsRes.data.map(p => ({
        _id: p._id,
        tenantId: p.tenantId?._id || p.tenantId,
        month: p.month,
        year: p.year,
        paidAmount: p.paidAmount,
        rentAmount: p.rentAmount,
        dueAmount: p.dueAmount,
        status: p.status,
        date: p.paymentDate || p.createdAt
      }));

      setShops(mappedShops);
      setTenants(mappedTenants);
      setPayments(mappedPayments);
      setRentTransactions(transactionsRes.data);
      setActivityLogs(mappedLogs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Actions
  const addTenant = async (tenantData) => {
    try {
      // Backend expects: tenantName, phone, aadhaar, address, shopId, shopNumber, rentAmount, joiningDate, securityDeposit
      const payload = {
        tenantName: tenantData.name,
        phone: tenantData.phone,
        aadhaar: tenantData.aadhaar,
        address: tenantData.address,
        shopId: tenantData.shopId,
        shopNumber: tenantData.shopNumber,
        rentAmount: tenantData.monthlyRent,
        joiningDate: tenantData.joiningDate,
        securityDeposit: tenantData.securityDeposit
      };
      
      await api.post('/tenants', payload);
      toast.success('Tenant added successfully!');
      fetchData(); // Refresh all data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add tenant');
    }
  };

  const updateTenant = async (id, updates) => {
    try {
      await api.put(`/tenants/${id}`, updates);
      toast.success('Tenant updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update tenant');
    }
  };

  const deductDues = async (tenantId, amount) => {
    try {
      // Using the processRefund endpoint for deductions as per backend controller logic
      await api.put(`/tenants/${tenantId}/refund`, {
        deductionAmount: parseFloat(amount),
        deductionReason: 'Manual deduction from admin panel'
      });
      toast.success(`₹${amount} dues recorded and deducted from deposit.`);
      fetchData();
    } catch (error) {
      toast.error('Failed to record deduction');
    }
  };

  const processRefund = async (tenantId) => {
    try {
      // For a full refund, deductionAmount is 0
      await api.put(`/tenants/${tenantId}/refund`, {
        deductionAmount: 0,
        deductionReason: 'Full refund processed'
      });
      toast.success('Deposit successfully refunded!');
      fetchData();
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };

  const addActivityLog = async (action, description) => {
    // Activity logs are typically handled by backend controllers automatically
    // but if needed we could add a POST endpoint for custom logs
    console.log('Manual log requested:', { action, description });
  };

  const value = {
    shops,
    tenants,
    payments,
    rentTransactions,
    activityLogs,
    loading,
    addTenant,
    updateTenant,
    deductDues,
    processRefund,
    addActivityLog,
    refreshData: fetchData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

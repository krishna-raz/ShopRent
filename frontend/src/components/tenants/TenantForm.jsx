import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const TenantForm = ({ onClose, onSuccess, initialShopId }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const [formData, setFormData] = useState({
    tenantName: '',
    phone: '',
    aadhaar: '',
    address: '',
    shopId: initialShopId || '',
    shopNumber: '',
    rentAmount: '',
    joiningDate: new Date().toISOString().split('T')[0],
    securityDeposit: '',
    depositDate: new Date().toISOString().split('T')[0],
  });
  
  const [availableShops, setAvailableShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data } = await api.get('/shops');
        // If initialShopId is provided, we might want to include that shop even if it's not vacant (though it should be)
        const vacant = data.filter(shop => shop.occupancyStatus === 'Vacant' || shop._id === initialShopId);
        setAvailableShops(vacant);
        
        if (initialShopId) {
          const shop = data.find(s => s._id === initialShopId);
          if (shop) {
            setFormData(prev => ({
              ...prev,
              shopId: shop._id,
              shopNumber: shop.shopNumber,
              rentAmount: shop.monthlyRent
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching shops', err);
      }
    };
    fetchShops();
  }, [initialShopId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill shopNumber and rentAmount when a shop is selected
    if (name === 'shopId') {
      const selectedShop = availableShops.find(s => s._id === value);
      if (selectedShop) {
        setFormData({
          ...formData,
          shopId: value,
          shopNumber: selectedShop.shopNumber,
          rentAmount: selectedShop.monthlyRent
        });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Tenant (Backend now handles shop status update)
      await api.post('/tenants', formData);
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center sm:items-start sm:justify-center sm:pt-20 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-slate-100 flex justify-between items-center z-10">
          <h2 className="font-semibold text-lg">Add New Tenant</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <div className="space-y-4 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Personal Info</h3>
            <FormField label="Full Name" name="tenantName" value={formData.tenantName} onChange={handleChange} required />
            <FormField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
            <FormField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
            <FormField label="Address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          
          <div className="space-y-4 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Shop Assignment</h3>
            <FormField label="Select Vacant Shop">
              <select
                name="shopId"
                value={formData.shopId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors text-sm"
              >
                <option value="">-- Choose a Shop --</option>
                {availableShops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    Shop {shop.shopNumber} (Rent: ₹{shop.monthlyRent})
                  </option>
                ))}
              </select>
            </FormField>
            
            <FormField 
              label="Agreed Monthly Rent (₹)" 
              name="rentAmount" 
              type="number" 
              value={formData.rentAmount} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="space-y-4 pb-4">
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Security Deposit</h3>
            <FormField 
              label="Deposit Amount Received (₹)" 
              name="securityDeposit" 
              type="number" 
              value={formData.securityDeposit} 
              onChange={handleChange} 
              placeholder="e.g. 50000"
              required 
            />
            <FormField 
              label="Joining Date" 
              name="joiningDate" 
              type="date" 
              value={formData.joiningDate} 
              onChange={handleChange} 
              required 
            />
            <FormField 
              label="Deposit Received Date" 
              name="depositDate" 
              type="date" 
              value={formData.depositDate} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="pt-2 flex gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading || availableShops.length === 0}>
              {loading ? 'Saving...' : 'Add Tenant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;

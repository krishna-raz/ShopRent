import React, { useState } from 'react';
import api from '../../services/api';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const ShopForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    shopNumber: '',
    shopName: '',
    floor: 'Ground Floor',
    monthlyRent: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/shops', formData);
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
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Add New Shop</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          
          <FormField
            label="Shop Number"
            name="shopNumber"
            value={formData.shopNumber}
            onChange={handleChange}
            placeholder="e.g. G-01"
            required
          />
          
          <FormField
            label="Shop Name (Optional)"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            placeholder="e.g. Mobile Accessories"
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Floor</label>
            <select
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="Basement">Basement</option>
              <option value="Ground Floor">Ground Floor</option>
              <option value="First Floor">First Floor</option>
              <option value="Second Floor">Second Floor</option>
              <option value="Third Floor">Third Floor</option>
            </select>
          </div>

          <FormField
            label="Monthly Rent (₹)"
            name="monthlyRent"
            type="number"
            value={formData.monthlyRent}
            onChange={handleChange}
            placeholder="e.g. 15000"
            required
          />

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Shop'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopForm;

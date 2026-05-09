import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Store, Home, Users, Edit2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';
import ShopForm from '../components/shops/ShopForm';
import TenantForm from '../components/tenants/TenantForm';

const Shops = () => {
  const { shops, tenants, loading, refreshData } = useData();

  if (loading) return <Loader />;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTenantFormOpen, setIsTenantFormOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [editingShop, setEditingShop] = useState(null);
  
  // Filters
  const [filterFloor, setFilterFloor] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const floors = ['All', ...new Set(shops.map(s => s.floor))];
  const statuses = ['All', 'Vacant', 'Occupied'];

  const filteredShops = shops.filter(shop => {
    const floorMatch = filterFloor === 'All' || shop.floor === filterFloor;
    const statusMatch = filterStatus === 'All' || shop.status === filterStatus;
    return floorMatch && statusMatch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Shop Management" 
        description="View and organize your property units."
        icon={<Store className="w-6 h-6 text-indigo-600" />}
        actions={
          <Button size="sm" className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" /> Add New Shop
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Filter by Floor</label>
          <select 
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            {floors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Occupancy Status</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isFormOpen && <ShopForm onClose={() => setIsFormOpen(false)} onSuccess={() => { setIsFormOpen(false); setEditingShop(null); refreshData(); }} shop={editingShop} />}
      
      {isTenantFormOpen && (
        <TenantForm 
          initialShopId={selectedShop?._id} 
          onClose={() => { setIsTenantFormOpen(false); setSelectedShop(null); }} 
          onSuccess={() => { setIsTenantFormOpen(false); setSelectedShop(null); refreshData(); }} 
        />
      )}

      {filteredShops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
            <Store className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Shops Found</h3>
          <p className="text-slate-500 max-w-sm mb-6">No shops match your current filter criteria.</p>
          <Button variant="outline" onClick={() => { setFilterFloor('All'); setFilterStatus('All'); }}>Clear All Filters</Button>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredShops.map(shop => {
            const tenant = shop.currentTenant ? tenants.find(t => t._id === shop.currentTenant) : null;
            return (
              <motion.div key={shop._id} variants={item}>
                <Card className="h-full flex flex-col hover:shadow-md transition-all border-slate-100 overflow-hidden">
                  <div className={`h-1.5 w-full ${shop.status === 'Vacant' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  
                  <div className="p-5 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">{shop.shopNumber}</h3>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">{shop.shopName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingShop(shop); setIsFormOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Shop"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <Badge variant={shop.status === 'Vacant' ? 'success' : 'warning'}>
                        {shop.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="px-5 py-2 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Home className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{shop.floor}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Rent</p>
                        <p className="text-base font-bold text-slate-900">₹{shop.rentAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 mt-auto">
                    {shop.status === 'Occupied' && tenant ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Current Tenant</p>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{tenant.name}</p>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="w-full gap-2 shadow-sm"
                        onClick={() => {
                          setSelectedShop(shop);
                          setIsTenantFormOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4" /> Assign Tenant
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Shops;

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Users, Phone, Building2, Search, Edit2, Trash2, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';
import TenantForm from '../components/tenants/TenantForm';
import Loader from '../components/ui/Loader';
import { useNavigate } from 'react-router-dom';

const Tenants = () => {
  const { tenants, shops, loading, refreshData } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  if (loading) return <Loader />;

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shops.find(s => s._id === t.shopId)?.shopNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-20 relative min-h-[80vh]">
      <PageHeader 
        title="Tenant Directory" 
        description="Manage your tenant records and shop allocations."
        icon={<Users className="w-6 h-6 text-indigo-600" />}
        actions={
          <Button size="sm" className="hidden md:flex gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" /> Add Tenant
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search name or shop number..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isFormOpen && <TenantForm onClose={() => setIsFormOpen(false)} onSuccess={() => { setIsFormOpen(false); refreshData(); }} />}

      {filteredTenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-100 p-6 rounded-full mb-4">
            <Users className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Tenants Found</h3>
          <p className="text-slate-500 max-w-sm mb-6">No matching records found for "{searchTerm}".</p>
          <Button onClick={() => {setSearchTerm(''); setIsFormOpen(true);}}>Add New Tenant</Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-slate-100 bg-white shadow-sm mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Shop</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rent</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deposit</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTenants.map(tenant => {
                  const shop = shops.find(s => s._id === tenant.shopId);
                  return (
                    <tr key={tenant._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {tenant.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{tenant.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{tenant.phone}</td>
                      <td className="px-6 py-4">
                        <Badge variant="indigo">{shop?.shopNumber || 'N/A'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{tenant.monthlyRent.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">₹{tenant.securityDeposit.toLocaleString()}</span>
                          <span className={`text-[10px] font-bold uppercase ${tenant.depositStatus === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {tenant.depositStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate('/deposits')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Deposit">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 md:hidden"
          >
            {filteredTenants.map(tenant => {
              const shop = shops.find(s => s._id === tenant.shopId);
              return (
                <motion.div key={tenant._id} variants={item}>
                  <Card className="p-4 border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">{tenant.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{tenant.phone}</p>
                        </div>
                      </div>
                      <Badge variant="indigo">{shop?.shopNumber || 'N/A'}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Monthly Rent</p>
                        <p className="font-bold text-slate-900 text-sm">₹{tenant.monthlyRent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Security Deposit</p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">₹{tenant.securityDeposit.toLocaleString()}</p>
                          <span className={`w-2 h-2 rounded-full ${tenant.depositStatus === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs py-1.5" onClick={() => navigate('/deposits')}>View Deposit</Button>
                      <Button variant="secondary" size="sm" className="px-3"><Edit2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}

      {/* Floating Action Button (FAB) for Mobile */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Tenants;

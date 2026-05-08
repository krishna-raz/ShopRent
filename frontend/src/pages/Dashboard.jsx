import React from 'react';
import { useData } from '../context/DataContext';
import { LayoutGrid, Users, Store, ReceiptIndianRupee, ShieldCheck, Activity } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';

import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend 
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-slate-400">{title}</span>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-sm text-slate-500 mt-1 font-medium">{subtext}</p>}
      </div>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const { shops, tenants, payments, activityLogs, loading } = useData();

  if (loading) return <Loader />;

  // Calculate stats
  const totalTenants = tenants.length;
  const totalShops = shops.length;
  const occupiedShops = shops.filter(s => s.status === 'Occupied').length;
  const vacantShops = totalShops - occupiedShops;
  const monthlyRevenue = shops.reduce((acc, shop) => shop.status === 'Occupied' ? acc + shop.rentAmount : acc, 0);
  
  const totalDepositsHeld = tenants.reduce((acc, t) => t.depositStatus !== 'Refunded' ? acc + t.securityDeposit : acc, 0);
  const totalPendingDues = tenants.reduce((acc, t) => acc + (t.pendingDues || 0), 0);

  // Chart Data
  const occupancyData = [
    { name: 'Occupied', value: occupiedShops, color: '#6366f1' },
    { name: 'Vacant', value: vacantShops, color: '#e2e8f0' }
  ];

  const revenueData = [
    { name: 'Total Revenue', amount: monthlyRevenue, color: '#6366f1' },
    { name: 'Deposits Held', amount: totalDepositsHeld, color: '#10b981' },
    { name: 'Pending Dues', amount: totalPendingDues, color: '#f43f5e' }
  ];
  
  return (
    <div className="pb-20 space-y-6">
      <PageHeader 
        title="Admin Dashboard" 
        description="Your business overview at a glance."
        icon={<LayoutGrid className="w-6 h-6 text-indigo-600" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Tenants" value={totalTenants} subtext="Active agreements" icon={Users} delay={0.1} />
        <StatCard title="Shop Occupancy" value={`${occupiedShops}/${totalShops}`} subtext={`${vacantShops} Vacant`} icon={Store} delay={0.2} />
        <StatCard title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString()}`} subtext="Expected this month" icon={ReceiptIndianRupee} delay={0.3} />
        
        <StatCard title="Total Deposits Held" value={`₹${totalDepositsHeld.toLocaleString()}`} subtext="From active tenants" icon={ShieldCheck} delay={0.4} />
        <StatCard title="Pending Dues" value={`₹${totalPendingDues.toLocaleString()}`} subtext="Unpaid Dues" icon={Activity} delay={0.5} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <Card delay={0.6} className="p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Occupancy Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.7} className="p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Financial Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card delay={0.8}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">Recent Payments</h3>
            <Badge variant="indigo">View All</Badge>
          </div>
          <div className="p-0">
            {payments.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No payments recorded.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.slice(0, 5).map(payment => {
                  const tenant = tenants.find(t => t._id === payment.tenantId);
                  return (
                    <li key={payment._id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900">{tenant?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{payment.month} {payment.year} • {new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₹{payment.paidAmount.toLocaleString()}</p>
                        <Badge variant={payment.status === 'Paid' ? 'success' : 'warning'}>{payment.status}</Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card delay={0.9}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">Activity Logs</h3>
          </div>
          <div className="p-5">
            {activityLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No activity logs.</p>
            ) : (
              <div className="space-y-6">
                {activityLogs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="flex gap-4 relative">
                    {index !== Math.min(activityLogs.length, 5) - 1 && (
                      <div className="absolute top-8 left-4 w-px h-full bg-slate-200 -z-10"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{log.action}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{log.description}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{new Date(log.timestamp).toLocaleString()} • {log.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

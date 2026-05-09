import React from 'react';
import { useData } from '../context/DataContext';
import { LayoutGrid, Users, Store, ReceiptIndianRupee, ShieldCheck, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';

import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, delay, color = 'indigo' }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', gradient: 'from-rose-500 to-rose-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', gradient: 'from-violet-500 to-violet-600' },
  };

  const c = colors[color] || colors.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="p-5 md:p-6 hover:shadow-lg transition-all bg-white border border-slate-100">
        <div className="flex items-start justify-between">
          <div className={`p-3 ${c.bg} rounded-xl`}>
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{value}</h3>
          {subtext && <p className="text-sm text-slate-500 mt-1 font-medium">{subtext}</p>}
        </div>
      </Card>
    </motion.div>
  );
};

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

  // Today's collections
  const today = new Date().toISOString().slice(0, 10);
  const todayPayments = payments.filter(p => p.date?.slice(0, 10) === today);
  const todayCollection = todayPayments.reduce((acc, p) => acc + p.paidAmount, 0);

  // This month's revenue
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthPayments = payments.filter(p => p.month === currentMonth);
  const monthCollection = monthPayments.reduce((acc, p) => acc + p.paidAmount, 0);

  // Chart Data
  const occupancyData = [
    { name: 'Occupied', value: occupiedShops, color: '#6366f1' },
    { name: 'Vacant', value: vacantShops, color: '#e2e8f0' }
  ];

  const revenueData = [
    { name: 'Revenue', amount: monthCollection, color: '#10b981' },
    { name: 'Deposits', amount: totalDepositsHeld, color: '#6366f1' },
    { name: 'Dues', amount: totalPendingDues, color: '#f43f5e' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
          <p className="font-semibold text-slate-900">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-24 lg:pb-20 space-y-6 lg:space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Your business overview at a glance."
        icon={<LayoutGrid className="w-6 h-6 text-indigo-600" />}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Today</p>
          <p className="text-2xl font-bold mt-1">₹{todayCollection.toLocaleString()}</p>
          <p className="text-emerald-200 text-xs mt-1">{todayPayments.length} payments</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">This Month</p>
          <p className="text-2xl font-bold mt-1">₹{monthCollection.toLocaleString()}</p>
          <p className="text-indigo-200 text-xs mt-1">collected</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white">
          <p className="text-violet-100 text-xs font-semibold uppercase tracking-wider">Occupancy</p>
          <p className="text-2xl font-bold mt-1">{totalShops > 0 ? Math.round((occupiedShops / totalShops) * 100) : 0}%</p>
          <p className="text-violet-200 text-xs mt-1">{occupiedShops}/{totalShops} shops</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Dues</p>
          <p className="text-2xl font-bold mt-1">₹{totalPendingDues.toLocaleString()}</p>
          <p className="text-amber-200 text-xs mt-1">pending</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Total Tenants" value={totalTenants} subtext="Active agreements" icon={Users} delay={0.1} color="indigo" />
        <StatCard title="Shop Occupancy" value={`${occupiedShops}/${totalShops}`} subtext={`${vacantShops} Vacant`} icon={Store} delay={0.2} color="violet" />
        <StatCard title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString()}`} subtext="Expected this month" icon={ReceiptIndianRupee} delay={0.3} color="emerald" />

        <StatCard title="Total Deposits" value={`₹${totalDepositsHeld.toLocaleString()}`} subtext="From active tenants" icon={ShieldCheck} delay={0.4} color="amber" />
        <StatCard title="Pending Dues" value={`₹${totalPendingDues.toLocaleString()}`} subtext="Unpaid Dues" icon={TrendingUp} delay={0.5} color="rose" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card delay={0.6} className="p-5 md:p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base md:text-lg text-slate-900">Shop Occupancy</h3>
            <Badge variant="indigo">{occupiedShops} Occupied</Badge>
          </div>
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-sm text-slate-600">Occupied ({occupiedShops})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span className="text-sm text-slate-600">Vacant ({vacantShops})</span>
            </div>
          </div>
        </Card>

        <Card delay={0.7} className="p-5 md:p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base md:text-lg text-slate-900">Financial Overview</h3>
          </div>
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card delay={0.8} className="bg-white">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base md:text-lg text-slate-900">Recent Payments</h3>
            <Badge variant="indigo">View All</Badge>
          </div>
          <div className="p-0">
            {payments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No payments recorded yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.slice(0, 5).map(payment => {
                  const tenant = tenants.find(t => t._id === payment.tenantId);
                  return (
                    <li key={payment._id} className="p-3 md:p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="font-bold text-emerald-600 text-sm">
                            {(tenant?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm md:text-base">{tenant?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{payment.month} • {new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">₹{payment.paidAmount.toLocaleString()}</p>
                        <Badge variant={payment.status === 'Paid' ? 'success' : 'warning'}>{payment.status}</Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card delay={0.9} className="bg-white">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base md:text-lg text-slate-900">Activity Logs</h3>
          </div>
          <div className="p-4 md:p-5">
            {activityLogs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No activity logs yet.</p>
            ) : (
              <div className="space-y-4">
                {activityLogs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="flex gap-3 relative">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{log.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(log.timestamp).toLocaleDateString()} • {log.user}
                      </p>
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

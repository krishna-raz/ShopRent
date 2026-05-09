import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  LayoutGrid, Users, Store, ReceiptIndianRupee, ShieldCheck, 
  TrendingUp, TrendingDown, Activity, Calendar, Wallet, Home,
  ChevronRight, CircleDollarSign, Building2, AlertCircle
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/ui/Loader';

import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, AreaChart, Area, Legend
} from 'recharts';

// Animated number counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1 }) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const end = parseInt(value) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const step = Math.max(1, Math.floor(end / 50));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration * 1000 / 50);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, subtext, icon: Icon, delay, color = 'indigo', trend, trendValue }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-l-indigo-500', iconBg: 'bg-linear-to-br from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-500', iconBg: 'bg-linear-to-br from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-l-amber-500', iconBg: 'bg-linear-to-br from-amber-500 to-amber-600', shadow: 'shadow-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-l-rose-500', iconBg: 'bg-linear-to-br from-rose-500 to-rose-600', shadow: 'shadow-rose-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-l-violet-500', iconBg: 'bg-linear-to-br from-violet-500 to-violet-600', shadow: 'shadow-violet-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-l-teal-500', iconBg: 'bg-linear-to-br from-teal-500 to-teal-600', shadow: 'shadow-teal-100' },
  };

  const c = colors[color] || colors.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${c.border} shadow-lg ${c.shadow} hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 ${c.iconBg} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 text-white`} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            {typeof value === 'number' ? <AnimatedCounter value={value} prefix={title.includes('Revenue') || title.includes('Deposits') || title.includes('Dues') ? '₹' : ''} /> : value}
          </h3>
          {subtext && <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1">{subtext}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200"
      >
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        <p className="text-2xl font-bold text-indigo-600">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">Current value</p>
      </motion.div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { shops = [], tenants = [], payments = [], depositTransactions = [], activityLogs = [], loading } = useData();

  if (loading) return <Loader />;

  // Calculate stats with useMemo for performance
  const stats = useMemo(() => {
    const totalTenants = tenants.length;
    const totalShops = shops.length;
    const occupiedShops = shops.filter(s => s.status === 'Occupied').length;
    const vacantShops = totalShops - occupiedShops;
    const occupancyRate = totalShops > 0 ? (occupiedShops / totalShops) * 100 : 0;
    const monthlyRevenue = shops.reduce((acc, shop) => shop.status === 'Occupied' ? acc + shop.rentAmount : acc, 0);

    // Calculate actual deposits held from transactions
    const totalDepositsHeld = depositTransactions.reduce((acc, t) => {
      if (t.type === 'Collection') return acc + t.amount;
      if (t.type === 'Deduction' || t.type === 'Refund') return acc - t.amount;
      return acc;
    }, 0);

    const totalPendingDues = payments.reduce((acc, p) => acc + (p.dueAmount || 0), 0);
    
    // Today's collections
    const today = new Date().toISOString().slice(0, 10);
    const todayPayments = payments.filter(p => p.date?.slice(0, 10) === today);
    const todayCollection = todayPayments.reduce((acc, p) => acc + p.paidAmount, 0);
    
    // This month's revenue
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthPayments = payments.filter(p => p.month === currentMonth);
    const monthCollection = monthPayments.reduce((acc, p) => acc + p.paidAmount, 0);
    
    // Last month's revenue for trend
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    const lastMonthPayments = payments.filter(p => p.month === lastMonth);
    const lastMonthCollection = lastMonthPayments.reduce((acc, p) => acc + p.paidAmount, 0);
    const revenueTrend = monthCollection >= lastMonthCollection ? 'up' : 'down';
    const revenueTrendValue = lastMonthCollection ? Math.round(((monthCollection - lastMonthCollection) / lastMonthCollection) * 100) : 0;
    
    return {
      totalTenants, totalShops, occupiedShops, vacantShops, occupancyRate,
      monthlyRevenue, totalDepositsHeld, totalPendingDues,
      todayCollection, monthCollection, revenueTrend, revenueTrendValue,
      todayPaymentsCount: todayPayments.length
    };
  }, [shops, tenants, payments]);

  // Chart Data
  const occupancyData = [
    { name: 'Occupied', value: stats.occupiedShops, color: '#6366f1', gradient: ['#6366f1', '#818cf8'] },
    { name: 'Vacant', value: stats.vacantShops, color: '#e2e8f0', gradient: ['#cbd5e1', '#e2e8f0'] }
  ];

  const revenueData = [
    { name: 'This Month', amount: stats.monthCollection, color: '#10b981', gradient: ['#10b981', '#34d399'] },
    { name: 'Deposits', amount: stats.totalDepositsHeld, color: '#6366f1', gradient: ['#6366f1', '#818cf8'] },
    { name: 'Pending Dues', amount: stats.totalPendingDues, color: '#f43f5e', gradient: ['#f43f5e', '#fb7185'] }
  ];

  // Monthly trend data (last 6 months)
  const monthlyTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthPayments = payments.filter(p => p.month === monthKey);
      const total = monthPayments.reduce((acc, p) => acc + p.paidAmount, 0);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        revenue: total,
        fullMonth: monthKey
      });
    }
    return months;
  }, [payments]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 pb-24 lg:pb-20 space-y-8 lg:space-y-10">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-indigo-50/20 via-transparent to-emerald-50/20" />
      
      <PageHeader
        title="Admin Dashboard"
        description="Your business overview at a glance"
        icon={<LayoutGrid className="w-6 h-6 text-indigo-600" />}
      >
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
            </span>
          </div>
        </motion.div>
      </PageHeader>

      {/* Quick Stats Cards - Enhanced Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { title: "Today's Collection", value: stats.todayCollection, subtext: `${stats.todayPaymentsCount} payments`, icon: Activity, gradient: "from-emerald-600 to-teal-600", delay: 0 },
          { title: "This Month", value: stats.monthCollection, subtext: `collected`, icon: ReceiptIndianRupee, gradient: "from-indigo-600 to-blue-600", delay: 0.1 },
          { title: "Occupancy Rate", value: `${Math.round(stats.occupancyRate)}%`, subtext: `${stats.occupiedShops} of ${stats.totalShops} shops`, icon: Store, gradient: "from-violet-600 to-purple-600", delay: 0.2 },
          { title: "Pending Dues", value: stats.totalPendingDues, subtext: "outstanding", icon: TrendingUp, gradient: "from-amber-600 to-orange-600", delay: 0.3 }
        ].map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            <div className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            <div className="relative p-5 md:p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{card.title}</p>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold mb-2">
                {typeof card.value === 'number' && card.title.includes('Collection') || card.title.includes('Month') || card.title.includes('Dues') ? 
                  `₹${card.value.toLocaleString()}` : 
                  card.value
                }
              </p>
              <p className="text-white/70 text-xs font-medium">{card.subtext}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        <StatCard 
          title="Total Tenants" 
          value={stats.totalTenants} 
          subtext="Active agreements" 
          icon={Users} 
          delay={0.1} 
          color="indigo"
          trend={stats.totalTenants > 0 ? 'up' : 'down'}
          trendValue="+12%"
        />
        <StatCard 
          title="Shop Occupancy" 
          value={`${stats.occupiedShops}/${stats.totalShops}`} 
          subtext={`${stats.vacantShops} Vacant shops available`} 
          icon={Store} 
          delay={0.2} 
          color="violet"
        />
        <StatCard 
          title="Monthly Revenue" 
          value={stats.monthlyRevenue} 
          subtext="Expected this month" 
          icon={ReceiptIndianRupee} 
          delay={0.3} 
          color="emerald"
          trend={stats.revenueTrend}
          trendValue={`${Math.abs(stats.revenueTrendValue)}%`}
        />
        <StatCard 
          title="Total Deposits" 
          value={stats.totalDepositsHeld} 
          subtext="From active tenants" 
          icon={ShieldCheck} 
          delay={0.4} 
          color="teal"
        />
        <StatCard 
          title="Pending Dues" 
          value={stats.totalPendingDues} 
          subtext="Unpaid dues to collect" 
          icon={AlertCircle} 
          delay={0.5} 
          color="rose"
          trend="down"
          trendValue="8%"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ y: -4 }}
          className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <Badge variant="warning" className="bg-amber-500/20 text-amber-300">Quick Stats</Badge>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Average Rent</p>
          <h3 className="text-2xl font-bold mb-3">
            ₹{stats.totalShops > 0 ? Math.round(stats.monthlyRevenue / stats.occupiedShops) : 0}
          </h3>
          <p className="text-slate-400 text-xs">per occupied shop</p>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Collection Efficiency</span>
              <span className="text-sm font-semibold text-emerald-400">
                {stats.monthCollection > 0 && stats.monthlyRevenue > 0 ? Math.round((stats.monthCollection / stats.monthlyRevenue) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats.monthCollection > 0 && stats.monthlyRevenue > 0 ? (stats.monthCollection / stats.monthlyRevenue) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Occupancy Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Shop Occupancy</h3>
                  <p className="text-sm text-slate-500 mt-1">Current shop distribution status</p>
                </div>
                <Badge variant="indigo" className="text-sm px-3 py-1">
                  {stats.occupancyRate.toFixed(1)}% Full
                </Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="h-70">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {occupancyData.map((entry, idx) => (
                        <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.gradient[0]} stopOpacity={1} />
                          <stop offset="100%" stopColor={entry.gradient[1]} stopOpacity={0.9} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke="white" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-around">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Occupied Shops</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.occupiedShops}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Vacant Shops</p>
                  <p className="text-2xl font-bold text-slate-400">{stats.vacantShops}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Total Shops</p>
                  <p className="text-2xl font-bold text-slate-700">{stats.totalShops}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Overview Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div>
                <h3 className="font-bold text-xl text-slate-900">Financial Overview</h3>
                <p className="text-sm text-slate-500 mt-1">Revenue, deposits & pending dues</p>
              </div>
            </div>
            <div className="p-6">
              <div className="h-70">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barCategoryGap="35%" margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      {revenueData.map((entry, idx) => (
                        <linearGradient key={`bar-grad-${idx}`} id={`barGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.gradient[0]} stopOpacity={1} />
                          <stop offset="100%" stopColor={entry.gradient[1]} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.5 }} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={120}>
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#barGradient${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-linear-to-r from-emerald-500 to-teal-500" />
                    <p className="text-xs font-semibold text-slate-600">Revenue</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">₹{stats.monthCollection.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600" />
                    <p className="text-xs font-semibold text-slate-600">Deposits</p>
                  </div>
                  <p className="text-lg font-bold text-indigo-600">₹{stats.totalDepositsHeld.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-linear-to-r from-rose-500 to-pink-500" />
                    <p className="text-xs font-semibold text-slate-600">Dues</p>
                  </div>
                  <p className="text-lg font-bold text-rose-600">₹{stats.totalPendingDues.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900">Revenue Trend</h3>
                <p className="text-sm text-slate-500 mt-1">Last 6 months collection history</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">
                  {stats.revenueTrendValue >= 0 ? '+' : ''}{stats.revenueTrendValue}% vs last month
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fill="url(#revenueGradient)" 
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Recent Payments</h3>
                  <p className="text-sm text-slate-500 mt-1">Latest rent payments received</p>
                </div>
                <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-0">
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CircleDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No payments recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {payments.slice(0, 5).map((payment, idx) => {
                      const tenant = tenants.find(t => t._id === payment.tenantId);
                      return (
                        <motion.div
                          key={payment._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ backgroundColor: '#f8fafc' }}
                          className="px-6 py-4 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-inner">
                                <span className="font-bold text-emerald-700 text-base">
                                  {(tenant?.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{tenant?.name || 'Unknown'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-slate-500">{payment.month}</p>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <p className="text-xs text-slate-500">{new Date(payment.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900 text-lg">₹{payment.paidAmount.toLocaleString()}</p>
                              <Badge 
                                variant={payment.status === 'Paid' ? 'success' : 'warning'} 
                                className="mt-1 text-xs"
                              >
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
              <div>
                <h3 className="font-bold text-xl text-slate-900">Activity Logs</h3>
                <p className="text-sm text-slate-500 mt-1">System activity and recent updates</p>
              </div>
            </div>
            <div className="p-6">
              {activityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No activity logs yet.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-indigo-200 via-slate-200 to-transparent" />
                  <div className="space-y-6">
                    <AnimatePresence>
                      {activityLogs.slice(0, 5).map((log, idx) => (
                        <motion.div
                          key={log._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-4 relative"
                        >
                          <div className="relative z-10">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors duration-200">
                              <p className="font-semibold text-slate-900 text-sm">{log.action}</p>
                              <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-medium text-indigo-600">{log.user}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-xs text-slate-400">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
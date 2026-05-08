import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { 
  Building2, 
  Users, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';

const StatCard = ({ title, value, subValue, icon: Icon, trend, color }) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <span className={`flex items-center text-xs font-semibold ${
                trend > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subValue && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DashboardStats = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value={`₹${data.financial.monthlyRevenue.toLocaleString()}`}
        subValue="Lifetime collected"
        icon={IndianRupee}
        color="blue"
      />
      <StatCard
        title="Active Tenants"
        value={data.tenants.active}
        subValue={`${data.tenants.inactive} inactive`}
        icon={Users}
        color="indigo"
      />
      <StatCard
        title="Occupancy"
        value={data.shops.total > 0 ? `${Math.round((data.shops.occupied / data.shops.total) * 100)}%` : '0%'}
        subValue={`${data.shops.vacant} shops vacant`}
        icon={Building2}
        color="emerald"
      />
      <StatCard
        title="Security Deposits"
        value={`₹${data.deposits.totalDepositsHeld.toLocaleString()}`}
        subValue="Active deposits"
        icon={ShieldCheck}
        color="amber"
      />
    </div>
  );
};

export default DashboardStats;

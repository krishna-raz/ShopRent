import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ReceiptIndianRupee,
  History,
  ShieldCheck,
  ScrollText,
  ChevronRight,
  LogOut,
  UserCog
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tenants', path: '/tenants', icon: Users },
    { name: 'Shops', path: '/shops', icon: Store },
    { name: 'Rent Payments', path: '/rent-payments', icon: ReceiptIndianRupee },
    { name: 'Due Payments', path: '/due-payments', icon: History },
    { name: 'Security Deposits', path: '/deposits', icon: ShieldCheck },
    { name: 'Activity Logs', path: '/activity-logs', icon: ScrollText },
    ...(user?.role === 'superadmin' ? [{ name: 'Users', path: '/users', icon: UserCog }] : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          ShopRent Pro
        </h1>
        {user && (
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {user.role || 'Administrator'}
          </p>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => twMerge(
              "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.name}
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

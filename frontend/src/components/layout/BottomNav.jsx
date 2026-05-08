import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ReceiptIndianRupee, 
  MoreHorizontal
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const BottomNav = () => {
  const items = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Tenants', path: '/tenants', icon: Users },
    { name: 'Shops', path: '/shops', icon: Store },
    { name: 'Rent', path: '/rent-payments', icon: ReceiptIndianRupee },
    { name: 'Menu', path: '/activity-logs', icon: MoreHorizontal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around z-50">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => twMerge(
            "flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-all",
            isActive ? "text-indigo-600" : "text-slate-400"
          )}
        >
          {({ isActive }) => (
            <>
              <item.icon className={twMerge("w-5 h-5", isActive && "stroke-[2.5px]")} />
              {item.name}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardSidebar = ({ userRole = 'admin', userName = 'Alex Rivera', userTitle = 'Lead Manager' }) => {
  const location = useLocation();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : '/user' },
    { icon: 'assignment', label: userRole === 'user' ? 'My Tasks' : 'Tasks', path: '#' },
    { icon: 'group', label: 'Team', path: '#' },
    { icon: 'insights', label: 'Analytics', path: '#' },
    { icon: 'settings', label: 'Settings', path: '#' },
  ];

  const bottomItems = [
    { icon: 'help', label: 'Help Center', path: '#' },
    { icon: 'logout', label: 'Logout', path: '/auth' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-zinc-100 flex flex-col z-40">
      {/* Brand */}
      <div className="px-8 pt-8 pb-6">
        <Link to="/" className="text-xl font-bold tracking-[-0.04em] text-zinc-900 font-geist geist-medium">Gradient</Link>
        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 mt-1 geist-medium">Productivity Suite</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] geist-medium transition-all duration-200 group
              ${isActive(item.path)
                ? 'bg-zinc-900 text-white shadow-md'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive(item.path) ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`} 
              style={{ fontVariationSettings: isActive(item.path) ? '"FILL" 1, "wght" 400' : '"FILL" 0, "wght" 300' }}>
              {item.icon === 'dashboard' ? 'grid_view' : item.icon === 'assignment' ? 'assignment_turned_in' : item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="px-4 pb-4 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] geist-medium text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 0, "wght" 300' }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="px-6 py-5 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center overflow-hidden">
            <img 
              alt={userName}
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WUT7g_i6Reb4nzK8VPWzjsXzj9-X-PUOkcphTAaQMuZgylbnpWYJQnnzU1VlZaTazIsoWHihMDCJbwULGHPA8Osll1YKSXcAvspbYsetTyKwGCRxS3uLRgsKgH8KJOowZjwSXVyERQkbJ0rOxSZnmbumCxvohLthcDf9exxGGPIUi7fW-8j0uMvzK5SNvwc4YyV1YGmxUQUvZaoIAPn7JrkzDH8KXz1g-dirHxU3_h9gSOYT1zfKcU7-ZMYdCTNj0t3TreXZK3t"
            />
          </div>
          <div>
            <div className="text-[13px] geist-medium text-zinc-800">{userName}</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 geist-medium">{userTitle}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

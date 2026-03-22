import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ title = 'Dashboard', userName = 'Alex Rivera', userRole = 'Lead Manager' }) => {
  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-8">
        <h1 className="text-[22px] geist-medium tracking-[-0.03em] text-zinc-900">{title}</h1>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="#" className="text-[12px] geist-medium uppercase tracking-[0.12em] text-zinc-400 hover:text-zinc-800 transition-colors">Features</Link>
          <Link to="#" className="text-[12px] geist-medium uppercase tracking-[0.12em] text-zinc-400 hover:text-zinc-800 transition-colors">Solutions</Link>
          <Link to="#" className="text-[12px] geist-medium uppercase tracking-[0.12em] text-zinc-400 hover:text-zinc-800 transition-colors">Pricing</Link>
        </nav>
      </div>
      <div className="flex items-center gap-5">
        <button className="relative p-2 text-zinc-400 hover:text-zinc-700 transition-colors">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: '"FILL" 0, "wght" 300' }}>notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full"></span>
        </button>
        <button className="p-2 text-zinc-400 hover:text-zinc-700 transition-colors">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: '"FILL" 0, "wght" 300' }}>search</span>
        </button>
        <div className="h-6 w-px bg-zinc-100"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[12px] geist-medium text-zinc-700">{userName}</div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-zinc-400 geist-medium">{userRole}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
            <img 
              alt={userName}
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WUT7g_i6Reb4nzK8VPWzjsXzj9-X-PUOkcphTAaQMuZgylbnpWYJQnnzU1VlZaTazIsoWHihMDCJbwULGHPA8Osll1YKSXcAvspbYsetTyKwGCRxS3uLRgsKgH8KJOowZjwSXVyERQkbJ0rOxSZnmbumCxvohLthcDf9exxGGPIUi7fW-8j0uMvzK5SNvwc4YyV1YGmxUQUvZaoIAPn7JrkzDH8KXz1g-dirHxU3_h9gSOYT1zfKcU7-ZMYdCTNj0t3TreXZK3t"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

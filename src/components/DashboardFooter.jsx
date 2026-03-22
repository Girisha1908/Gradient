import React from 'react';

const DashboardFooter = () => {
  return (
    <footer className="py-6 px-8 border-t border-zinc-100 bg-white/60 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-[10px] geist-medium uppercase tracking-[0.15em] text-zinc-400">© 2024 Kinetic. Editorial Suite.</span>
        <div className="flex items-center gap-8">
          {['Privacy', 'Terms', 'Security', 'Status'].map((link) => (
            <a key={link} className="text-[10px] geist-medium uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-700 transition-colors" href="#">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;

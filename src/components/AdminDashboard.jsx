import React from 'react';
import { Link } from 'react-router-dom';

const AVATAR1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuAgZeV7DJJr061w2YVYsE8_2qc3yxVD0e2So5mX1e3cbQGsdsvzeP0cgFFC_hCQnbag1wPXC6GeWnFIuHbysi3XQ8BRufr6Tosl5g-N14-y-6LwqHR9fZTR7MJP_-n1ritFqXylzd2CrMMiAubjsgXtpL-JDREHrwdLDWAjWHKz2JYORBlsSBMoRlrePNuzGnsYlACTPL2ueFD-05YSvz0dMTKN-ciPHylGDwNHL2oaSlD6YFf3X-tZJ_G7BAP5spp9jPvAiwQ0Yv4R";
const AVATAR2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8eXupNVyeFUhzEfPyYNeRA3m5mDjkNpT5gtcC3YJwsbeG6Opaog6pRJLgsg9apcvc5RCyPP6VzYafn_wiZ3ZGbeDYWJ1ezVsYsADWQjgPyAoxTbsM-eWU3pAryKQVcPlE_yCoG646DBCaz-70S-xqS_dxabMeGX7fIS94ndunbuu7PVDWGcTFFjrjW--62zC12SWy2H1hWArRPOxZzr0eul-dtWC4uQ1qhn3D8L3EyBXw_Ah3f4uFDTXSSURoNYEWhrPcQLANDB2";

const pulseStats = [
  { label: 'Total Active Users', value: '12,842', trend: '+14%', green: true },
  { label: 'Tasks Completed', value: '942', sub: 'TODAY' },
  { label: 'System Latency', value: '24', unit: 'ms', greenText: 'Optimal State' },
  { label: 'Resource Load', value: '68%', dark: true, bar: 68 },
];
const criticalTasks = [
  { title: 'Security Audit Protocol X1', sub: 'HIGH PRIORITY • ASSIGNED TO: Sarah K.', dot: 'bg-red-500' },
  { title: 'API Endpoints Optimization', sub: 'MEDIUM PRIORITY • ASSIGNED TO: David L.', dot: 'bg-[#1d1d1d]' },
  { title: 'Infrastructure Scalability Plan', sub: 'LOW PRIORITY • ASSIGNED TO: Infrastructure Team', dot: 'bg-[#c6c6c6]' },
];
const todayTasks = [
  { text: 'Finalize Q4 roadmap presentation', done: false },
  { text: 'Review Engineering PRs #421-428', done: false },
  { text: 'Morning sync with Design Ops', done: true },
  { text: 'Client feedback synthesis', done: false },
];
const actFeed = [
  { title: 'System Update', desc: 'deployed to staging', time: '12 MIN AGO', active: true },
  { title: 'New Team Member', desc: 'joined Engineering Hub', time: '2 HOURS AGO' },
  { title: 'Resource Load', desc: 'spiked at 84%', time: '5 HOURS AGO' },
];
const sideItems = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'assignment', label: 'Tasks' },
  { icon: 'group', label: 'Team' },
  { icon: 'insights', label: 'Analytics' },
  { icon: 'settings', label: 'Settings' },
];

const AdminDashboard = () => (
  <div className="bg-[#fafafa] text-[#1d1d1d] font-body min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* TopNavBar */}
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100 shadow-[0px_20px_50px_rgba(0,0,0,0.03)] flex justify-between items-center w-full px-8 py-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-medium tracking-tighter">Kinetic Mono</Link>
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-bold tracking-tight">
          <a className="text-zinc-900 border-b-2 border-zinc-900 pb-1" href="#">Dashboard</a>
          <a className="text-zinc-400 hover:text-zinc-900 transition-colors" href="#">Tasks</a>
          <a className="text-zinc-400 hover:text-zinc-900 transition-colors" href="#">Team</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined p-2 text-zinc-400 hover:text-zinc-900 transition-colors">notifications</button>
        <button className="bg-gradient-to-b from-[#1d1d1d] to-black text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-transform shadow-[0px_4px_10px_rgba(0,0,0,0.1),inset_0px_1px_1px_rgba(255,255,255,0.2)]">Create Task</button>
      </div>
    </header>

    <div className="flex min-h-screen">
      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col h-full p-6 gap-y-2 bg-zinc-50 text-[11px] font-bold uppercase tracking-[0.25em] h-screen w-64 fixed left-0 top-0 border-r border-zinc-100 z-40 pt-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="mb-8 px-4">
          <p className="text-[10px] text-zinc-400 tracking-widest">MANAGEMENT</p>
          <h2 className="text-lg font-bold tracking-tighter normal-case">Admin</h2>
        </div>
        {sideItems.map(i => (
          <a key={i.label} className={`flex items-center gap-3 px-4 py-3 ${i.active ? 'text-zinc-900 bg-white rounded-full shadow-sm' : 'text-zinc-400 hover:bg-zinc-100'} transition-all`} href="#">
            <span className="material-symbols-outlined">{i.icon}</span>{i.label}
          </a>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8 md:p-12 bg-[#fafafa] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-zinc-200 to-transparent rounded-full blur-[120px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-zinc-100 to-transparent rounded-full blur-[100px] -ml-20 -mb-20"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#71717a]">SYSTEM OVERVIEW</span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter" style={{ fontFamily: "'Plus Jakarta Sans'" }}>Operational <span className="font-serif italic font-normal">Pulse</span></h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src={AVATAR1} alt="" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src={AVATAR2} alt="" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold">+8</div>
              </div>
              <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-widest">Live Now</span>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pulseStats.map(s => (
              <div key={s.label} className={`p-8 rounded-2xl flex flex-col justify-between h-48 ${s.dark ? 'bg-[#1d1d1d] text-white shadow-xl' : 'bg-white shadow-[0px_20px_50px_rgba(0,0,0,0.03)] border border-[#e4e4e7]'}`}>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${s.dark ? 'text-zinc-400' : 'text-[#71717a]'}`}>{s.label}</span>
                <div className="space-y-1">
                  <p className="text-4xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans'" }}>{s.value}{s.unit && <span className="text-xl ml-1">{s.unit}</span>}</p>
                  {s.green && <p className="text-[11px] text-green-600 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-xs">trending_up</span>{s.trend}</p>}
                  {s.sub && <p className="text-[11px] text-zinc-400 font-bold">{s.sub}</p>}
                  {s.greenText && <p className="text-[11px] text-green-600 font-bold font-serif italic">{s.greenText}</p>}
                  {s.bar && <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden"><div className="bg-white h-full" style={{ width: `${s.bar}%` }}></div></div>}
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              {/* Team Performance */}
              <section className="bg-white rounded-2xl shadow-[0px_20px_50px_rgba(0,0,0,0.03)] border border-[#e4e4e7] p-8">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'" }}>Team Performance <span className="font-serif italic font-normal">Matrix</span></h3>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] hover:text-[#1d1d1d]">VIEW REPORT</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[{ icon: 'palette', name: 'Design Ops', members: '8', metric: 'Velocity', pct: 92 }, { icon: 'terminal', name: 'Engineering Hub', members: '14', metric: 'Uptime', pct: 99.9 }].map(t => (
                    <div key={t.name} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center border border-[#f4f4f5]"><span className="material-symbols-outlined text-[#1d1d1d]">{t.icon}</span></div>
                        <div><p className="text-sm font-bold">{t.name}</p><p className="text-[10px] text-[#71717a] tracking-widest uppercase">{t.members} MEMBERS</p></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest"><span>{t.metric}</span><span>{t.pct}%</span></div>
                        <div className="h-0.5 bg-zinc-100 w-full"><div className="h-full bg-[#1d1d1d]" style={{ width: `${t.pct}%` }}></div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              {/* Critical Tasks */}
              <section className="bg-white rounded-2xl shadow-[0px_20px_50px_rgba(0,0,0,0.03)] border border-[#e4e4e7] overflow-hidden">
                <div className="p-8 border-b border-[#f4f4f5]"><h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'" }}>Critical Tasks <span className="font-serif italic font-normal">Monitor</span></h3></div>
                <div className="divide-y divide-[#f4f4f5]">
                  {criticalTasks.map(t => (
                    <div key={t.title} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-center gap-4"><span className={`w-2 h-2 rounded-full ${t.dot}`}></span><div><p className="text-sm font-bold">{t.title}</p><p className="text-[10px] text-[#71717a] tracking-widest uppercase">{t.sub}</p></div></div>
                      <button className="px-4 py-2 border border-[#f4f4f5] rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-[#1d1d1d] hover:text-white transition-all">Review</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="space-y-8">
              {/* Due Today */}
              <section className="bg-white rounded-2xl p-8 shadow-[0px_20px_50px_rgba(0,0,0,0.03)] border border-[#e4e4e7]">
                <div className="mb-6"><h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'" }}>Due <span className="font-serif italic font-normal">Today</span></h3><p className="text-[10px] text-[#71717a] font-bold uppercase tracking-widest">4 TASKS REMAINING</p></div>
                <ul className="space-y-4">
                  {todayTasks.map((t, i) => (
                    <li key={i} className={`flex items-start gap-3 ${t.done ? 'opacity-40' : ''}`}>
                      {t.done ? <div className="mt-1 w-4 h-4 rounded-full bg-[#1d1d1d] flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[10px] text-white">check</span></div> : <div className="mt-1 w-4 h-4 rounded border border-zinc-300 shrink-0"></div>}
                      <p className={`text-sm ${t.done ? 'line-through' : ''}`}>{t.text}</p>
                    </li>
                  ))}
                </ul>
              </section>
              {/* Activity Feed */}
              <section className="bg-white rounded-2xl p-8 shadow-[0px_20px_50px_rgba(0,0,0,0.03)] border border-[#e4e4e7]">
                <div className="mb-8"><h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'" }}>Activity <span className="font-serif italic font-normal">Feed</span></h3></div>
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-1.5 before:w-px before:-translate-x-1/2 before:bg-zinc-100">
                  {actFeed.map((a, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className={`mt-1.5 w-3 h-3 rounded-full ${a.active ? 'bg-[#1d1d1d]' : 'bg-zinc-300'} border-4 border-white z-10`}></div>
                      <div><p className="text-sm font-medium">{a.title} <span className="text-[#71717a] font-normal">{a.desc}</span></p><p className="text-[10px] text-[#71717a] uppercase tracking-widest mt-1">{a.time}</p></div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
    <footer className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest w-full py-8 border-t border-zinc-100 flex justify-between items-center px-8 relative z-50" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
      <div className="flex gap-6">{['Privacy','Terms','Support'].map(l=><a key={l} className="text-zinc-400 hover:text-zinc-900 transition-all" href="#">{l}</a>)}</div>
      <p className="text-zinc-400">© 2024 Kinetic Mono Editorial</p>
    </footer>
  </div>
);

export default AdminDashboard;

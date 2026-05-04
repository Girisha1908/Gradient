import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TeamFormation from '../components/TeamFormation';
import { supabase } from '../lib/supabase';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export default function TeamPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [teamAnalytics, setTeamAnalytics] = React.useState([]);

  React.useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: teamsData } = await supabase.from('teams').select('*, team_members(user_id)');
      if (!teamsData) return;
      
      const analytics = [];
      for (const team of teamsData) {
        const memberIds = (team.team_members || []).map(m => m.user_id);
        const { data: teamTasks } = await supabase
          .from('tasks')
          .select('id, status')
          .eq('team_id', team.id);
        const total = (teamTasks || []).length;
        const completedCount = (teamTasks || []).filter(t => t.status === 'completed').length;
        const pendingCount = total - completedCount;
        const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        analytics.push({
          id: team.id,
          name: team.name,
          members: memberIds.length,
          totalTasks: total,
          completed: completedCount,
          pending: pendingCount,
          completionRate,
        });
      }
      setTeamAnalytics(analytics);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white text-[#373a46] selection:bg-[#373a46]/10 min-h-screen relative" style={{ fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
      {/* Background Video & Overlays */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden">
        <video autoPlay className="w-full h-full object-cover scale-y-[-1] opacity-30" loop muted playsInline>
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 26.416%, white 66.943%)' }}></div>
      </div>

      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-white/40 backdrop-blur-md flex flex-col py-8 px-6 gap-2 border-r border-black/5">
        <div className="mb-12 px-2">
          <Link to="/" className="text-xl font-medium tracking-[0.1em] uppercase">Gradient</Link>
          <span className="block text-xs text-[#6b7280] font-medium mt-1 uppercase tracking-widest opacity-60">Admin Console</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button onClick={() => navigate('/manager')} className="w-full flex items-center gap-3 py-3 px-4 text-[#6b7280] hover:text-[#373a46] transition-all group">
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">dashboard</span>
            <span className="text-sm font-semibold tracking-tight">Dashboard</span>
          </button>
          {[
            { icon: 'group', label: 'Team', route: '/team' },
            { icon: 'insert_chart', label: 'Portfolio', route: '/portfolio' },
            { icon: 'workspace_premium', label: 'Experience', route: '/experience' },
            { icon: 'settings', label: 'Settings', route: '#' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.route)} className={`w-full flex items-center gap-3 py-3 px-4 transition-all group ${item.route === '/team' ? 'bg-white/80 shadow-sm border border-black/5 text-[#373a46] rounded-xl' : 'text-[#6b7280] hover:text-[#373a46]'}`}>
              <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-semibold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-black/5 space-y-1">
          <button className="w-full flex items-center gap-3 py-2 px-4 text-[#6b7280] hover:text-[#373a46] transition-all">
            <span className="material-symbols-outlined text-sm">help</span>
            <span className="text-xs font-semibold tracking-tight">Support</span>
          </button>
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-3 py-2 px-4 text-[#6b7280] hover:text-[#373a46] transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="text-xs font-semibold tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-64 h-20 z-30 bg-white/30 backdrop-blur-xl flex justify-between items-center px-10 border-b border-black/[0.03]">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-medium">Team <span className="font-serif italic font-normal">Management</span></h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <TeamFormation />

          {teamAnalytics.length > 0 && (
            <section className="fade-in-section bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.05)] mt-10" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">analytics</span>
                  </div>
                  <h2 className="text-2xl font-medium">Team <span className="font-serif italic font-normal">Analytics</span></h2>
                </div>
                <button onClick={loadAnalytics} className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#373a46] border-b border-[#373a46] hover:opacity-70">Refresh Data</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamAnalytics.map(ta => (
                  <div key={ta.id} className="p-6 rounded-2xl bg-zinc-50 border border-black/[0.03] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[15px] tracking-tight text-[#1d1d1d]">{ta.name}</h4>
                      <span className="px-3 py-1 bg-white border border-black/5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">{ta.members} members</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50">Completion Rate</p>
                          <p className="text-3xl font-medium tracking-tighter mt-1 text-[#1d1d1d]">{ta.completionRate}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50">Tasks</p>
                          <p className="text-lg font-semibold tracking-tight text-[#1d1d1d]">{ta.completed}/{ta.totalTasks}</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${ta.completionRate}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-green-600">{ta.completed} completed</span>
                        <span className="text-[#6b7280] opacity-50">{ta.pending} pending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

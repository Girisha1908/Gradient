import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { getProfileByEmail } from '../lib/database';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";
const AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCROfD2ns6ibcgUhJa5xCVAvY5ep-HXrt6ETZCFbSr9SGy6vljw3t9HFGPQB_FaMpFqV_TVQZY0qJX2FmfS4ox9N42UDEIAoro8on8KOGDeLgAIN25Dj-6MVEfI0fDFhchg_I3RaSU1cB6hKEos5LA_kMZeeFPx0FoFH1jsAcmRFPstRrHKVr9vsTn2Cmk1Cy3mP6TCp8OU_lniSCRHI4_8EqX93btuxl1nwgAS8G3ISMDfC12CpS07DV-BTU8uUcw_mK3SBn2VeLe2";

const sideNav = [
  { icon: 'assignment_turned_in', label: 'My Tasks', route: '/dashboard' },
  { icon: 'insights', label: 'Portfolio', route: '/portfolio' },
  { icon: 'workspace_premium', label: 'Experience', route: '/experience' },
  { icon: 'settings', label: 'Settings' },
];

const PortfolioPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  // ProtectedRoute guarantees user is authenticated + employee before this mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadData(user);
    }
  }, []);

  const loadData = async (user) => {
    try {
      const mappedId = await getProfileByEmail(user.email);

      // FETCH APPROVED WORK WITH FALLBACK FOR EXISTING SCHEMA
      let portfolioData = [];
      try {
        const { data, error } = await supabase
          .from("task_deliverables")
          .select(`
            *,
            tasks (title),
            profiles!task_deliverables_verified_by_fkey(email)
          `)
          .eq("submitted_by", mappedId)
          .eq("verified", true);
          
        if (error) throw error;
        portfolioData = data || [];
      } catch (err) {
        console.warn("Verified schema not fully applied. Falling back to old query.", err);
        const { data: legacyData } = await supabase
          .from("task_deliverables")
          .select('*, tasks(title)')
          .eq("submitted_by", mappedId)
          .eq("status", "approved");
        portfolioData = legacyData || [];
      }
      
      setPortfolio(portfolioData);

    } catch (e) {
      console.error("Portfolio Load Error:", e);
    }
  };

  const handleOpenPortfolio = (item) => {
    const type = item.submission_type || item.type;
    const content = item.content_url || item.content;
    
    if (type === "link") {
      window.open(content, "_blank");
    } else {
      if (content.startsWith("http")) {
         window.open(content, "_blank");
      } else {
         const { data } = supabase.storage
           .from("attachments")
           .getPublicUrl(content);
         window.open(data.publicUrl, "_blank");
      }
    }
  };

  return (
    <div className="bg-[#fafafa] text-[#1d1d1d] min-h-screen" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video autoPlay className="absolute w-full h-full object-cover scale-y-[-1] opacity-20" loop muted playsInline>
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 26%, white 67%)' }}></div>
      </div>
      
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/40 backdrop-blur-xl border-r border-[#f4f4f5] flex flex-col py-10 px-8 z-50">
        <div className="mb-16">
          <Link to="/" className="text-xl font-medium tracking-[0.15em] uppercase">Gradient</Link>
          <p className="text-[10px] text-[#71717a] font-bold mt-1.5 uppercase tracking-[0.2em] opacity-50">Productivity Suite</p>
        </div>
        <nav className="flex-1 space-y-2">
          {sideNav.map(i => (
            <button 
              key={i.label} 
              onClick={() => {
                if (i.route) navigate(i.route);
              }}
              className={`flex items-center gap-4 py-3.5 px-5 transition-all group w-full text-left ${i.route === '/portfolio' ? 'bg-white rounded-2xl border border-[#f4f4f5] shadow-sm text-[#1d1d1d]' : 'text-[#71717a] hover:text-[#1d1d1d]'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${i.route === '/portfolio' ? '' : 'group-hover:scale-105 transition-transform'}`}>{i.icon}</span>
              <span className={`text-[13px] tracking-tight ${i.route === '/portfolio' ? 'font-semibold' : 'font-medium'}`}>{i.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full bg-[#1d1d1d] text-white py-4 rounded-2xl font-bold text-[11px] tracking-[0.15em] uppercase btn-editorial-shadow">Log Out</button>
        </div>
      </aside>
      
      <main className="ml-72 min-h-screen relative z-10">
        <header className="fixed top-0 right-0 left-72 h-24 bg-white/40 backdrop-blur-xl border-b border-[#f4f4f5] flex justify-between items-center px-12 z-40">
          <h2 className="text-2xl font-medium tracking-tight">Proof of Work <span className="font-serif italic">Portfolio</span></h2>
          <div className="flex items-center gap-8">
            <div className="relative"><span className="material-symbols-outlined text-[#71717a] text-[24px]">notifications</span><span className="absolute top-0 right-0 w-2 h-2 bg-black rounded-full ring-2 ring-white"></span></div>
            <div className="flex items-center gap-4 pl-6 border-l border-[#f4f4f5]">
              <div className="text-right hidden sm:block"><p className="text-[13px] font-bold tracking-tight">{currentUser?.email}</p><p className="text-[10px] text-[#71717a] font-bold opacity-50 uppercase tracking-widest">Employee</p></div>
              <img alt="User" className="w-10 h-10 rounded-full border border-[#f4f4f5] object-cover" src={AVATAR} />
            </div>
          </div>
        </header>
        
        <div className="pt-36 px-12 pb-24 max-w-5xl mx-auto">
          <section className="bg-white p-12 rounded-[3rem] border border-[#f4f4f5] shadow-[0px_20px_50px_rgba(0,0,0,0.03)] focus-within:ring-2 ring-black/5">
            <div className="flex items-center gap-5 mb-12">
              <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white"><span className="material-symbols-outlined text-[18px]">verified</span></div>
              <h3 className="text-2xl font-medium tracking-tight">Proof of Work <span className="font-serif italic">Portfolio</span></h3>
            </div>
            
            <div className="space-y-6">
              {portfolio.length === 0 ? <p className="text-sm text-[#71717a] py-10 text-center italic opacity-60">Your portfolio is currently empty. Complete tasks to build it.</p> : portfolio.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="group p-6 rounded-2xl border border-black/[0.03] bg-white/50 flex flex-col md:flex-row md:items-start justify-between shadow-sm hover:shadow-md transition-all gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-semibold text-[15px]">{item.tasks?.title}</h4>
                      <span className={`verified-badge px-3 py-1 ${item.verified ? 'bg-black text-white' : 'bg-zinc-100 text-[#71717a]'} rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm`}>
                        <span className="material-symbols-outlined text-[10px]">{item.verified ? 'verified' : 'check_circle'}</span> {item.verified ? 'Verified' : 'Approved'}
                      </span>
                    </div>
                    <div className="text-[#6b7280] text-[11px] font-medium leading-relaxed max-w-lg space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[12px] opacity-70">domain</span>
                        Verified by <span className="font-bold text-[#1d1d1d]">{item.company_name || 'Standardized Global (SGG)'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[12px] opacity-70">person</span>
                        Reviewed by <span className="font-bold text-[#1d1d1d]">{item.profiles?.email || 'System Administrator'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[12px] opacity-70">event</span>
                        Completed on <span className="font-bold text-[#1d1d1d]">{new Date(item.verified_at || item.reviewed_at || item.created_at).toLocaleDateString()}</span>
                      </p>
                      <p className="flex items-center gap-2 mt-3 pt-3 border-t border-black/5">
                        <span className="material-symbols-outlined text-[12px] opacity-70">comment</span>
                        <span className="font-bold text-[#1d1d1d]">Feedback:</span> {item.feedback || "Approved with no issues."}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <button onClick={() => handleOpenPortfolio(item)} className="px-5 py-2.5 bg-zinc-100 text-[#1d1d1d] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">
                        {item.submission_type === 'link' ? 'link' : 'download'}
                      </span>
                      View Work
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [verifiedWork, setVerifiedWork] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [activeCompany, setActiveCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Fetch profile by username
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !prof) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(prof);

      // Fetch verified work
      const { data: work } = await supabase
        .from('task_deliverables')
        .select(`
          *,
          tasks (title, description, priority)
        `)
        .eq('submitted_by', prof.id)
        .eq('verified', true)
        .order('created_at', { ascending: false });

      const safeWork = work || [];
      setVerifiedWork(safeWork);

      // Group by company
      const companyMap = safeWork.reduce((acc, item) => {
        const company = item.company_name || 'Independent';
        if (!acc[company]) acc[company] = [];
        acc[company].push(item);
        return acc;
      }, {});
      setGrouped(companyMap);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setNotFound(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
        <span className="material-symbols-outlined text-6xl text-zinc-300 mb-4">person_off</span>
        <h1 className="text-2xl font-medium mb-2">Profile not found</h1>
        <p className="text-sm text-zinc-500 mb-8">The username <span className="font-bold">@{username}</span> doesn't exist.</p>
        <Link to="/" className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] text-[#1d1d1d] min-h-screen relative" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video autoPlay className="absolute w-full h-full object-cover scale-y-[-1] opacity-15" loop muted playsInline>
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 26%, white 67%)' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-xl border-b border-black/[0.03]">
        <div className="max-w-5xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/" className="text-xl font-medium tracking-[0.15em] uppercase">Gradient</Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] opacity-50">Public Profile</span>
        </div>
      </header>

      {/* Profile Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-8 pt-16 pb-20">
        {/* Profile Header */}
        <section className="mb-16">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {(profile.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-medium tracking-tight">@{profile.username}</h1>
              <p className="text-sm text-[#71717a] mt-1">{profile.email}</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <span className="text-3xl font-medium tracking-tighter">{verifiedWork.length}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] opacity-50 mt-1">Verified Works</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-medium tracking-tighter">{Object.keys(grouped).length}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#71717a] opacity-50 mt-1">Companies</p>
            </div>
          </div>
        </section>

        {/* Company-wise Verified Work */}
        <section>
          <h2 className="text-xl font-medium mb-8">Verified <span className="font-serif italic font-normal">Portfolio</span></h2>

          {Object.keys(grouped).length === 0 ? (
            <div className="p-12 border border-dashed border-[#e4e4e7] rounded-3xl text-center">
              <span className="material-symbols-outlined text-4xl text-[#71717a] mb-4">inventory_2</span>
              <p className="text-sm text-[#71717a]">No verified work yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([company, items]) => (
                <div key={company} className="bg-white/60 backdrop-blur-sm rounded-[2rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.1)] overflow-hidden">
                  {/* Company Header — clickable */}
                  <button
                    onClick={() => setActiveCompany(activeCompany === company ? null : company)}
                    className="w-full p-8 flex items-center justify-between hover:bg-white/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-sm">business</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-[15px] tracking-tight">{company}</h3>
                        <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest opacity-50">{items.length} verified task{items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-sm text-zinc-400 transition-transform ${activeCompany === company ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {/* Expanded Tasks */}
                  {activeCompany === company && (
                    <div className="px-8 pb-8 space-y-3">
                      {items.map((item, i) => (
                        <div key={`${item.id}-${i}`} className="p-5 rounded-2xl bg-white border border-[#22c55e]/20 flex items-center justify-between shadow-sm">
                          <div>
                            <h4 className="font-semibold text-sm">{item.tasks?.title || 'Untitled'}</h4>
                            <p className="text-[10px] text-[#6b7280] opacity-50 mt-0.5">{item.tasks?.description || ''}</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">
                              Verified {item.verified_at ? `• ${new Date(item.verified_at).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                          <span className="px-4 py-1.5 bg-green-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-full">Verified</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-10 bg-white/40 border-t border-black/[0.03] py-12">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <span className="text-sm font-medium text-[#71717a]">Gradient <span className="font-serif italic">Kinetic</span></span>
        </div>
      </footer>
    </div>
  );
}

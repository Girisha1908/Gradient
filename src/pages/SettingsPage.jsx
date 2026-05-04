import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // ProtectedRoute guarantees user is authenticated before this mounts
  const loadProfile = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (error) throw error;
      setProfile(prof);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const saveUsername = async () => {
    if (!usernameInput.trim()) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: usernameInput.toLowerCase().trim() })
        .eq('id', profile.id);
      
      if (error) {
        if (error.code === '23505') toast.error("Username already taken. Please try another.");
        else throw error;
      } else {
        toast.success("Username set successfully!");
        setShowUsernameInput(false);
        setUsernameInput('');
        loadProfile();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to set username.");
    }
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(link);
    toast.success("Profile link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#373a46] selection:bg-[#373a46]/10 min-h-screen relative" style={{ fontFamily: "'Geist Sans', 'Inter', sans-serif" }}>
      {/* Background Video */}
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
          <span className="block text-xs text-[#6b7280] font-medium mt-1 uppercase tracking-widest opacity-60">{profile?.role === 'admin' ? 'Admin' : 'Member'} Settings</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button onClick={() => navigate(profile?.role === 'admin' ? '/manager' : '/dashboard')} className="w-full flex items-center gap-3 py-3 px-4 text-[#6b7280] hover:text-[#373a46] transition-all group">
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">dashboard</span>
            <span className="text-sm font-semibold tracking-tight">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 py-3 px-4 bg-white/80 shadow-sm border border-black/5 text-[#373a46] rounded-xl transition-all">
            <span className="material-symbols-outlined text-sm">settings</span>
            <span className="text-sm font-semibold tracking-tight">Settings</span>
          </button>
        </nav>
        <div className="pt-8 border-t border-black/5 space-y-1">
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-3 py-2 px-4 text-[#6b7280] hover:text-[#373a46] transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="text-xs font-semibold tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-64 h-20 z-30 bg-white/30 backdrop-blur-xl flex justify-between items-center px-10 border-b border-black/[0.03]">
        <h1 className="text-2xl font-medium">User <span className="font-serif italic font-normal">Settings</span></h1>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-32 pb-20 px-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Public Portfolio Settings - Only for Employees */}
          {profile?.role === 'employee' && (
            <section className="bg-white p-12 rounded-[3.5rem] border border-black/[0.03] shadow-[0px_20px_50px_rgba(0,0,0,0.03)] group overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight mb-3">Share Your <span className="font-serif italic">Verified Portfolio</span></h3>
                    <p className="text-sm text-[#71717a] font-medium max-w-md leading-relaxed opacity-70">Control your unique Gradient profile URL. Share this link with companies to showcase your verified proof-of-work history.</p>
                  </div>
                  
                  {profile.username ? (
                    <div className="flex flex-col gap-4">
                      <div className="px-6 py-4 bg-zinc-50 border border-black/5 rounded-3xl flex items-center justify-between gap-6 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Your handle</span>
                          <span className="text-sm font-bold text-[#1d1d1d]">@{profile.username}</span>
                        </div>
                        <button onClick={copyProfileLink} className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </div>
                      <Link to={`/profile/${profile.username}`} target="_blank" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#373a46] border-b border-black/10 hover:border-black transition-all self-start ml-2">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        View Portfolio
                      </Link>
                    </div>
                  ) : showUsernameInput ? (
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Choose a username..."
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveUsername()}
                        className="px-5 py-3 bg-zinc-50 border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-black/10 placeholder:text-zinc-400 font-medium"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={saveUsername} disabled={!usernameInput.trim()} className="flex-1 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-30">Save</button>
                        <button onClick={() => { setShowUsernameInput(false); setUsernameInput(''); }} className="py-2.5 px-4 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all text-zinc-500">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowUsernameInput(true)} className="px-10 py-4 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity shadow-lg">Set My Username</button>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full -mr-32 -mt-32 z-0 group-hover:scale-110 transition-transform duration-700 opacity-50"></div>
            </section>
          )}

          {/* Account Information */}
          <section className="bg-white p-12 rounded-[3.5rem] border border-black/[0.03] shadow-[0px_10px_30px_rgba(0,0,0,0.02)]">
            <h3 className="text-xl font-medium mb-8">Account <span className="font-serif italic">Identity</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl bg-zinc-50 border border-black/[0.02]">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Registered Email</p>
                <p className="text-sm font-semibold">{profile?.email}</p>
              </div>
              <div className="p-6 rounded-3xl bg-zinc-50 border border-black/[0.02]">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Platform Role</p>
                <p className="text-sm font-semibold capitalize">{profile?.role}</p>
              </div>
            </div>
          </section>

          {/* Verification Status */}
          <section className="bg-white p-12 rounded-[3.5rem] border border-black/[0.03] shadow-[0px_10px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium mb-2">Proof of Work <span className="font-serif italic">Verification</span></h3>
                <p className="text-sm text-zinc-500 font-medium">Verified by SGG Company Compliance Team</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-2 bg-green-50 text-green-600 rounded-full">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-[11px] font-bold uppercase tracking-widest">Active</span>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getProfileByEmail, insertActivityLog } from '../lib/database';
import { getCurrentUser } from '../lib/auth';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export default function ReviewPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState([]);
  // Per-deliverable feedback state (keyed by deliverable id)
  const [feedbacks, setFeedbacks] = useState({});

  // ProtectedRoute guarantees user is authenticated + admin before this mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) loadDeliverables(user);
  }, []);

  const loadDeliverables = async (user) => {
    try {
      const managerId = await getProfileByEmail(user.email);

      const { data: managerTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('created_by', managerId);

      const taskIds = (managerTasks || []).map(t => t.id);

      if (taskIds.length === 0) {
        setDeliverables([]);
        return;
      }

      const { data, error } = await supabase
        .from('task_deliverables')
        .select(`
          *,
          tasks (title),
          profiles:submitted_by (email)
        `)
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (deliverable_id, task_id) => {
    try {
      const user = getCurrentUser();
      const managerId = await getProfileByEmail(user.email);
      const fb = feedbacks[deliverable_id] || '';

      await supabase
        .from("task_deliverables")
        .update({
          status: "approved",
          feedback: fb || null,
          reviewed_by: managerId,
          reviewed_at: new Date().toISOString(),
          verified: true,
          verified_by: managerId,
          company_name: 'SGG Company',
          verified_at: new Date().toISOString()
        })
        .eq("id", deliverable_id);

      await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", task_id);

      await insertActivityLog({
        user_id: managerId,
        action: "reviewed deliverable",
        details: `approved task`
      });
      toast.success("Deliverable approved!");
      setFeedbacks(prev => { const n = { ...prev }; delete n[deliverable_id]; return n; });
      loadDeliverables(user);
    } catch (e) {
      console.error(e);
      toast.error("Approval failed.");
    }
  };

  const handleReject = async (deliverable_id, task_id) => {
    try {
      const user = getCurrentUser();
      const managerId = await getProfileByEmail(user.email);
      const fb = feedbacks[deliverable_id] || '';

      if (!fb.trim()) {
        toast.error("Please write feedback before rejecting.");
        return;
      }

      await supabase
        .from("task_deliverables")
        .update({
          status: "rejected",
          feedback: fb,
          reviewed_by: managerId,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", deliverable_id);

      await insertActivityLog({
        user_id: managerId,
        action: "reviewed deliverable",
        details: `rejected task`
      });
      toast.success("Deliverable rejected with feedback.");
      setFeedbacks(prev => { const n = { ...prev }; delete n[deliverable_id]; return n; });
      loadDeliverables(user);
    } catch (e) {
      console.error(e);
      toast.error("Rejection failed.");
    }
  };

  const openPreview = (contentUrl) => {
    window.open(contentUrl, "_blank", "noopener,noreferrer");
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
            { icon: 'inventory_2', label: 'Review', route: '/review' },
            { icon: 'task_alt', label: 'Completed', route: '/completed-tasks' },
            { icon: 'group', label: 'Team', route: '/team' },
            { icon: 'workspace_premium', label: 'Experience', route: '/experience' },
            { icon: 'insert_chart', label: 'Portfolio', route: '/portfolio' },
            { icon: 'settings', label: 'Settings', route: '#' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.route)} className={`w-full flex items-center gap-3 py-3 px-4 transition-all group ${item.route === '/review' ? 'bg-white/80 shadow-sm border border-black/5 text-[#373a46] rounded-xl' : 'text-[#6b7280] hover:text-[#373a46]'}`}>
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
          <h1 className="text-2xl font-medium">Review <span className="font-serif italic font-normal">Deliverables</span></h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {deliverables.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-black/10 rounded-[2.5rem]">
              <span className="material-symbols-outlined text-5xl text-zinc-300 mb-4">inventory_2</span>
              <p className="text-sm font-medium text-[#6b7280]">No deliverables submitted yet.</p>
            </div>
          ) : (
            deliverables.map((del, idx) => (
              <div key={`${del.id}-${idx}`} className="p-8 rounded-[2rem] bg-white/60 backdrop-blur-sm border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] tracking-tight">{del.tasks?.title || 'Untitled Task'}</p>
                    <p className="text-[10px] text-[#6b7280] font-medium opacity-60 mt-1">Submitted by: <span className="text-[#373a46] font-bold">{del.profiles?.email || 'Unknown'}</span></p>
                    <p className="text-[10px] text-[#6b7280] font-medium opacity-40 mt-0.5">
                      {del.submission_type === 'file' ? 'File Submission' : 'Link Submission'} • {new Date(del.created_at).toLocaleString()}
                    </p>

                    <button
                      onClick={() => openPreview(del.content_url)}
                      className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-[#373a46] border-b border-[#373a46] uppercase tracking-widest hover:opacity-70 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      {del.submission_type === 'file' ? 'Preview File' : 'Open Link'}
                    </button>

                    {/* Existing feedback display */}
                    {del.feedback && del.status !== 'pending' && (
                      <div className="text-[11px] font-medium mt-2 text-[#373a46] opacity-70 italic max-w-sm">
                        <span className="font-bold not-italic opacity-50">Feedback:</span> "{del.feedback}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-6">
                    {del.status !== 'pending' && (
                      <span className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest ${del.status === 'approved' ? 'text-green-600' : 'text-red-500 opacity-60'}`}>
                        {del.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Feedback + Actions for pending deliverables */}
                {del.status === 'pending' && (
                  <div className="mt-5 pt-5 border-t border-black/[0.04]">
                    <textarea
                      placeholder="Write your review feedback..."
                      value={feedbacks[del.id] || ''}
                      onChange={(e) => setFeedbacks(prev => ({ ...prev, [del.id]: e.target.value }))}
                      className="w-full p-4 bg-zinc-50 border border-black/[0.04] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-black/10 resize-none placeholder:text-zinc-400 font-medium"
                      rows={2}
                    />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleApprove(del.id, del.task_id)} className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">Approve</button>
                      <button onClick={() => handleReject(del.id, del.task_id)} className="px-6 py-2.5 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 text-[#373a46] transition-all">Reject</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

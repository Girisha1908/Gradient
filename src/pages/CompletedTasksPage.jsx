import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getProfileByEmail } from '../lib/database';
import { getCurrentUser } from '../lib/auth';

export default function CompletedTasksPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  // ProtectedRoute guarantees user is authenticated before this mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadTasks(user);
    }
  }, []);

  const loadTasks = async (user) => {
    try {
      const realUserId = await getProfileByEmail(user.email);
      let loadedTasks = [];

      if (user.role === 'admin') {
        const { data } = await supabase
          .from("tasks")
          .select("*, task_deliverables(status)")
          .eq("created_by", realUserId)
          .eq("status", "completed")
          .order('created_at', { ascending: false });
        loadedTasks = data || [];
      } else {
        const { data } = await supabase
          .from("task_assignments")
          .select(`
            task_id,
            tasks (*, task_deliverables(status))
          `)
          .eq("user_id", realUserId);
        
        loadedTasks = (data || [])
          .map(d => d.tasks)
          .filter(Boolean)
          .filter(t => t.status === 'completed');
      }

      setTasks(loadedTasks);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#fafafa] text-[#1d1d1d] min-h-screen" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/40 backdrop-blur-xl border-r border-[#f4f4f5] flex flex-col py-10 px-8 z-50">
        <div className="mb-16">
          <Link to="/" className="text-xl font-medium tracking-[0.15em] uppercase">Gradient</Link>
          <p className="text-[10px] text-[#71717a] font-bold mt-1.5 uppercase tracking-[0.2em] opacity-50">
            {currentUser?.role === 'admin' ? "Admin Console" : "Productivity Suite"}
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate(currentUser?.role === 'admin' ? '/manager' : '/dashboard')} className="flex items-center gap-4 py-3.5 px-5 bg-transparent hover:bg-white rounded-2xl border border-transparent hover:border-[#f4f4f5] transition-all group w-full text-left">
            <span className="material-symbols-outlined text-[20px] text-[#71717a] group-hover:text-[#1d1d1d]">grid_view</span>
            <span className="text-[13px] font-semibold tracking-tight text-[#71717a] group-hover:text-[#1d1d1d]">Active Tasks</span>
          </button>
          <button className="flex items-center gap-4 py-3.5 px-5 bg-white rounded-2xl border border-[#f4f4f5] shadow-sm w-full text-left">
            <span className="material-symbols-outlined text-[20px] text-green-600">task_alt</span>
            <span className="text-[13px] font-semibold tracking-tight text-green-600">Completed Tasks</span>
          </button>
        </nav>
        <div className="pt-8 space-y-2 border-t border-[#f4f4f5]">
          <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-4 py-3 px-5 text-[#71717a] hover:text-[#1d1d1d] transition-all group w-full text-left">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="text-[13px] font-semibold tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      <main className="pl-72 pt-32 pb-20 px-16 relative z-10 w-full max-w-7xl mx-auto">
        <h2 className="text-3xl font-medium mb-10"><span className="text-green-600">Completed</span> <span className="font-serif italic font-normal">Tasks</span></h2>
        
        <div className="grid grid-cols-1 gap-6">
          {tasks.length === 0 ? (
            <div className="p-10 border border-dashed border-[#e4e4e7] rounded-3xl text-center">
              <span className="material-symbols-outlined text-4xl text-[#71717a] mb-4">inventory_2</span>
              <p className="text-sm font-medium text-[#71717a]">No completed tasks found.</p>
            </div>
          ) : (
            tasks.map(t => (
              <div key={t.id} className="p-6 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-[#22c55e]/20 flex items-center justify-between shadow-[0px_4px_20px_0px_rgba(34,197,94,0.05)]">
                <div>
                  <h3 className="font-bold tracking-tight text-lg text-green-900">{t.title}</h3>
                  <p className="text-xs text-green-700/70 mt-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                    Verified
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

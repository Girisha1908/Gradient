import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { deleteTask } from '../lib/database';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, managers: 0, employees: 0, totalTasks: 0, completed: 0, pending: 0 });
  const [users, setUsers] = useState([]);
  const [managerInterns, setManagerInterns] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerf, setUserPerf] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, taskId: null, title: '' });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) loadAll();
  }, []);

  const loadAll = async () => {
    try {
      // Fetch all profiles
      const { data: profiles } = await supabase.from('profiles').select('*');
      const allUsers = profiles || [];
      setUsers(allUsers);

      const mgrs = allUsers.filter(u => u.role === 'admin' || u.role === 'manager');
      const emps = allUsers.filter(u => u.role === 'employee');

      // Fetch all tasks
      const { data: tasks } = await supabase.from('tasks').select('id, status, created_by');
      const allTasks = tasks || [];

      setStats({
        totalUsers: allUsers.length,
        managers: mgrs.length,
        employees: emps.length,
        totalTasks: allTasks.length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        pending: allTasks.filter(t => t.status !== 'completed').length,
      });

      // Build manager→intern relationships
      const relationships = [];
      for (const mgr of mgrs) {
        const mgrTasks = allTasks.filter(t => t.created_by === mgr.id);
        if (mgrTasks.length === 0) {
          relationships.push({ manager: mgr, interns: [] });
          continue;
        }
        const taskIds = mgrTasks.map(t => t.id);
        const { data: assignments } = await supabase
          .from('task_assignments')
          .select('user_id')
          .in('task_id', taskIds);
        const uniqueIds = [...new Set((assignments || []).map(a => a.user_id))];
        const interns = emps.filter(e => uniqueIds.includes(e.id));
        relationships.push({ manager: mgr, interns });
      }
      setManagerInterns(relationships);
    } catch (e) {
      console.error('Admin load error:', e);
    }
  };

  const loadUserPerf = async (user) => {
    setSelectedUser(user);
    try {
      const { data: assignments } = await supabase
        .from('task_assignments')
        .select('task_id, tasks(id, title, status, description, deadline)')
        .eq('user_id', user.id);
      const tasks = (assignments || []).map(a => a.tasks).filter(Boolean);
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      setUserPerf({ total, completed, pending: total - completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 });
      setUserTasks(tasks);
    } catch (e) {
      console.error('Perf load error:', e);
      setUserPerf({ total: 0, completed: 0, pending: 0, rate: 0 });
      setUserTasks([]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      setDeleteConfirm({ open: false, taskId: null, title: '' });
      if (selectedUser) loadUserPerf(selectedUser);
      loadAll();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete task');
    }
  };

  const sideNav = [
    { icon: 'space_dashboard', label: 'Overview', tab: 'overview' },
    { icon: 'group', label: 'Users', tab: 'users' },
    { icon: 'account_tree', label: 'Relationships', tab: 'relationships' },
  ];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'bg-violet-50 text-violet-600' },
    { label: 'Managers', value: stats.managers, icon: 'admin_panel_settings', color: 'bg-blue-50 text-blue-600' },
    { label: 'Employees', value: stats.employees, icon: 'badge', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: 'assignment', color: 'bg-amber-50 text-amber-700' },
    { label: 'Completed', value: stats.completed, icon: 'task_alt', color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: stats.pending, icon: 'pending_actions', color: 'bg-red-50 text-red-500' },
  ];

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
          <span className="block text-xs text-[#6b7280] font-medium mt-1 uppercase tracking-widest opacity-60">System Admin</span>
        </div>
        <nav className="flex-1 space-y-1">
          {sideNav.map(item => (
            <button key={item.tab} onClick={() => { setActiveTab(item.tab); setSelectedUser(null); }} className={`w-full flex items-center gap-3 py-3 px-4 transition-all group ${activeTab === item.tab ? 'bg-white/80 shadow-sm border border-black/5 text-[#373a46] rounded-xl' : 'text-[#6b7280] hover:text-[#373a46]'}`}>
              <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-semibold tracking-tight">{item.label}</span>
            </button>
          ))}
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
        <h1 className="text-2xl font-medium">Admin <span className="font-serif italic font-normal">Console</span></h1>
        <div className="flex items-center gap-3 pl-4 border-l border-black/[0.05]">
          <div className="w-9 h-9 rounded-full border border-black/5 bg-violet-600 text-white flex items-center justify-center font-bold text-xs">A</div>
          <div className="hidden lg:block">
            <p className="text-[13px] font-bold tracking-tight">System Admin</p>
            <p className="text-[10px] text-[#6b7280] font-medium opacity-60">Superadmin</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map(s => (
                  <div key={s.label} className="fade-in-section bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)] flex items-start gap-5 group hover:shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)] transition-all">
                    <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-lg">{s.icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50">{s.label}</p>
                      <p className="text-3xl font-medium tracking-tighter mt-1">{s.value}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Completion Rate Bar */}
              <section className="fade-in-section bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)]">
                <h2 className="text-xl font-medium mb-6">System <span className="font-serif italic font-normal">Health</span></h2>
                <div className="flex items-center gap-6 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50">Task Completion Rate</span>
                  <span className="text-sm font-bold">{stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0}%</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1d1d1d] rounded-full transition-all duration-700" style={{ width: `${stats.totalTasks > 0 ? (stats.completed / stats.totalTasks) * 100 : 0}%` }}></div>
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-green-600">{stats.completed} completed</span>
                  <span className="text-[#6b7280] opacity-50">{stats.pending} pending</span>
                </div>
              </section>
            </>
          )}

          {/* ═══ USERS TAB ═══ */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Users List */}
              <div className="xl:col-span-2">
                <section className="fade-in-section bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)] overflow-hidden">
                  <div className="p-8 border-b border-black/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-sm">group</span>
                    </div>
                    <h2 className="text-xl font-medium">All <span className="font-serif italic font-normal">Users</span></h2>
                    <span className="ml-auto px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-widest">{users.length} total</span>
                  </div>
                  <div className="divide-y divide-black/[0.03]">
                    {users.map(u => (
                      <button key={u.id} onClick={() => loadUserPerf(u)} className={`w-full p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-all text-left ${selectedUser?.id === u.id ? 'bg-zinc-50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${u.role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                            {(u.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">{u.email}</p>
                            <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest">{u.role}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-[#6b7280]">chevron_right</span>
                      </button>
                    ))}
                    {users.length === 0 && (
                      <div className="p-10 text-center opacity-40">
                        <span className="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                        <p className="text-sm font-medium">No users found</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Performance Panel */}
              <div>
                {selectedUser && userPerf ? (
                  <section className="fade-in-section bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)] space-y-6 sticky top-28">
                    <div className="flex items-center gap-4 pb-6 border-b border-black/5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${selectedUser.role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                        {(selectedUser.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[15px]">{selectedUser.email}</p>
                        <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest opacity-50 capitalize">{selectedUser.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Assigned', value: userPerf.total, bg: 'bg-zinc-50' },
                        { label: 'Completed', value: userPerf.completed, bg: 'bg-green-50' },
                        { label: 'Pending', value: userPerf.pending, bg: 'bg-amber-50' },
                        { label: 'Rate', value: `${userPerf.rate}%`, bg: 'bg-violet-50' },
                      ].map(s => (
                        <div key={s.label} className={`text-center p-4 ${s.bg} rounded-xl`}>
                          <p className="text-2xl font-medium tracking-tighter">{s.value}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1d1d1d] rounded-full transition-all duration-700" style={{ width: `${userPerf.rate}%` }}></div>
                    </div>

                    {/* Task list with delete */}
                    {userTasks.length > 0 && (
                      <div className="pt-4 border-t border-black/5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50 mb-3">Tasks</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {userTasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'completed' ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                                <p className="text-xs font-semibold truncate">{t.title}</p>
                              </div>
                              <button onClick={() => setDeleteConfirm({ open: true, taskId: t.id, title: t.title })} className="ml-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-30 py-20">
                    <span className="material-symbols-outlined text-5xl mb-4">person_search</span>
                    <p className="text-sm font-medium">Select a user to view performance</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ RELATIONSHIPS TAB ═══ */}
          {activeTab === 'relationships' && (
            <section className="space-y-8">
              {managerInterns.map(rel => (
                <div key={rel.manager.id} className="fade-in-section bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                      {(rel.manager.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg tracking-tight">{rel.manager.email}</p>
                      <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest opacity-50">Manager</p>
                    </div>
                    <span className="ml-auto px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{rel.interns.length} intern{rel.interns.length !== 1 ? 's' : ''}</span>
                  </div>
                  {rel.interns.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {rel.interns.map(intern => (
                        <button key={intern.id} onClick={() => { setActiveTab('users'); loadUserPerf(intern); }} className="p-5 bg-zinc-50 rounded-2xl border border-black/[0.03] flex items-center gap-3 hover:shadow-md transition-all text-left group">
                          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                            {(intern.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold tracking-tight truncate">{intern.email}</p>
                            <p className="text-[9px] text-[#6b7280] font-bold uppercase tracking-widest opacity-50">Employee</p>
                          </div>
                          <span className="material-symbols-outlined text-sm text-[#6b7280] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6b7280] opacity-50 font-medium">No interns assigned yet</p>
                  )}
                </div>
              ))}
              {managerInterns.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <span className="material-symbols-outlined text-5xl mb-4 block">account_tree</span>
                  <p className="text-sm font-medium">No manager-intern relationships found</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirm({ open: false, taskId: null, title: '' })}>
          <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight">Delete Task</h3>
            </div>
            <p className="text-sm text-[#6b7280] mb-8">Are you sure you want to delete <strong className="text-[#1d1d1d]">"{deleteConfirm.title}"</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ open: false, taskId: null, title: '' })} className="flex-1 py-3 border border-black/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all">Cancel</button>
              <button onClick={() => handleDeleteTask(deleteConfirm.taskId)} className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

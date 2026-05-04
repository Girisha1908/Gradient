import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { fetchTaskMetrics, fetchEmployees, createTaskWithAssignees, insertActivityLog, fetchActivityLogs, reviewDeliverable, getProfileByEmail, deleteTask, fetchTaskMessages, sendTaskMessage, createTeam, addTeamMembers, fetchTeams, uploadAttachment } from '../lib/database';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

const ManagerDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [metrics, setMetrics] = useState({ assigned: 0, completed: 0, overdue: 0 });
  const [employees, setEmployees] = useState([]);
  const [activities, setActivities] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium' });
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [realUserId, setRealUserId] = useState(null);
  
  // Teams State
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedTeamForTask, setSelectedTeamForTask] = useState('');
  
  // Reference Material State
  const [refFiles, setRefFiles] = useState([]);
  const refFileInput = useRef(null);
  
  // Team Analytics moved to TeamPage
  
  // Chat Modal State
  const [chatTask, setChatTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatFile, setChatFile] = useState(null);
  const chatFileRef = useRef(null);
  const chatEndRef = useRef(null);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, taskId: null, taskTitle: '' });

  // ProtectedRoute guarantees user is authenticated + admin before this mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .single();
      const manager_id = profile.id;
      setRealUserId(manager_id);
      
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("created_by", manager_id);
      if (tasksError) throw tasksError;

      const { data: deliverables, error: delivError } = await supabase
        .from("task_deliverables")
        .select(`
          *,
          tasks (title),
          profiles:submitted_by (email)
        `);
      if (delivError) throw delivError;

      const safeTasks = tasks || [];
      const safeDeliverables = deliverables || [];

      const managerTaskIds = safeTasks.map(t => t.id);
      const filteredDeliverables = safeDeliverables.filter(d => managerTaskIds.includes(d.task_id));

      console.log("Tasks:", safeTasks);
      console.log("Deliverables:", filteredDeliverables);

      const assigned = safeTasks.length;
      const completed = safeTasks.filter(t => t.status === 'completed').length;
      const overdue = safeTasks.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date()).length;
      
      setMetrics({ assigned, completed, overdue, data: safeTasks });
      setDeliverables(filteredDeliverables);
      setEmployees(await fetchEmployees());
      setActivities(await fetchActivityLogs());
      const teamsData = await fetchTeams() || [];
      setTeams(teamsData);

      // Team Analytics moved to Team Page
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return toast.error("Task title is required.");
    if (selectedAssignees.length === 0 && !selectedTeamForTask) return toast.error("Select at least one assignee or a team.");
    try {
      const user = getCurrentUser();
      const realManagerId = await getProfileByEmail(user.email);

      let createdTaskId = null;

      if (selectedTeamForTask) {
        // PART 6 — ASSIGN TASK TO TEAM
        const { data: task } = await supabase
          .from("tasks")
          .insert({
            title: newTask.title,
            priority: newTask.priority,
            created_by: realManagerId,
            status: 'pending',
            team_id: selectedTeamForTask
          })
          .select()
          .single();
        createdTaskId = task.id;

        const { data: members } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("team_id", selectedTeamForTask);

        if (members && members.length > 0) {
          const assignments = members.map(m => ({
            task_id: task.id,
            user_id: m.user_id
          }));
          await supabase.from("task_assignments").insert(assignments);
        }

        await insertActivityLog({
          user_id: realManagerId,
          action: 'assigned task to team',
          details: newTask.title
        });
      } else {
        // PART 7 — ASSIGN TO INDIVIDUAL
        const task = await createTaskWithAssignees(
          {
            title: newTask.title,
            priority: newTask.priority,
            created_by: realManagerId,
            status: 'pending'
          },
          selectedAssignees
        );
        createdTaskId = task?.id;
        await insertActivityLog({
          user_id: realManagerId,
          action: 'assigned task to ' + selectedAssignees.length + ' employee(s)',
          details: newTask.title
        });
      }

      // Upload reference materials if any
      if (refFiles.length > 0 && createdTaskId) {
        for (const file of refFiles) {
          try {
            const fileName = `ref_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            await uploadAttachment(file, fileName);
            const { data: publicData } = supabase.storage.from('attachments').getPublicUrl(fileName);
            await supabase.from('task_references').insert({
              task_id: createdTaskId,
              file_name: file.name,
              file_url: publicData.publicUrl,
              uploaded_by: realManagerId
            });
          } catch (refErr) {
            console.warn('Reference upload failed for:', file.name, refErr);
          }
        }
      }

      setNewTask({ title: '', priority: 'Medium' });
      setSelectedAssignees([]);
      setSelectedTeamForTask('');
      setRefFiles([]);
      toast.success('Task assigned successfully!');
      loadData();
    } catch (error) {
      console.error("Task Creation Error:", error);
      toast.error('Failed to create task.');
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteConfirm.taskId) return;
    try {
      const user = getCurrentUser();
      const realManagerId = await getProfileByEmail(user.email);
      await deleteTask(deleteConfirm.taskId);
      await insertActivityLog({
        user_id: realManagerId,
        action: 'deleted task',
        details: deleteConfirm.taskTitle
      });
      toast.success('Task deleted successfully.');
      setDeleteConfirm({ open: false, taskId: null, taskTitle: '' });
      loadData();
    } catch (e) {
      console.error('Delete failed:', e);
      toast.error('Failed to delete task.');
    }
  };

  // Review Deliverables moved/removed
  const openChat = async (task) => {
    setChatTask(task);
    try {
      const msgs = await fetchTaskMessages(task.id);
      setChatMessages(msgs);
      // Mark task-level + message-level as read
      if (task.has_unread_messages || task.unread_messages_count > 0) {
        await supabase.from("tasks").update({ has_unread_messages: false, unread_messages_count: 0 }).eq("id", task.id);
        // Also mark individual messages as read
        await supabase
          .from('task_messages')
          .update({ is_read: true })
          .eq('task_id', task.id)
          .neq('sender_id', realUserId);
        loadData();
      }
    } catch (e) { console.error('Error fetching messages:', e); }
  };

  const closeChat = () => {
    setChatTask(null);
    setChatMessages([]);
    setMessage('');
    setChatFile(null);
  };

  const handleSend = async () => {
    try {
      if (!message.trim() && !chatFile) return;

      if (!chatTask?.id) {
        console.error("No active task");
        return;
      }

      // Ensure we have a valid sender ID — fall back to DB lookup if state not ready
      let senderId = realUserId;
      if (!senderId) {
        const user = getCurrentUser();
        senderId = await getProfileByEmail(user.email);
      }
      
      let fileUrl = null;
      if (chatFile) {
        const fileName = `${Date.now()}-${chatFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { data, error } = await supabase.storage.from('attachments').upload(`chat/${fileName}`, chatFile);
        if (error) throw error;
        fileUrl = data.path;
      }

      await sendTaskMessage(chatTask.id, senderId, message.trim(), fileUrl);
      setMessage('');
      setChatFile(null);
      const msgs = await fetchTaskMessages(chatTask.id);
      setChatMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      await insertActivityLog({
        user_id: senderId,
        action: 'sent message',
        details: `replied to ${chatTask.title}`
      });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  useEffect(() => {
    let channel;
    if (chatTask) {
      channel = supabase.channel(`mgr_chat_${chatTask.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task_messages', filter: `task_id=eq.${chatTask.id}` }, async () => {
          const msgs = await fetchTaskMessages(chatTask.id);
          setChatMessages(msgs);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [chatTask]);

  const currentEmail = currentUser?.email || 'admin@kinetic.com';

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
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 py-3 px-4 bg-white/80 shadow-sm border border-black/5 text-[#373a46] rounded-xl transition-all w-full text-left">
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span className="text-sm font-semibold tracking-tight">Dashboard</span>
          </button>
          {[
            { icon: 'inventory_2', label: 'Review', route: '/review' },
            { icon: 'task_alt', label: 'Completed', route: '/completed-tasks' },
            { icon: 'group', label: 'Team', route: '/team' },
            { icon: 'workspace_premium', label: 'Experience', route: '/experience' },
            { icon: 'insert_chart', label: 'Portfolio', route: '/portfolio' },
            { icon: 'settings', label: 'Settings', route: '/settings' },
          ].map(item => (
            <button key={item.label} onClick={() => item.route && navigate(item.route)} className="w-full flex items-center gap-3 py-3 px-4 text-[#6b7280] hover:text-[#373a46] transition-all group">
              <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-medium tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 space-y-1">
          <button className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mb-6 bg-[#1d1d1d] text-white rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg shadow-black/5 btn-editorial-shadow hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            Create Task
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
          <h1 className="text-2xl font-medium">Manager <span className="font-serif italic font-normal">Dashboard</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pl-4 border-l border-black/[0.05]">
             <div className="w-9 h-9 rounded-full border border-black/5 bg-[#1d1d1d] text-white flex items-center justify-center font-bold text-xs">A</div>
            <div className="hidden lg:block">
              <p className="text-[13px] font-bold tracking-tight">{currentEmail}</p>
              <p className="text-[10px] text-[#6b7280] font-medium opacity-60">Lead Manager</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Hero Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Tasks Assigned', icon: 'assignment_turned_in', value: metrics.assigned, sub: 'Total active' },
              { label: 'Tasks Completed', icon: 'trending_up', value: metrics.completed, sub: 'Overall' },
              { label: 'Overdue Tasks', icon: 'warning', value: metrics.overdue, sub: 'Needs attention' },
            ].map((stat, i) => (
              <div key={stat.label} className="fade-in-section bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-black/[0.03] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)] group transition-all hover:bg-white" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-60">{stat.label}</span>
                  <span className="material-symbols-outlined text-[#373a46]/40 group-hover:text-[#373a46] transition-colors">{stat.icon}</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-medium tracking-tighter">{stat.value}</span>
                  <span className="text-xs font-semibold font-serif italic">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Quick Assign Section */}
            <div className="lg:col-span-2 space-y-10">
              <section className="fade-in-section bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)] relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </div>
                  <h2 className="text-2xl font-medium">Quick Assign <span className="font-serif italic font-normal">Task</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-4 opacity-50">Task Title</label>
                        <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-transparent border-0 border-b border-black/10 focus:ring-0 focus:border-black pb-3 px-0 transition-all placeholder:text-black/10 text-lg font-medium tracking-tight" placeholder="Internal Audit Phase II" type="text" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-4 opacity-50">Priority</label>
                      <div className="flex gap-3">
                        {['High', 'Medium', 'Low'].map(p => (
                          <button key={p} type="button" onClick={() => setNewTask({...newTask, priority: p})} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border ${newTask.priority === p ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black transition-colors'}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    {/* Reference Material Upload */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-4 opacity-50">Reference Materials (Optional)</label>
                      <input type="file" ref={refFileInput} className="hidden" multiple onChange={(e) => setRefFiles(Array.from(e.target.files))} />
                      <button type="button" onClick={() => refFileInput.current?.click()} className="flex items-center gap-2 px-5 py-2.5 border border-dashed border-black/15 rounded-2xl text-[11px] font-bold text-[#6b7280] hover:border-black/40 hover:text-[#373a46] transition-all w-full justify-center">
                        <span className="material-symbols-outlined text-sm">attach_file</span>
                        {refFiles.length > 0 ? `${refFiles.length} file(s) selected` : 'Attach PDFs, PPTs, etc.'}
                      </button>
                      {refFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {refFiles.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold text-[#373a46]">
                              <span className="material-symbols-outlined text-[12px]">description</span>
                              {f.name.length > 20 ? f.name.slice(0, 17) + '...' : f.name}
                              <button onClick={() => setRefFiles(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-[#6b7280] hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-[10px]">close</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-8 flex flex-col justify-between">
                    <div>
                      {/* TEAM ASSIGNMENT DROPDOWN */}
                      <div className="mb-6">
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-3 opacity-50">Assign to Team (Overrides Individuals)</label>
                        <select 
                          value={selectedTeamForTask} 
                          onChange={(e) => { 
                            setSelectedTeamForTask(e.target.value); 
                            setSelectedAssignees([]); 
                          }} 
                          className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 text-[#373a46] font-medium transition-all"
                        >
                          <option value="">No Team (Assign Individuals)</option>
                          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>

                      <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-4 transition-colors ${selectedTeamForTask ? 'opacity-20' : 'opacity-50'}`}>Select Individual Assignees</label>
                      <div className={`space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar transition-opacity ${selectedTeamForTask ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                         {employees.map((emp, idx) => {
                           const isSelected = selectedAssignees.includes(emp.id);
                           return (
                            <div key={`${emp.id}-${idx}`} onClick={() => {
                              setSelectedAssignees(prev =>
                                prev.includes(emp.id)
                                  ? prev.filter(id => id !== emp.id)
                                  : [...prev, emp.id]
                              );
                            }} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group ${isSelected ? 'bg-black border-black shadow-lg translate-x-1' : 'bg-white/50 border-black/5 hover:border-black/20'}`}>
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] uppercase ${isSelected ? 'bg-white text-black' : 'bg-black/5 text-[#373a46]'}`}>
                                 {emp.email.substring(0,2)}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-[#373a46]'}`}>{emp.email}</p>
                                 <p className={`text-[9px] font-medium uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-[#6b7280] opacity-60'}`}>Employee</p>
                               </div>
                               {isSelected && <span className="material-symbols-outlined text-white text-sm">check_circle</span>}
                            </div>
                           );
                         })}
                         {employees.length === 0 && <span className="text-xs text-[#6b7280] italic">No employees found. Seed the database.</span>}
                      </div>
                    </div>
                    <button onClick={handleCreateTask} className="w-full bg-[#1d1d1d] text-white py-4 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase btn-editorial-shadow hover:opacity-90 transition-all mt-4">
                      Finalize Assignment
                    </button>
                  </div>
                </div>
              </section>

            {/* Assignment History / Status Tracker */}
             <section className="fade-in-section bg-white/40 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/5 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)] mt-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-medium">Assignment <span className="font-serif italic font-normal">Explorer</span></h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Total: {metrics.data?.filter(t => t.status !== 'completed').length || 0}</span>
                </div>
                <div className="space-y-3">
                  {metrics.data?.filter(t => t.status !== 'completed').length === 0 ? <p className="text-xs text-[#6b7280]">No active tasks assigned yet.</p> : metrics.data?.filter(t => t.status !== 'completed').map((t, idx) => (
                    <div key={`${t.id}-${idx}`} className={`p-5 rounded-2xl bg-white border ${t.has_unread_messages ? 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-black/[0.03]'} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <button onClick={() => openChat(t)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${t.has_unread_messages ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-zinc-100 text-[#1d1d1d] hover:bg-black hover:text-white'}`}>
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                          </button>
                          {t.has_unread_messages && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center z-10 box-content">
                              {t.unread_messages_count || 1}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold tracking-tight">{t.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-zinc-100 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">{t.status}</span>
                        <button onClick={() => setDeleteConfirm({ open: true, taskId: t.id, taskTitle: t.title })} className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all" title="Delete Task">
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </section>

            </div>
            {/* Activity Feed */}
            <div className="lg:col-span-1">
              <section className="fade-in-section bg-white/80 backdrop-blur-md h-full rounded-[2.5rem] p-10 flex flex-col border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)]" style={{ animationDelay: '0.6s' }}>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-medium">Live <span className="font-serif italic font-normal">Activity</span></h2>
                  <button onClick={loadData} className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#373a46] border-b border-[#373a46] hover:opacity-70">Refresh</button>
                </div>
                <div className="space-y-10 flex-1 overflow-y-auto no-scrollbar">
                  {activities.length === 0 ? <p className="text-xs text-[#6b7280]">No recent activity.</p> : activities.map((item, i) => (
                    <div key={`${item.id}-${i}`} className="flex gap-5 relative">
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-black' : 'bg-black/20'} mt-1.5 z-10`}></div>
                      {i < activities.length - 1 && <div className="absolute left-[3.5px] top-4 bottom-[-40px] w-px bg-black/5"></div>}
                      <div>
                        <p className="text-sm leading-relaxed text-[#6b7280]">
                          <span className="font-bold text-[#373a46]">{item.profiles?.email || 'System'}</span> {item.action} <span className="font-medium font-serif italic text-[#373a46]">{item.details}</span>
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] opacity-40 mt-2 block">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="ml-64 bg-white/40 border-t border-black/[0.03] py-16">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-medium">Gradient <span className="font-serif italic font-normal">Kinetic</span></span>
          </div>
        </div>
      </footer>
      {chatTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px] border border-black/5 animate-fade-in">
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-zinc-50 relative z-10">
              <div>
                <h3 className="font-bold tracking-tight text-lg">{chatTask.title}</h3>
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Live Discussion</p>
              </div>
              <button onClick={closeChat} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50 relative">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                  <p className="text-xs font-medium">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((m, idx) => {
                  const isMe = m.sender_id === realUserId;
                  return (
                    <div key={`${m.id}-${idx}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${isMe ? 'bg-black text-white rounded-tr-sm' : 'bg-zinc-100 text-[#1d1d1d] rounded-tl-sm'}`}>
                        {m.message && <div className="mb-1">{m.message}</div>}
                        {m.file_url && (
                          <button onClick={() => {
                            const { data } = supabase.storage.from("attachments").getPublicUrl(m.file_url);
                            window.open(data.publicUrl, "_blank");
                          }} className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs mt-2 transition-all ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-black/5 border-black/10 hover:bg-black/10 text-black'}`}>
                            <span className="material-symbols-outlined text-[14px]">attach_file</span> View Attachment
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest px-1">
                        {isMe ? 'You' : m.profiles?.email} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-black/5 bg-white flex gap-3 z-10 items-center">
              <input type="file" ref={chatFileRef} className="hidden" onChange={(e) => setChatFile(e.target.files[0])} />
              <button 
                onClick={() => chatFileRef.current?.click()} 
                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${chatFile ? 'bg-black text-white shadow-md' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                title={chatFile ? chatFile.name : "Attach file"}
              >
                <span className="material-symbols-outlined text-sm">attach_file</span>
              </button>
              <input
                type="text"
                autoFocus
                className="flex-1 bg-zinc-100 border-none rounded-full px-5 py-3 text-sm focus:ring-0 focus:outline-none placeholder:text-zinc-400 font-medium"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button disabled={!message.trim() && !chatFile} onClick={handleSend} className="w-12 h-12 flex-shrink-0 bg-black text-white rounded-full flex items-center justify-center disabled:opacity-30 hover:opacity-80 transition-opacity shadow-md">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-black/5">
            <div className="p-6 border-b border-black/5 bg-zinc-50">
              <h3 className="font-bold tracking-tight text-lg">Delete Task</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#373a46] font-medium">Are you sure you want to delete <span className="font-bold">"{deleteConfirm.taskTitle}"</span>?</p>
              <p className="text-[11px] text-zinc-400 mt-2">This will remove the task from all assigned employees, including messages and deliverables.</p>
            </div>
            <div className="p-5 border-t border-black/5 flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, taskId: null, taskTitle: '' })}
                className="flex-1 py-3 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all text-zinc-500"
              >Cancel</button>
              <button
                onClick={handleDeleteTask}
                className="flex-1 py-3 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerDashboard;

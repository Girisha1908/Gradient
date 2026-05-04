import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { uploadAttachment, submitDeliverable, insertActivityLog, fetchEmployeeAssignedTasks, getProfileByEmail, fetchTaskMessages, sendTaskMessage, fetchTaskReferences } from '../lib/database';
import { getCurrentUser } from '../lib/auth';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";
const AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCROfD2ns6ibcgUhJa5xCVAvY5ep-HXrt6ETZCFbSr9SGy6vljw3t9HFGPQB_FaMpFqV_TVQZY0qJX2FmfS4ox9N42UDEIAoro8on8KOGDeLgAIN25Dj-6MVEfI0fDFhchg_I3RaSU1cB6hKEos5LA_kMZeeFPx0FoFH1jsAcmRFPstRrHKVr9vsTn2Cmk1Cy3mP6TCp8OU_lniSCRHI4_8EqX93btuxl1nwgAS8G3ISMDfC12CpS07DV-BTU8uUcw_mK3SBn2VeLe2";
const SARAH = "https://lh3.googleusercontent.com/aida-public/AB6AXuDH57cHCW87hbZYNY6nVwkJcN6SlGpWd16W5xR21sFxSKxCFI8cKGnwYeJu_u4JKIEQdRaKf8afoIYZLH-GQkHGEaI88AqD9v6avTOvjgwU7RB73Z_JSYAhyQoyAY4PH6smUPsUHTZXrhi8oVJt0la2PC3Ue1iHgInMlyPrEJnX2PDcLX_qIvgQdhDCSomNA9vQrX2kvkp1R5_rCGsvf6STR3omIgs1MMf3HopCyCBUhjJ5TDzBK-JgP_A3vThtgONpM-B9N5MeHcvm";

// Stats will be derived from data inside the component

const sideNav = [
  { icon: 'assignment_turned_in', label: 'My Tasks', route: '/dashboard' },
  { icon: 'task_alt', label: 'Completed', route: '/completed-tasks' },
  { icon: 'insights', label: 'Portfolio', route: '/portfolio' },
  { icon: 'workspace_premium', label: 'Experience', route: '/experience' },
  { icon: 'settings', label: 'Settings', route: '/settings' },
];

const UserDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [realUserId, setRealUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const fileInputRef = useRef(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Link submission modal state
  const [linkModal, setLinkModal] = useState({ open: false, taskId: null });
  const [linkUrl, setLinkUrl] = useState('');

  // Submission Confirmation Modal State
  const [attachments, setAttachments] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Chat Modal State
  const [chatTask, setChatTask] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatFile, setChatFile] = useState(null);
  const chatFileRef = useRef(null);
  const chatEndRef = useRef(null);

  // Task References State
  const [taskRefs, setTaskRefs] = useState({});

  // Unread chat notifications (employee side)
  const [unreadTasks, setUnreadTasks] = useState({});

  const stats = [
    { label: 'Total Active', icon: 'assignment', value: tasks.length.toString().padStart(2, '0'), sub: 'Calculated live' },
    { label: 'Due Soon', icon: 'priority_high', value: tasks.filter(t => t.priority === 'High').length.toString().padStart(2, '0'), sub: 'High focus' },
    { label: 'Pending', icon: 'pending', value: tasks.filter(t => t.status === 'pending').length.toString().padStart(2, '0'), sub: 'Action needed' },
  ];

  // ProtectedRoute guarantees user is authenticated + employee before this mounts
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
      console.log("Logged user email:", user.email);
      const mappedId = await getProfileByEmail(user.email);
      setRealUserId(mappedId);
      console.log("Real DB User ID mapped:", mappedId);
      
      const assignedTasks = await fetchEmployeeAssignedTasks(mappedId);
      console.log("Fetched assigned tasks list:", assignedTasks);
      const activeTasks = (assignedTasks || []).filter(t => t.status !== 'completed');
      setTasks(activeTasks);

      // Fetch unread messages for each task (messages from non-employee users)
      const unreadMap = {};
      for (const task of activeTasks) {
        try {
          const { count } = await supabase
            .from('task_messages')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', task.id)
            .neq('sender_id', mappedId)
            .eq('is_read', false);
          if (count > 0) unreadMap[task.id] = count;
        } catch (e) { /* is_read column may not exist yet */ }
      }
      setUnreadTasks(unreadMap);

      // Fetch reference materials for each task
      const refsMap = {};
      for (const task of (assignedTasks || [])) {
        try {
          const refs = await fetchTaskReferences(task.id);
          if (refs.length > 0) refsMap[task.id] = refs;
        } catch (e) {
          // Table may not exist yet, that's fine
        }
      }
      setTaskRefs(refsMap);
      
      const { data: l } = await supabase.from('activity_logs').select('*').eq('user_id', mappedId).order('created_at', { ascending: false }).limit(5);
      setTimeline(l || []);

    } catch (e) {
      console.error("Dashboard Load Error:", e);
    }
  };

  const openChat = async (task) => {
    setChatTask(task);
    try {
      const msgs = await fetchTaskMessages(task.id);
      setChatMessages(msgs);
      // Mark messages from others as read
      if (unreadTasks[task.id]) {
        await supabase
          .from('task_messages')
          .update({ is_read: true })
          .eq('task_id', task.id)
          .neq('sender_id', realUserId);
        setUnreadTasks(prev => { const n = { ...prev }; delete n[task.id]; return n; });
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
      
      const { data: currTask } = await supabase.from("tasks").select("unread_messages_count").eq("id", chatTask.id).single();
      const newCount = (currTask?.unread_messages_count || 0) + 1;
      await supabase.from("tasks").update({ has_unread_messages: true, unread_messages_count: newCount }).eq("id", chatTask.id);
      
      
      setMessage('');
      setChatFile(null);
      const msgs = await fetchTaskMessages(chatTask.id);
      setChatMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      await insertActivityLog({
        user_id: senderId,
        action: 'sent message',
        details: `asked about ${chatTask.title}`
      });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  useEffect(() => {
    let channel;
    if (chatTask) {
      channel = supabase.channel(`emp_chat_${chatTask.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task_messages', filter: `task_id=eq.${chatTask.id}` }, async () => {
          const msgs = await fetchTaskMessages(chatTask.id);
          setChatMessages(msgs);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [chatTask]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeTaskId) return;
    setAttachments(prev => [...prev, file]);
    setShowConfirm(true);
    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (attachments.length === 0 || !activeTaskId) return;
    try {
      // Use Supabase auth for correct identity — never localStorage
      const { data: authUser } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', authUser.user.email)
        .single();
      
      if (!profile?.id) {
        throw new Error("User profile not found");
      }
      const userId = profile.id;

      for (const file of attachments) {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        await uploadAttachment(file, fileName);
        const { data: publicData } = supabase.storage.from('attachments').getPublicUrl(fileName);
        await submitDeliverable({
          task_id: activeTaskId,
          submitted_by: userId,
          submission_type: 'file',
          content_url: publicData.publicUrl
        });
        await insertActivityLog({ user_id: userId, action: 'submitted file deliverable', details: file.name });
      }

      toast.success(`${attachments.length} file(s) submitted successfully!`);
      setAttachments([]);
      setShowConfirm(false);
      // Do NOT clear activeTaskId or wipe tasks — task stays visible as pending
      loadData(); // Refetch tasks to update delivery status indicators
    } catch (err) {
      console.error("❌ Full upload error:", err);
      toast.error("Upload failed: " + (err.message || err.error || "Unknown error."));
    }
  };

  const submitLink = async () => {
     if (!linkUrl.trim() || !linkModal.taskId) return;
     try {
       const { data: authUser } = await supabase.auth.getUser();
       const { data: profile } = await supabase.from('profiles').select('id').eq('email', authUser.user.email).single();
       if (!profile?.id) throw new Error("User profile not found");
       await submitDeliverable({ task_id: linkModal.taskId, submitted_by: profile.id, submission_type: 'link', content_url: linkUrl.trim() });
       await insertActivityLog({ user_id: profile.id, action: 'submitted link deliverable', details: linkUrl.trim() });
       toast.success("Link deliverable submitted!");
       setLinkModal({ open: false, taskId: null });
       setLinkUrl('');
       loadData();
     } catch (e) {
       console.error(e);
       toast.error("Submission failed.");
     }
  };

  const getTaskStatus = (task) => {
    if (!task.task_deliverables || task.task_deliverables.length === 0) return "pending";
    // We use submitted_by because that's what our DB schema expects
    const myDeliverable = task.task_deliverables.find(d => d.submitted_by === realUserId);
    if (!myDeliverable) return "pending";
    if (myDeliverable.status === "approved") return "approved";
    return "submitted";
  };

  // NO PORTFOLIO CODE NEEDED

  return (
    <div className="bg-[#fafafa] text-[#1d1d1d] min-h-screen" style={{ fontFamily: "'Geist Sans', sans-serif" }}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      
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
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-4 py-3.5 px-5 bg-white rounded-2xl border border-[#f4f4f5] shadow-sm w-full">
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span className="text-[13px] font-semibold tracking-tight">Dashboard</span>
          </button>
          {sideNav.map(i => (
            <button 
              key={i.label} 
              onClick={() => {
                if (i.route) {
                  navigate(i.route);
                } else {
                  const el = document.getElementById(i.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="flex items-center gap-4 py-3.5 px-5 text-[#71717a] hover:text-[#1d1d1d] transition-all group w-full text-left"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:scale-105 transition-transform">{i.icon}</span>
              <span className="text-[13px] font-medium tracking-tight">{i.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full bg-[#1d1d1d] text-white py-4 rounded-2xl font-bold text-[11px] tracking-[0.15em] uppercase btn-editorial-shadow">Log Out</button>
          <a className="flex items-center gap-4 py-2 px-5 text-[#71717a] hover:text-[#1d1d1d]" href="#">
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span className="text-[11px] font-bold">Help Center</span>
          </a>
        </div>
      </aside>
      <main className="ml-72 min-h-screen relative z-10">
        <header className="fixed top-0 right-0 left-72 h-24 bg-white/40 backdrop-blur-xl border-b border-[#f4f4f5] flex justify-between items-center px-12 z-40">
          <h2 className="text-2xl font-medium tracking-tight">Employee <span className="font-serif italic">Dashboard</span></h2>
          <div className="flex items-center gap-8">
            <div className="relative"><span className="material-symbols-outlined text-[#71717a] text-[24px]">notifications</span><span className="absolute top-0 right-0 w-2 h-2 bg-black rounded-full ring-2 ring-white"></span></div>
            <div className="flex items-center gap-4 pl-6 border-l border-[#f4f4f5]">
              <div className="text-right hidden sm:block"><p className="text-[13px] font-bold tracking-tight">{currentUser?.email}</p><p className="text-[10px] text-[#71717a] font-bold opacity-50 uppercase tracking-widest">Employee</p></div>
              <img alt="User" className="w-10 h-10 rounded-full border border-[#f4f4f5] object-cover" src={AVATAR} />
            </div>
          </div>
        </header>
        <div className="pt-36 px-12 pb-24 max-w-7xl mx-auto space-y-12">
          <section id="tasks-section">
            <div className="flex items-baseline justify-between mb-8">
              <h3 className="text-[11px] font-bold text-[#71717a] uppercase tracking-[0.25em] opacity-40">My Assigned Tasks</h3>
              <span onClick={loadData} className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#1d1d1d] border-b border-[#1d1d1d] cursor-pointer">Refresh Tasks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {stats.map(s => (
                <div key={s.label} className="bg-white p-10 rounded-[2.5rem] border border-[#f4f4f5] shadow-[0px_20px_50px_rgba(0,0,0,0.03)] hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#71717a] opacity-40">{s.label}</span>
                    <span className={`material-symbols-outlined ${s.error ? 'text-red-500/40' : 'text-[#71717a]/40'}`}>{s.icon}</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className={`text-6xl font-medium tracking-tighter ${s.error ? 'text-red-500' : ''}`}>{s.value}</span>
                    <span className={`text-[13px] font-medium font-serif italic ${s.error ? 'text-red-500' : 'text-[#71717a]'}`}>{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section className="bg-white p-12 rounded-[3rem] border border-[#f4f4f5] shadow-[0px_20px_50px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-5 mb-12">
                  <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white"><span className="material-symbols-outlined text-[18px]">bolt</span></div>
                  <h3 className="text-2xl font-medium tracking-tight">Active <span className="font-serif italic">Assignments</span></h3>
                </div>
                <div className="space-y-6">
                  {tasks.length === 0 ? <p className="text-sm text-[#71717a] py-10 text-center italic opacity-60">Your workspace is quiet. No active assignments found.</p> : tasks.map((t, idx) => {
                    const status = getTaskStatus(t);
                    return (
                    <div key={`${t.id}-${idx}`} className="group p-6 rounded-2xl border border-black/[0.03] bg-white/50 hover:bg-white hover:border-black transition-all flex items-center justify-between shadow-sm hover:shadow-md">
                      <div className="flex items-start gap-5">
                        <div className="relative">
                          <button onClick={() => openChat(t)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${unreadTasks[t.id] ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-zinc-100 text-[#1d1d1d] hover:bg-black hover:text-white'}`}>
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                          </button>
                          {unreadTasks[t.id] && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center z-10 box-content">
                              {unreadTasks[t.id]}
                            </span>
                          )}
                        </div>
                        <div className={`mt-1.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${status === 'approved' ? 'bg-green-500 border-green-500' : status === 'submitted' ? 'bg-black border-black' : 'border-black/10 transition-transform'}`}>
                           <span className={`material-symbols-outlined text-[10px] text-white ${status !== 'pending' ? 'scale-100' : 'scale-0 transition-transform'}`}>check</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[15px] mb-1">{t.title}</h4>
                          <div className="flex items-center gap-3">
                            <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-widest opacity-40">{t.status || 'Active'}</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-black/5"></span>
                            <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-widest opacity-40">Priority: {t.priority}</p>
                          </div>
                          {taskRefs[t.id] && taskRefs[t.id].length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="material-symbols-outlined text-[12px] text-[#6b7280] opacity-50">attach_file</span>
                              {taskRefs[t.id].map((ref, ri) => (
                                <a key={ri} href={ref.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#373a46] border-b border-[#373a46]/30 hover:border-[#373a46] transition-colors">
                                  {ref.file_name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          {status === 'approved' ? (
                            <span className="px-5 py-2.5 text-green-600 text-[10px] font-bold uppercase tracking-widest">Approved</span>
                          ) : status === 'submitted' ? (
                            <span className="px-5 py-2.5 text-black text-[10px] font-bold uppercase tracking-widest">Under Review</span>
                          ) : (
                            <>
                              <button onClick={() => setLinkModal({ open: true, taskId: t.id })} className="px-5 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">Submit Link</button>
                              <button onClick={() => { setActiveTaskId(t.id); fileInputRef.current?.click(); }} className="px-5 py-2.5 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Upload File</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </section>
            </div>
            <div className="space-y-12">
              <section className="bg-white p-10 rounded-[2.5rem] border border-[#f4f4f5] shadow-[0px_20px_50px_rgba(0,0,0,0.03)]">
                <h3 className="text-[11px] font-bold text-[#71717a] uppercase tracking-[0.25em] mb-10 opacity-40">Productivity Insights</h3>
                <div className="space-y-12">
                  <div>
                    <div className="flex justify-between items-end mb-6"><p className="text-[11px] font-bold uppercase tracking-[0.2em]">Work Velocity</p><span className="text-3xl font-medium tracking-tighter">84%</span></div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-[#1d1d1d] w-[84%] rounded-full"></div></div>
                    <p className="text-[11px] font-medium font-serif italic text-[#71717a] mt-4">+12% from previous sprint</p>
                  </div>
                  <div className="pt-8 border-t border-[#f4f4f5]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8">Task Completion (7 Days)</p>
                    <div className="flex items-end justify-between h-32 gap-3 px-1">
                      {[40,65,85,55,90,100,30].map((h,i)=>(<div key={i} className={`flex-1 rounded-lg ${i===5?'bg-black':h>=80?'bg-zinc-400':'bg-zinc-100'}`} style={{height:`${h}%`}}></div>))}
                    </div>
                    <div className="flex justify-between mt-6 px-1 text-[10px] font-bold text-[#71717a] uppercase tracking-[0.2em] opacity-40">
                      {['M','T','W','T','F','S','S'].map((d,i)=>(<span key={i} className={i===5?'text-[#1d1d1d] opacity-100':''}>{d}</span>))}
                    </div>
                  </div>
                </div>
              </section>
              <section className="bg-white p-10 rounded-[2.5rem] border border-[#f4f4f5] shadow-[0px_20px_50px_rgba(0,0,0,0.03)]">
                <h3 className="text-[11px] font-bold text-[#71717a] uppercase tracking-[0.25em] mb-10 opacity-40">Personal Timeline</h3>
                <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#f4f4f5]">
                  {timeline.length === 0 ? <p className="text-xs text-[#71717a]">No activity.</p> : timeline.map((t,i)=>(
                    <div key={`${t.id}-${i}`} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border border-[#f4f4f5] flex items-center justify-center z-10 shadow-sm"><span className="material-symbols-outlined text-[14px]">done</span></div>
                      <p className="text-[14px] font-semibold">{t.action}</p>
                      <p className="text-[12px] text-[#71717a] mt-1"><span className="font-serif italic font-medium text-[#1d1d1d]">{t.details}</span></p>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717a] opacity-30 mt-2 block">{new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

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
                  <p className="text-xs font-medium">No messages yet. Ask a question here!</p>
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

      {/* Submission Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-black/5 animate-fade-in">
            <div className="p-6 border-b border-black/5 bg-zinc-50">
              <h3 className="font-bold tracking-tight text-lg">Confirm Submission</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Review your files before submitting</p>
            </div>
            <div className="p-6 space-y-3 max-h-[300px] overflow-y-auto">
              {attachments.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6 italic">No files selected yet.</p>
              ) : (
                attachments.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/[0.03]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-sm text-zinc-500">description</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold tracking-tight truncate">{f.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{(f.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => removeAttachment(i)} className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 border-t border-black/5 flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); fileInputRef.current?.click(); }}
                className="flex-1 py-3 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all"
              >Add More</button>
              <button
                onClick={() => { setShowConfirm(false); setAttachments([]); setActiveTaskId(null); }}
                className="py-3 px-5 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all text-zinc-500"
              >Cancel</button>
              <button
                onClick={handleFinalSubmit}
                disabled={attachments.length === 0}
                className="flex-1 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-30"
              >Submit {attachments.length > 0 && `(${attachments.length})`}</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Submission Modal */}
      {linkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-black/5">
            <div className="p-6 border-b border-black/5 bg-zinc-50">
              <h3 className="font-bold tracking-tight text-lg">Submit Deliverable Link</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Paste your Figma, Drive, or project URL</p>
            </div>
            <div className="p-6">
              <input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitLink()}
                className="w-full p-4 bg-zinc-50 border border-black/[0.04] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-black/10 placeholder:text-zinc-400 font-medium"
                autoFocus
              />
            </div>
            <div className="p-5 border-t border-black/5 flex gap-3">
              <button
                onClick={() => { setLinkModal({ open: false, taskId: null }); setLinkUrl(''); }}
                className="flex-1 py-3 border border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all text-zinc-500"
              >Cancel</button>
              <button
                onClick={submitLink}
                disabled={!linkUrl.trim()}
                className="flex-1 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-30"
              >Submit Link</button>
            </div>
          </div>
        </div>
      )}

      <footer className="ml-72 bg-white border-t border-[#f4f4f5] py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12">
          <div><span className="text-xl font-medium tracking-tight">Gradient <span className="font-serif italic">Kinetic</span></span></div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;

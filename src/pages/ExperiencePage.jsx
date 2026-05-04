import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { fetchEmployees, getProfileByEmail, generateExperienceRecord, fetchExperienceRecords, insertActivityLog } from '../lib/database';

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4";

export default function ExperiencePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [realUserId, setRealUserId] = useState(null);
  const [isManager, setIsManager] = useState(false);
  
  // Manager State
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeStats, setEmployeeStats] = useState(null);
  const [role, setRole] = useState('Intern');
  const [managerRemarks, setManagerRemarks] = useState('');
  const [generating, setGenerating] = useState(false);

  // Employee State
  const [experienceRecords, setExperienceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ProtectedRoute guarantees user is authenticated before this mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsManager(user.role === 'admin');
    }
  }, []);

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const user = getCurrentUser();
      const mappedId = await getProfileByEmail(user.email);
      setRealUserId(mappedId);

      if (user.role === 'admin') {
        setEmployees(await fetchEmployees());
      } else {
        const records = await fetchExperienceRecords(mappedId);
        setExperienceRecords(records);
      }
    } catch (e) {
      console.error('Experience page load error:', e);
    }
  };

  const handleSelectEmployee = async (empId) => {
    setSelectedEmployee(empId);
    if (!empId) { setEmployeeStats(null); return; }
    try {
      // Fetch stats for this employee
      const { data: assignments } = await supabase
        .from('task_assignments')
        .select('task_id, tasks(id, status)')
        .eq('user_id', empId);
      
      const totalTasks = (assignments || []).length;
      const completedTasks = (assignments || []).filter(a => a.tasks?.status === 'completed').length;
      const performanceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Get top tasks as "skills"
      const { data: approvedWork } = await supabase
        .from('task_deliverables')
        .select('tasks(title)')
        .eq('submitted_by', empId)
        .eq('status', 'approved');
      
      const topSkills = (approvedWork || []).slice(0, 5).map(w => w.tasks?.title).filter(Boolean);

      const { data: empProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', empId)
        .single();
      
      setEmployeeStats({
        email: empProfile?.email,
        totalTasks,
        completedTasks,
        performanceScore,
        topSkills,
      });
    } catch (e) {
      console.error('Failed to fetch employee stats:', e);
    }
  };

  const handleGenerateExperience = async () => {
    if (!selectedEmployee || !employeeStats) return toast.error('Select an employee first.');
    setGenerating(true);
    try {
      await generateExperienceRecord({
        user_id: selectedEmployee,
        company_name: 'SGG Company',
        role,
        total_tasks: employeeStats.totalTasks,
        completed_tasks: employeeStats.completedTasks,
        performance_score: employeeStats.performanceScore,
        top_skills: employeeStats.topSkills,
        manager_remarks: managerRemarks || null,
        generated_by: realUserId,
      });
      await insertActivityLog({
        user_id: realUserId,
        action: 'generated experience record',
        details: `for ${employeeStats.email}`
      });
      toast.success('Experience record generated!');
      setSelectedEmployee('');
      setEmployeeStats(null);
      setRole('Intern');
      setManagerRemarks('');
    } catch (e) {
      console.error('Generate experience error:', e);
      toast.error('Failed to generate experience record.');
    } finally {
      setGenerating(false);
    }
  };

  const currentEmail = currentUser?.email || '';

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
          <span className="block text-xs text-[#6b7280] font-medium mt-1 uppercase tracking-widest opacity-60">{isManager ? 'Admin Console' : 'Employee Hub'}</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button onClick={() => navigate(isManager ? '/manager' : '/dashboard')} className="w-full flex items-center gap-3 py-3 px-4 text-[#6b7280] hover:text-[#373a46] transition-all group">
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">dashboard</span>
            <span className="text-sm font-medium tracking-tight">Dashboard</span>
          </button>
          {isManager && (
            <button onClick={() => navigate('/team')} className="w-full flex items-center gap-3 py-3 px-4 text-[#6b7280] hover:text-[#373a46] transition-all group">
              <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">group</span>
              <span className="text-sm font-medium tracking-tight">Team</span>
            </button>
          )}
          <button className="flex items-center gap-3 py-3 px-4 bg-white/80 shadow-sm border border-black/5 text-[#373a46] rounded-xl transition-all w-full text-left">
            <span className="material-symbols-outlined text-sm">workspace_premium</span>
            <span className="text-sm font-semibold tracking-tight">Experience</span>
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
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-medium">Experience <span className="font-serif italic font-normal">Records</span></h1>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-black/[0.05]">
          <div className="w-9 h-9 rounded-full border border-black/5 bg-[#1d1d1d] text-white flex items-center justify-center font-bold text-xs">{currentEmail.substring(0,1).toUpperCase()}</div>
          <div className="hidden lg:block">
            <p className="text-[13px] font-bold tracking-tight">{currentEmail}</p>
            <p className="text-[10px] text-[#6b7280] font-medium opacity-60">{isManager ? 'Manager' : 'Employee'}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-32 pb-20 px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {isManager ? (
            /* ───── MANAGER VIEW ───── */
            <>
              {/* Generate Experience Card */}
              <section className="fade-in-section bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)] relative overflow-hidden">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  </div>
                  <h2 className="text-2xl font-medium">Generate <span className="font-serif italic font-normal">Experience</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-3 opacity-50">Select Employee</label>
                      <select 
                        value={selectedEmployee} 
                        onChange={(e) => handleSelectEmployee(e.target.value)} 
                        className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 text-[#373a46] font-medium transition-all"
                      >
                        <option value="">Choose an employee...</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.email}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-3 opacity-50">Role / Position</label>
                      <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 text-[#373a46] font-medium transition-all"
                      >
                        {['Intern', 'Junior Developer', 'Developer', 'Designer', 'Analyst', 'Team Lead'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-3 opacity-50">Manager Remarks (Optional)</label>
                      <textarea 
                        value={managerRemarks} 
                        onChange={(e) => setManagerRemarks(e.target.value)} 
                        className="w-full bg-zinc-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 text-[#373a46] font-medium transition-all resize-none"
                        rows={3}
                        placeholder="Excellent work ethic, fast learner..."
                      />
                    </div>

                    <button 
                      onClick={handleGenerateExperience} 
                      disabled={!selectedEmployee || generating}
                      className="w-full bg-[#1d1d1d] text-white py-4 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase btn-editorial-shadow hover:opacity-90 transition-all disabled:opacity-40"
                    >
                      {generating ? 'Generating...' : 'Generate Experience Record'}
                    </button>
                  </div>

                  {/* Live Preview */}
                  <div>
                    {employeeStats ? (
                      <div className="bg-white p-8 rounded-2xl border border-black/[0.04] shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-black/5">
                          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
                            {employeeStats.email.substring(0,1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[15px]">{employeeStats.email}</p>
                            <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest opacity-50">{role} at SGG Company</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-zinc-50 rounded-xl">
                            <p className="text-2xl font-medium tracking-tighter">{employeeStats.totalTasks}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">Total Tasks</p>
                          </div>
                          <div className="text-center p-4 bg-zinc-50 rounded-xl">
                            <p className="text-2xl font-medium tracking-tighter">{employeeStats.completedTasks}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">Completed</p>
                          </div>
                          <div className="text-center p-4 bg-zinc-50 rounded-xl">
                            <p className="text-2xl font-medium tracking-tighter">{employeeStats.performanceScore}%</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">Performance</p>
                          </div>
                        </div>

                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1d1d1d] rounded-full transition-all duration-700" style={{ width: `${employeeStats.performanceScore}%` }}></div>
                        </div>

                        {employeeStats.topSkills.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50 mb-3">Top Completed Work</p>
                            <div className="flex flex-wrap gap-2">
                              {employeeStats.topSkills.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold text-[#373a46]">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
                        <span className="material-symbols-outlined text-5xl mb-4">person_search</span>
                        <p className="text-sm font-medium">Select an employee to preview their stats</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* ───── EMPLOYEE VIEW ───── */
            <>
              <section className="fade-in-section bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/[0.04] shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">verified</span>
                  </div>
                  <h2 className="text-2xl font-medium">My Verified <span className="font-serif italic font-normal">Experience</span></h2>
                </div>

                {experienceRecords.length === 0 ? (
                  <div className="text-center py-16 opacity-40">
                    <span className="material-symbols-outlined text-5xl mb-4 block">workspace_premium</span>
                    <p className="text-sm font-medium">No experience records generated yet.</p>
                    <p className="text-xs mt-2">Your manager will generate your verified experience when ready.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {experienceRecords.map((rec, idx) => (
                      <div 
                        key={`${rec.id}-${idx}`} 
                        className="p-8 rounded-2xl border border-black/[0.04] bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedRecord(selectedRecord?.id === rec.id ? null : rec)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#1d1d1d] flex items-center justify-center text-white">
                              <span className="material-symbols-outlined text-xl">workspace_premium</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg tracking-tight">{rec.company_name}</h3>
                              <p className="text-[11px] text-[#6b7280] font-bold uppercase tracking-widest">{rec.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="verified-badge px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-[10px]">verified</span>
                              Verified
                            </span>
                          </div>
                        </div>

                        {selectedRecord?.id === rec.id && (
                          <div className="mt-8 pt-8 border-t border-black/5 space-y-6 animate-fade-in">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-zinc-50 rounded-xl">
                                <p className="text-3xl font-medium tracking-tighter">{rec.completed_tasks}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">out of {rec.total_tasks}</p>
                              </div>
                              <div className="text-center p-4 bg-zinc-50 rounded-xl">
                                <p className="text-3xl font-medium tracking-tighter">{rec.performance_score}%</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">Performance</p>
                              </div>
                              <div className="text-center p-4 bg-zinc-50 rounded-xl">
                                <p className="text-3xl font-medium tracking-tighter">{rec.role}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] opacity-60 mt-1">Position</p>
                              </div>
                            </div>

                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1d1d1d] rounded-full" style={{ width: `${rec.performance_score}%` }}></div>
                            </div>

                            {rec.top_skills && rec.top_skills.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50 mb-3">Key Accomplishments</p>
                                <div className="flex flex-wrap gap-2">
                                  {rec.top_skills.map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold text-[#373a46]">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rec.manager_remarks && (
                              <div className="bg-zinc-50 p-5 rounded-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] opacity-50 mb-2">Manager Remarks</p>
                                <p className="text-sm font-medium font-serif italic text-[#373a46]">"{rec.manager_remarks}"</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-black/5 text-[11px] text-[#6b7280]">
                              <p><span className="font-bold text-[#373a46]">Verified by:</span> {rec.profiles?.email || 'Manager'}</p>
                              <p><span className="font-bold text-[#373a46]">Date:</span> {new Date(rec.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
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
    </div>
  );
}

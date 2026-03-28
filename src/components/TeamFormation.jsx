import React, { useState, useEffect } from 'react';
import { createTeam, addTeamMembers, fetchEmployees, insertActivityLog, getProfileByEmail, fetchTeams } from '../lib/database';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function TeamFormation() {
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [realUserId, setRealUserId] = useState(null);

  const initData = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          const manager_id = await getProfileByEmail(user.email);
          setRealUserId(manager_id);
        }
        setEmployees(await fetchEmployees());
        
        
        const fetchedTeams = await fetchTeams();
        let teamTasks = [];
        try {
          // Wrap in try-catch so it won't crash if the user hasn't run the SQL schema update yet
          const { data, error } = await supabase.from('tasks').select('*').not('team_id', 'is', null);
          if (!error && data) teamTasks = data;
        } catch (taskErr) {
          console.warn("Could not fetch team tasks. Make sure teams_schema.sql is fully applied.", taskErr);
        }
        
        const teamsWithTasks = (fetchedTeams || []).map(t => ({
           ...t,
           tasks: teamTasks.filter(tsk => tsk.team_id === t.id)
        }));
        setTeams(teamsWithTasks);
      } catch (e) {
        console.error("TeamFormation load error", e);
      }
    };

  useEffect(() => {
    initData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return alert("Team name is required.");
    if (selectedTeamMembers.length === 0) return alert("Select at least one team member.");
    try {
      const team = await createTeam(newTeamName, realUserId);
      await addTeamMembers(team.id, selectedTeamMembers);
      
      setNewTeamName('');
      setSelectedTeamMembers([]);
      await insertActivityLog({
        user_id: realUserId,
        action: 'created team',
        details: newTeamName
      });
      initData();
      alert("Team created successfully!");
    } catch (error) {
      console.error('Error creating team:', error);
      alert("Failed to create team.");
    }
  };

  return (
    <>
    <section className="fade-in-section bg-white/40 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/5 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)] mt-10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-medium">Team <span className="font-serif italic font-normal">Formation</span></h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-4 opacity-50">Team Name</label>
          <input 
            value={newTeamName} 
            onChange={e => setNewTeamName(e.target.value)} 
            className="w-full bg-transparent border-0 border-b border-black/10 focus:ring-0 focus:border-black pb-3 px-0 transition-all placeholder:text-black/10 text-lg font-medium tracking-tight" 
            placeholder="e.g. Design Team" 
            type="text" 
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#6b7280] mb-4 opacity-50">Select Team Members</label>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar mb-6">
                {employees.map((emp, idx) => {
                  const isSelected = selectedTeamMembers.includes(emp.id);
                  return (
                  <div key={`${emp.id}-team-${idx}`} onClick={() => {
                    setSelectedTeamMembers(prev =>
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
                      </div>
                      {isSelected && <span className="material-symbols-outlined text-white text-sm">check_circle</span>}
                  </div>
                  );
                })}
                {employees.length === 0 && <span className="text-xs text-[#6b7280] italic">No employees found. Seed the database.</span>}
            </div>
            <button onClick={handleCreateTeam} className="w-full bg-[#1d1d1d] text-white py-4 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase btn-editorial-shadow hover:opacity-90 transition-all disabled:opacity-50">
              Create Team
            </button>
        </div>
      </div>
    </section>

    {/* Display Teams and their Work */}
    <section className="fade-in-section bg-white/40 backdrop-blur-sm p-10 rounded-[2.5rem] border border-black/5 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.15)] mt-10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-medium">Active <span className="font-serif italic font-normal">Teams</span></h3>
      </div>
      <div className="space-y-6">
        {teams.length === 0 ? <p className="text-xs text-[#6b7280]">No teams formed yet.</p> : teams.map((team, idx) => (
          <div key={`${team.id}-${idx}`} className="p-6 rounded-2xl bg-white border border-black/[0.03] shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg">{team.name}</h4>
              <div className="flex -space-x-2 overflow-hidden">
                {team.team_members?.map((m, i) => (
                  <div key={i} title={m.profiles?.email} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden" >
                    {m.profiles?.email?.substring(0,2)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-bold text-[#6b7280] tracking-widest mb-3 opacity-60">Assigned Team Work</h5>
              {(!team.tasks || team.tasks.length === 0) ? <p className="text-xs text-[#6b7280] italic">No active assignments for this team.</p> : (
                 <div className="space-y-2">
                   {team.tasks.map(t => (
                      <div key={t.id} className="text-sm font-medium flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-black/5 hover:border-black/20 transition-all">
                        <span>{t.title}</span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#6b7280] bg-white border border-black/5 px-3 py-1.5 rounded-full shadow-sm">{t.status}</span>
                      </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

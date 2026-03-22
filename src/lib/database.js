import { supabase } from './supabase';

// ─── TASKS ──────────────────────────────
export const fetchTasks = async () => {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return data;
};

export const createTask = async (task) => {
  const { data, error } = await supabase.from('tasks').insert(task);
  if (error) throw error;
  return data;
};

// ─── TASK WITH MULTI-ASSIGN ─────────────
export const createTaskWithAssignees = async (task, assigneeIds) => {
  console.log("── createTaskWithAssignees START ──");
  console.log("Task payload:", JSON.stringify(task));
  console.log("Assignee IDs received:", JSON.stringify(assigneeIds));

  // 1. Insert the task and get back the created row
  const { data: createdTask, error: taskError } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (taskError) {
    console.error("❌ TASK INSERT FAILED:", taskError);
    throw taskError;
  }
  console.log("✅ Task created successfully:", JSON.stringify(createdTask));

  // 2. Insert into task_assignments one by one for maximum reliability
  for (const uid of assigneeIds) {
    const row = { task_id: createdTask.id, user_id: uid };
    console.log("Inserting assignment:", JSON.stringify(row));
    const { data: assignData, error: assignError } = await supabase
      .from('task_assignments')
      .insert(row)
      .select();

    if (assignError) {
      console.error("❌ ASSIGNMENT INSERT FAILED for user " + uid + ":", assignError);
    } else {
      console.log("✅ Assignment inserted:", JSON.stringify(assignData));
    }
  }

  // 3. Verification: fetch all assignments to confirm
  const { data: verify } = await supabase.from('task_assignments').select('*');
  console.log("📋 ALL task_assignments in DB:", JSON.stringify(verify));
  console.log("── createTaskWithAssignees END ──");

  return createdTask;
};

// ─── EMPLOYEE: FETCH VIA task_assignments ─
export const fetchEmployeeAssignedTasks = async (userId) => {
  const { data, error } = await supabase
    .from('task_assignments')
    .select(`
      task_id, 
      tasks (
        *,
        task_deliverables (status, submitted_by)
      )
    `)
    .eq('user_id', userId);
  if (error) throw error;
  // Flatten: return the joined task object for each assignment row
  return (data || []).map(row => row.tasks).filter(Boolean);
};

export const updateTask = async (id, updates) => {
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id);
  if (error) throw error;
  return data;
};

// ─── DELETE TASK (cascade) ──────────────
export const deleteTask = async (taskId) => {
  // 1. Delete all assignments for this task
  await supabase.from('task_assignments').delete().eq('task_id', taskId);
  // 2. Delete all deliverables for this task
  await supabase.from('task_deliverables').delete().eq('task_id', taskId);
  // 3. Delete the task itself
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
};

// ─── COMMENTS ───────────────────────────
export const addComment = async (comment) => {
  const { data, error } = await supabase.from('task_comments').insert(comment);
  if (error) throw error;
  return data;
};

// ─── ATTACHMENTS ────────────────────────
export const uploadAttachment = async (file, path) => {
  console.log("📎 Upload starting:", { fileName: file.name, size: file.size, type: file.type, path });
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });
  if (error) {
    console.error("❌ Storage upload error:", error);
    throw error;
  }
  console.log("✅ Upload success:", data);
  return data;
};

// ─── USER ───────────────────────────────
export const fetchCurrentUser = async () => {
  const savedUser = localStorage.getItem('user');
  if (!savedUser) return null;
  const user = JSON.parse(savedUser);
  // Re-fetch the real ID from DB based on email to ensure parity
  const { data, error } = await supabase.from('profiles').select('id').eq('email', user.email).single();
  if (!error && data) return { ...user, id: data.id };
  return user;
};

export const getProfileByEmail = async (email) => {
  const { data, error } = await supabase.from('profiles').select('id').eq('email', email).single();
  if (error) throw error;
  return data?.id;
};

export const fetchUserRole = async (userId) => {
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
  if (error) return null;
  return data?.role;
};

// ─── MANAGER & DASHBOARD ───────────────────
export const fetchTaskMetrics = async (managerId) => {
  const { data, error } = await supabase.from('tasks').select('id, status, deadline').eq('created_by', managerId);
  if (error) throw error;
  const assigned = data.length;
  const completed = data.filter(t => t.status === 'completed').length;
  const overdue = data.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date()).length;
  return { assigned, completed, overdue, data };
};

export const fetchEmployees = async () => {
  const { data, error } = await supabase.from('user_roles').select('user_id, role, profiles(email, id)').eq('role', 'employee');
  if (error) throw error;
  return data.map(d => ({ id: d.profiles.id, email: d.profiles.email }));
};

// ─── ACTIVITY LOGS ──────────────────────
export const insertActivityLog = async (log) => {
  // log: { user_id, action, details }
  const { data, error } = await supabase.from('activity_logs').insert(log);
  if (error) throw error;
  return data;
};

export const fetchActivityLogs = async () => {
  const { data, error } = await supabase.from('activity_logs')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
};

// ─── DELIVERABLES (REVIEWS) ─────────────
export const submitDeliverable = async (deliverable) => {
  // deliverable: { task_id, submitted_by, submission_type, content_url }
  const { data, error } = await supabase.from('task_deliverables').insert(deliverable);
  if (error) throw error;
  return data;
};

export const fetchManagerDeliverables = async (managerId) => {
  const { data, error } = await supabase.from('task_deliverables')
    .select('*, tasks!inner(*), profiles:submitted_by(email)')
    .eq('tasks.created_by', managerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const reviewDeliverable = async (id, reviewData) => {
  // reviewData: { status, feedback, rating, reviewed_by, reviewed_at }
  const { data, error } = await supabase
    .from('task_deliverables')
    .update({ ...reviewData, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return data;
};

// ─── TASK MESSAGES (REAL-TIME CHAT) ─────
export const fetchTaskMessages = async (taskId) => {
  const { data, error } = await supabase
    .from('task_messages')
    .select(`
      *,
      profiles:sender_id (email)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const sendTaskMessage = async (taskId, senderId, message) => {
  const { data, error } = await supabase.from('task_messages').insert({
    task_id: taskId,
    sender_id: senderId,
    message: message
  });
  if (error) throw error;
  return data;
};

import React, { useState, useEffect } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import { taskService, type Task, type TaskCreatePayload, type TaskUpdatePayload, type UserSimple } from "../services/taskService";
import { userService } from "../services/userService";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSuccess, taskToEdit }) => {
  const isEditMode = !!taskToEdit;
  const [users, setUsers] = useState<UserSimple[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [status, setStatus] = useState<"To Do" | "In Progress" | "Completed">("To Do");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string>("");

  // Load system users for dropdown lists
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const list = await userService.getUsers();
          setUsers(list);
        } catch (err: any) {
          console.error("Failed to load users", err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  // Sync state with selected task when in Edit Mode
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setAssignedUserId(taskToEdit.assigned_user_id ? String(taskToEdit.assigned_user_id) : "");
        
        // Convert ISO string to datetime-local format: YYYY-MM-DDTHH:MM
        if (taskToEdit.due_date) {
          const date = new Date(taskToEdit.due_date);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const hh = String(date.getHours()).padStart(2, "0");
          const min = String(date.getMinutes()).padStart(2, "0");
          setDueDate(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
        } else {
          setDueDate("");
        }
      } else {
        // Reset states for Create Mode
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setStatus("To Do");
        setDueDate("");
        setAssignedUserId("");
      }
      setError(null);
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!dueDate) {
      setError("Please set a valid due date and time.");
      return;
    }

    setLoading(true);
    setError(null);

    const parsedAssignedUserId = assignedUserId ? Number(assignedUserId) : null;
    const formattedDueDate = new Date(dueDate).toISOString();

    try {
      if (isEditMode && taskToEdit) {
        const payload: TaskUpdatePayload = {
          title,
          description,
          priority,
          status,
          due_date: formattedDueDate,
          assigned_user_id: parsedAssignedUserId,
        };
        await taskService.updateTask(taskToEdit.id, payload);
      } else {
        const payload: TaskCreatePayload = {
          title,
          description: description || null,
          priority,
          status,
          due_date: formattedDueDate,
          assigned_user_id: parsedAssignedUserId,
        };
        await taskService.createTask(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred while saving the task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div 
        className="w-full max-w-lg glass-panel rounded-2xl border border-glassBorder shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-glassBorder">
          <h2 className="text-lg font-black tracking-wide text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo to-purple-300">
            {isEditMode ? "Modify Existing Task" : "Create New Task"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-300 font-medium">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Database Migration"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed brief of this task..."
              rows={3}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10 resize-none"
            />
          </div>

          {/* Priority Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Low", "Medium", "High"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    priority === p
                      ? p === "High"
                        ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                        : p === "Medium"
                        ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                        : "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["To Do", "In Progress", "Completed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    status === s
                      ? "bg-brandPurple/20 border-brandPurple text-brandPurple shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid for Due Date & Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10 scheme-dark"
                required
              />
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Assign User
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
              >
                <option value="" className="bg-darkBg text-gray-500">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-darkBg text-gray-300">
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-glassBorder">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brandPurple to-brandIndigo text-xs font-bold text-white shadow-glowPurple transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

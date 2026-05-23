import React from "react";
import { Edit2, Trash2, Clock, User, AlertCircle, Download } from "lucide-react";
import type { Task } from "../services/taskService";

interface TaskCardProps {
  task: Task;
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: "To Do" | "In Progress" | "Completed") => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isAdmin,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  // Determine if a task is overdue (past due date and time, and not completed)
  const isOverdue = task.status !== "Completed" && new Date(task.due_date) < new Date();

  // Helper: priority badge style mapping
  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case "High":
        return "bg-red-500/15 border-red-500/30 text-red-400";
      case "Medium":
        return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
      case "Low":
      default:
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
    }
  };

  // Format date helper: "20 May 2026 at 09:30"
  const formatDueDate = (isoString: string) => {
    const d = new Date(isoString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} at ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group ${isOverdue
        ? "border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:border-red-500/60"
        : "hover:border-brandPurple/30 hover:shadow-glowPurple"
        } hover:translate-y-[-4px]`}
    >
      {/* Overdue Glow Badge */}
      {isOverdue && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider animate-pulse shadow-md">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </span>
      )}

      {/* Title & Controls */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          {/* Priority Badge */}
          <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority} Priority
          </span>

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => {
                  const headers = ["id","title","description","status","priority","due_date","assigned_user"];                    
                  const row = [
                    task.id,
                    task.title,
                    task.description,
                    task.status,
                    task.priority,
                    task.due_date,
                    task.assigned_user ? task.assigned_user.username : "",
                  ];
                  const csv = [headers, row]
                    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
                    .join('\n');
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `task_${task.id}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-gray-400 hover:text-brandPurple p-1 rounded hover:bg-white/5 transition-colors duration-200"
                title="Download CSV"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="text-gray-400 hover:text-brandPurple p-1 rounded hover:bg-white/5 transition-colors duration-200"
                title="Edit Task"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors duration-200"
                title="Delete Task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Task Title */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-brandPurple transition-colors duration-300">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
          {task.description || <span className="italic text-gray-600">No description provided.</span>}
        </p>
      </div>

      {/* Metadata & Status Selector */}
      <div className="pt-4 border-t border-glassBorder space-y-3.5">
        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
          {/* Due date */}
          <div className={`flex items-center gap-2 ${isOverdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDueDate(task.due_date)}</span>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2 text-gray-400">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>
              {task.assigned_user ? (
                <span>Assigned to <strong className="text-gray-300 font-semibold">{task.assigned_user.username}</strong></span>
              ) : (
                <span className="italic text-gray-600">Unassigned</span>
              )}
            </span>
          </div>
        </div>

        {/* Status Dropdown selector */}
        <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Task Status
          </span>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as any)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer border-0 p-0 pr-6 ${task.status === "Completed"
              ? "text-emerald-400"
              : task.status === "In Progress"
                ? "text-brandPurple"
                : "text-gray-400"
              }`}
          >
            <option value="To Do" className="bg-gray-800 text-gray-200 font-bold">To Do</option>
            <option value="In Progress" className="bg-purple-800 text-purple-200 font-bold">In Progress</option>
            <option value="Completed" className="bg-emerald-800 text-emerald-200 font-bold">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

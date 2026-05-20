import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Clock, User, CheckCircle2, AlertCircle, X } from "lucide-react";
import type { Task } from "../services/taskService";

interface CalendarViewProps {
  tasks: Task[];
  onStatusChange?: (id: number, newStatus: "To Do" | "In Progress" | "Completed") => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onStatusChange }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Map Task objects to FullCalendar Events
  const events = tasks.map((task) => {
    // Color coding based on status and priority
    let color = "#6366f1"; // Default brand Indigo (Low Priority)
    
    if (task.status === "Completed") {
      color = "#10b981"; // Emerald Green
    } else if (task.priority === "High") {
      color = "#ef4444"; // Crimson Red
    } else if (task.priority === "Medium") {
      color = "#f59e0b"; // Bright Amber
    }

    return {
      id: String(task.id),
      title: task.title,
      start: task.due_date,
      backgroundColor: `${color}25`, // Semi-translucent filling for glass vibe
      borderColor: color,
      textColor: color,
      extendedProps: { task },
    };
  });

  const handleEventClick = (info: any) => {
    setSelectedTask(info.event.extendedProps.task);
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="relative glass-panel rounded-2xl p-6 border border-glassBorder animate-in fade-in duration-300">
      {/* FullCalendar Component */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        events={events}
        eventClick={handleEventClick}
        height="68vh"
        aspectRatio={1.35}
        editable={false}
        selectable={true}
        dayMaxEvents={true}
      />

      {/* Task Details Popover Bubble */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-panel rounded-2xl border border-glassBorder shadow-2xl p-5 relative">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Title */}
            <h3 className="text-base font-bold text-white pr-6 mb-3 leading-snug">
              {selectedTask.title}
            </h3>

            {/* Body Info */}
            <div className="space-y-3 mb-5">
              {selectedTask.description && (
                <p className="text-xs text-gray-400 bg-white/5 rounded-lg p-2.5 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedTask.description}
                </p>
              )}

              <div className="flex flex-col gap-2 text-xs text-gray-400">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brandPurple" />
                  <span>
                    Status: <strong className="text-gray-200 font-semibold">{selectedTask.status}</strong>
                  </span>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>
                    Priority: <strong className="text-gray-200 font-semibold">{selectedTask.priority}</strong>
                  </span>
                </div>

                {/* Due Date & Time */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>
                    Due: <strong className="text-gray-200 font-semibold">{new Date(selectedTask.due_date).toLocaleDateString()}</strong> at <strong className="text-gray-200 font-semibold">{formatTime(selectedTask.due_date)}</strong>
                  </span>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brandIndigo" />
                  <span>
                    Assignee:{" "}
                    {selectedTask.assigned_user ? (
                      <strong className="text-gray-200 font-semibold">{selectedTask.assigned_user.username}</strong>
                    ) : (
                      <span className="italic text-gray-600">Unassigned</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status selector inside calendar popover */}
            {onStatusChange && (
              <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-xl px-3.5 py-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Quick Update
                </span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => {
                    onStatusChange(selectedTask.id, e.target.value as any);
                    setSelectedTask(null);
                  }}
                  className="text-xs font-bold bg-transparent outline-none cursor-pointer border-0 p-0 text-brandPurple pr-6"
                >
                  <option value="To Do" className="bg-darkBg text-gray-300 font-bold">To Do</option>
                  <option value="In Progress" className="bg-darkBg text-gray-300 font-bold">In Progress</option>
                  <option value="Completed" className="bg-darkBg text-gray-300 font-bold">Completed</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

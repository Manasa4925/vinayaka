import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CalendarView from "../components/CalendarView";
import TaskCard from "../components/TaskCard";
import { taskService, type Task } from "../services/taskService";
import { 
  Inbox, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  LayoutGrid 
} from "lucide-react";

const UserDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchAssignedTasks = async () => {
    try {
      // Backend automatically filters tasks belonging to current_user
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load user tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const handleStatusChange = async (id: number, newStatus: "To Do" | "In Progress" | "Completed") => {
    try {
      // Regular user can only modify status, this matches standard user permission
      await taskService.updateTask(id, { status: newStatus });
      fetchAssignedTasks(); // Reload dashboard tasks
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Metrics
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status !== "Completed").length;
  const overdue = tasks.filter(
    (t) => t.status !== "Completed" && new Date(t.due_date) < new Date()
  ).length;

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      title: "My Tasks",
      value: total,
      icon: <Inbox className="h-5 w-5 text-gray-400" />,
      color: "bg-white/5 border-white/5",
    },
    {
      title: "Completed",
      value: completed,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      color: "bg-emerald-500/5 border-emerald-500/10",
    },
    {
      title: "Pending Action",
      value: pending,
      icon: <Activity className="h-5 w-5 text-brandPurple" />,
      color: "bg-brandPurple/5 border-brandPurple/10",
    },
    {
      title: "Overdue Alerts",
      value: overdue,
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      color: overdue > 0 
        ? "bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-pulse" 
        : "bg-white/5 border-white/5",
    },
  ];

  return (
    <div className="flex min-h-screen bg-darkBg text-gray-100">
      {/* Navigation */}
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 md:pl-64 py-8 px-6 overflow-y-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-300 to-brandPurple">
              My Task Board
            </h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
              Personalized Work schedule & metrics
            </p>
          </div>

          {/* View Toggler */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl border border-white/10 text-xs font-bold text-gray-200 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all duration-200"
          >
            {showCalendar ? (
              <>
                <LayoutGrid className="h-4.5 w-4.5 text-brandPurple" />
                <span>Show Tasks Grid</span>
              </>
            ) : (
              <>
                <CalendarIcon className="h-4.5 w-4.5 text-brandIndigo" />
                <span>Show My Calendar</span>
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-brandPurple/10 border-t-brandPurple animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.title} className={`glass-panel p-5 rounded-2xl border ${stat.color} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{stat.title}</span>
                    {stat.icon}
                  </div>
                  <div>
                    <span className="text-3xl font-black text-white tracking-tight">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Section */}
            {showCalendar ? (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">My Calendar Agenda</h2>
                <CalendarView tasks={tasks} onStatusChange={handleStatusChange} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Tasks Grid */}
                <div className="lg:col-span-8 space-y-4">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Task Deck</h2>
                  
                  {tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isAdmin={false} // Users don't see edit/delete buttons
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel border border-glassBorder rounded-2xl py-14 flex flex-col items-center justify-center gap-3 text-center">
                      <CheckCircle2 className="h-12 w-12 text-gray-600 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">All Caught Up!</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-[250px] leading-relaxed mx-auto">
                          There are currently no tasks assigned to your account. Take a break!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Wheel Panel */}
                <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-glassBorder flex flex-col items-center justify-center text-center h-[340px]">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">My Workspace Completion</h3>
                  
                  <div className="relative flex items-center justify-center">
                    {/* SVG Radial Wheel */}
                    <svg className="h-40 w-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="64"
                        className="stroke-gray-800 fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="64"
                        className="stroke-brandPurple fill-none transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 64}
                        strokeDashoffset={2 * Math.PI * 64 * (1 - progressPercent / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white">{progressPercent}%</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Finished</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-6 max-w-[200px] leading-relaxed uppercase font-semibold">
                    {completed} of {total} assigned tasks completed
                  </p>
                </div>

              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;

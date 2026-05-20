import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CalendarView from "../components/CalendarView";
import { taskService, type Task } from "../services/taskService";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Calendar as CalendarIcon, 
  BarChart4, 
  Inbox 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchAllTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load dashboard tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleStatusChange = async (id: number, newStatus: "To Do" | "In Progress" | "Completed") => {
    try {
      await taskService.updateTask(id, { status: newStatus });
      fetchAllTasks(); // Refresh stats and calendar
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // 1. Metric calculations
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const todo = tasks.filter((t) => t.status === "To Do").length;
  const overdue = tasks.filter(
    (t) => t.status !== "Completed" && new Date(t.due_date) < new Date()
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 2. Recharts Data structures
  const statusChartData = [
    { name: "To Do", count: todo, color: "#94a3b8" },
    { name: "In Progress", count: inProgress, color: "#8b5cf6" },
    { name: "Completed", count: completed, color: "#10b981" },
  ];

  const priorityChartData = [
    { name: "High", value: tasks.filter((t) => t.priority === "High").length, color: "#ef4444" },
    { name: "Medium", value: tasks.filter((t) => t.priority === "Medium").length, color: "#f59e0b" },
    { name: "Low", value: tasks.filter((t) => t.priority === "Low").length, color: "#6366f1" },
  ].filter((d) => d.value > 0); // Hide empty slices

  const statCards = [
    {
      title: "Total Tasks",
      value: total,
      icon: <Inbox className="h-5 w-5 text-gray-400" />,
      desc: "All tasks in workspace",
      color: "bg-white/5 border-white/5",
    },
    {
      title: "Completed",
      value: completed,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      desc: `${completionRate}% completion rate`,
      color: "bg-emerald-500/5 border-emerald-500/10",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: <Activity className="h-5 w-5 text-brandPurple" />,
      desc: "Currently being worked",
      color: "bg-brandPurple/5 border-brandPurple/10",
    },
    {
      title: "Overdue Alerts",
      value: overdue,
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      desc: "Tasks past due date",
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
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-300 to-brandPurple">
              Workspace Overview
            </h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
              Administrator Analytics & Controls
            </p>
          </div>

          {/* Quick toggle to Calendar */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl border border-white/10 text-xs font-bold text-gray-200 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all duration-200"
          >
            {showCalendar ? (
              <>
                <BarChart4 className="h-4.5 w-4.5 text-brandPurple" />
                <span>Show Analytics Charts</span>
              </>
            ) : (
              <>
                <CalendarIcon className="h-4.5 w-4.5 text-brandIndigo" />
                <span>Show Monthly Calendar</span>
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
              {statCards.map((card) => (
                <div key={card.title} className={`glass-panel p-5 rounded-2xl border ${card.color} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{card.title}</span>
                    {card.icon}
                  </div>
                  <div>
                    <span className="text-3xl font-black text-white tracking-tight">{card.value}</span>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Content view toggled by calendar button */}
            {showCalendar ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Calendar</h2>
                </div>
                <CalendarView tasks={tasks} onStatusChange={handleStatusChange} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Status Bar Chart */}
                <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-glassBorder flex flex-col justify-between h-[380px]">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                      Task Progression status
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-6">
                      Overview of task status distribution across the team
                    </p>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={statusChartData}>
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.4)" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.4)" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#fff"
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={55}>
                          {statusChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} fillOpacity={0.7} stroke={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Priority Donut Chart */}
                <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-glassBorder flex flex-col justify-between h-[380px]">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                      Task Priority Weight
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-4">
                      Criticality breakdown of active tasks
                    </p>
                  </div>
                  
                  {priorityChartData.length > 0 ? (
                    <div className="flex-1 relative flex items-center justify-center min-h-0">
                      <ResponsiveContainer width="100%" height="95%">
                        <PieChart>
                          <Pie
                            data={priorityChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {priorityChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                fillOpacity={0.8}
                                stroke={entry.color}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "12px",
                              fontSize: "11px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Floating Text inside Donut */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{total}</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Active Tasks</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-10 w-10 text-gray-600" />
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">No priority data</span>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-400 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#6366f1]" />
                      <span>Low</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Overdue Alert banner lists */}
            {overdue > 0 && (
              <div className="glass-panel border border-red-500/20 bg-red-500/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-400 animate-bounce" />
                  <h3 className="text-xs font-bold text-red-300 uppercase tracking-widest">Immediate Attention Required ({overdue} Overdue)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks
                    .filter((t) => t.status !== "Completed" && new Date(t.due_date) < new Date())
                    .slice(0, 3)
                    .map((t) => (
                      <div key={t.id} className="bg-red-500/10 border border-red-500/15 p-3 rounded-xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{t.title}</h4>
                          <span className="text-[10px] font-bold uppercase text-red-400">
                            Due {new Date(t.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-red-500/10 text-[10px] text-gray-400">
                          <span className="font-medium">Assignee:</span>
                          <span className="text-gray-300 font-semibold truncate">
                            {t.assigned_user?.username || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

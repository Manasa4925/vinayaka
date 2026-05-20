import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { taskService, type Task } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  LayoutGrid, 
  Inbox 
} from "lucide-react";

const ManageTasks: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and Views
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [viewType, setViewType] = useState<"grid" | "kanban">("grid");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id: number, newStatus: "To Do" | "In Progress" | "Completed") => {
    try {
      await taskService.updateTask(id, { status: newStatus });
      fetchTasks(); // Reload tasks to propagate changes
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      try {
        await taskService.deleteTask(id);
        fetchTasks();
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Filter Tasks locally for real-time reactivity
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assigned_user && task.assigned_user.username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="flex min-h-screen bg-darkBg text-gray-100">
      {/* Navigation */}
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 md:pl-64 py-8 px-6 overflow-y-auto">
        
        {/* Header Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-300 to-brandPurple">
              Workspace Tasks
            </h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
              {isAdmin ? "Administer & Assign workspace items" : "View and update assigned work"}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            {/* View Toggler */}
            <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewType === "grid" 
                    ? "bg-brandPurple/20 text-brandPurple border border-brandPurple/10" 
                    : "text-gray-400 hover:text-gray-300"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewType("kanban")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewType === "kanban" 
                    ? "bg-brandPurple/20 text-brandPurple border border-brandPurple/10" 
                    : "text-gray-400 hover:text-gray-300"
                }`}
                title="Kanban Columns View"
              >
                <Kanban className="h-4 w-4" />
              </button>
            </div>

            {/* Admin Add Task Trigger */}
            {isAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brandPurple to-brandIndigo text-xs font-bold text-white shadow-glowPurple hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <div className="glass-panel rounded-2xl border border-glassBorder p-4 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, assignees..."
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
            />
          </div>

          {/* Status filter */}
          <div className="md:col-span-3 relative flex items-center">
            <span className="absolute left-3.5 text-gray-500 pointer-events-none">
              <Filter className="h-3.5 w-3.5" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
            >
              <option value="All" className="bg-darkBg text-gray-300">All Statuses</option>
              <option value="To Do" className="bg-darkBg text-gray-300">To Do</option>
              <option value="In Progress" className="bg-darkBg text-gray-300">In Progress</option>
              <option value="Completed" className="bg-darkBg text-gray-300">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="md:col-span-3 relative flex items-center">
            <span className="absolute left-3.5 text-gray-500 pointer-events-none">
              <Filter className="h-3.5 w-3.5" />
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
            >
              <option value="All" className="bg-darkBg text-gray-300">All Priorities</option>
              <option value="High" className="bg-darkBg text-gray-300">High Priority</option>
              <option value="Medium" className="bg-darkBg text-gray-300">Medium Priority</option>
              <option value="Low" className="bg-darkBg text-gray-300">Low Priority</option>
            </select>
          </div>

        </div>

        {/* Tasks Container */}
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-brandPurple/10 border-t-brandPurple animate-spin"></div>
          </div>
        ) : (
          <div className="min-h-[50vh]">
            {filteredTasks.length === 0 ? (
              <div className="glass-panel border border-glassBorder rounded-2xl py-20 flex flex-col items-center justify-center gap-3 text-center">
                <Inbox className="h-12 w-12 text-gray-600 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">No Tasks Found</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[280px] leading-relaxed mx-auto">
                    We couldn't find any tasks matching your filters. Try modifying your search query or dropdown criteria.
                  </p>
                </div>
              </div>
            ) : viewType === "grid" ? (
              
              /* 1. GRID CARDS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              
              /* 2. KANBAN COLUMNS VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
                {(["To Do", "In Progress", "Completed"] as const).map((columnStatus) => {
                  const columnTasks = filteredTasks.filter((t) => t.status === columnStatus);
                  
                  // Column header decoration styling
                  let headerBorder = "border-t-slate-500";
                  if (columnStatus === "In Progress") headerBorder = "border-t-brandPurple";
                  if (columnStatus === "Completed") headerBorder = "border-t-emerald-500";

                  return (
                    <div 
                      key={columnStatus} 
                      className={`glass-panel border border-glassBorder border-t-4 ${headerBorder} rounded-2xl p-4 flex flex-col gap-4 max-h-[80vh] overflow-hidden`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-glassBorder">
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                          {columnStatus}
                        </span>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400">
                          {columnTasks.length}
                        </span>
                      </div>

                      {/* Column Card Lane */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1 max-h-[66vh]">
                        {columnTasks.length > 0 ? (
                          columnTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              isAdmin={isAdmin}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onStatusChange={handleStatusChange}
                            />
                          ))
                        ) : (
                          <div className="border border-dashed border-white/5 rounded-xl py-12 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                              No {columnStatus} items
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Task Creation/Editing Overlay (Admins Only) */}
        {isAdmin && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchTasks}
            taskToEdit={taskToEdit}
          />
        )}
      </main>
    </div>
  );
};

export default ManageTasks;

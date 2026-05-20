import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  User as UserIcon 
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath = user?.role?.toLowerCase() === "admin" ? "/admin/dashboard" : "/user/dashboard";

  const navigationItems = [
    {
      name: "Dashboard",
      path: dashboardPath,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Manage Tasks",
      path: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between bg-darkBg/80 border-b border-glassBorder backdrop-blur-md px-4 py-3 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brandIndigo to-brandPurple flex items-center justify-center shadow-glowPurple">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <span className="font-extrabold text-sm tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-400 to-brandPurple">
            Vinayaka Tasks
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col glass-panel border-r border-glassBorder py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brandIndigo via-purple-500 to-brandPurple flex items-center justify-center shadow-glowPurple">
            <span className="text-white font-black text-lg">V</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-300 to-brandPurple uppercase">
              Vinayaka
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Task Workspace
            </span>
          </div>
        </div>

        {/* User Profile Badge Panel */}
        {user && (
          <div className="mb-6 px-3 py-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brandPurple/20 border border-brandPurple/30 flex items-center justify-center text-brandPurple font-semibold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-gray-200 truncate">
                {user.username}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {user.role?.toLowerCase() === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded bg-brandPurple/25 border border-brandPurple/30 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-brandPurple uppercase animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase">
                    <UserIcon className="h-3 w-3" />
                    User
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-brandPurple to-brandIndigo text-white shadow-glowPurple border-r-4 border-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border-r-4 border-transparent"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Control */}
        <div className="mt-auto px-1 pt-4 border-t border-glassBorder">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;

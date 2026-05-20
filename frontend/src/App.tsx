import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ManageTasks from "./pages/ManageTasks";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Unauthenticated routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Restricted Portal */}
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          
          {/* User Restricted Portal */}
          <Route 
            path="/user/dashboard" 
            element={
              <PrivateRoute allowedRoles={["User"]}>
                <UserDashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Secure Shared Workspace Workspace */}
          <Route 
            path="/tasks" 
            element={
              <PrivateRoute>
                <ManageTasks />
              </PrivateRoute>
            } 
          />
          
          {/* Default catch-all re-routing */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

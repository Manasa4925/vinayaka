import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Premium glassmorphic loading spinner while verifying token sessions
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-darkBg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-brandPurple/10 border-t-brandPurple animate-spin shadow-glowPurple"></div>
            <div className="absolute h-8 w-8 rounded-full border-4 border-brandIndigo/20 border-b-brandIndigo animate-spin animation-delay-150"></div>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">
            Loading Session
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated? Direct them to the credentials portal
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch? Return them to their appropriate dashboard home
  if (allowedRoles && !allowedRoles.some(r => r.toLowerCase() === user.role.toLowerCase())) {
    return user.role.toLowerCase() === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/user/dashboard" replace />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;

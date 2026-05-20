import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Key, User, AlertCircle } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all details.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      
      // Fetch role saved in localStorage to route correctly
      const role = localStorage.getItem("role");
      if (role?.toLowerCase() === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        const messages = detail.map((d: any) => `${d.loc?.[1] || d.loc?.[0] || "field"}: ${d.msg}`).join(", ");
        setError(`Validation Error: ${messages}`);
      } else {
        setError("Invalid login credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-darkBg">
      {/* Background visual shapes */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brandPurple/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brandIndigo/10 blur-3xl animate-pulse delay-1000"></div>

      {/* Glass card container */}
      <div className="w-full max-w-md glass-panel rounded-2xl border border-glassBorder shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-brandIndigo to-brandPurple items-center justify-center shadow-glowPurple mb-4">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-300 to-brandPurple">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Access your secure task workspace
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-300 font-medium mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username or Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin@vinayaka.com"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                <Key className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brandPurple to-brandIndigo text-sm font-bold text-white shadow-glowPurple hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Register Anchor */}
        <div className="text-center mt-6 text-xs text-gray-500">
          New to the system?{" "}
          <Link 
            to="/register" 
            className="font-bold text-brandPurple hover:text-brandIndigo hover:underline transition-colors duration-200"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

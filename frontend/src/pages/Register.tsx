import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, User, Mail, Key, Shield, AlertCircle } from "lucide-react";

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "User">("User");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all details.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(username, email, password, role);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        // Handle FastAPI/Pydantic validation lists gracefully
        const messages = detail.map((d: any) => `${d.loc?.[1] || d.loc?.[0] || "field"}: ${d.msg}`).join(", ");
        setError(`Validation Error: ${messages}`);
      } else {
        setError("Registration failed. Please make sure the username is also unique.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-darkBg">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brandPurple/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brandIndigo/10 blur-3xl animate-pulse delay-1000"></div>

      {/* Register glass panel */}
      <div className="w-full max-w-md glass-panel rounded-2xl border border-glassBorder shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-tr from-brandIndigo to-brandPurple items-center justify-center shadow-glowPurple mb-4">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-brandIndigo via-purple-300 to-brandPurple">
            Join Vinayaka
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            Register to assign and track tasks
          </p>
        </div>

        {/* Success notification */}
        {success && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-xs text-emerald-400 font-semibold mb-6 animate-pulse">
            Account created successfully! Redirecting to login portal...
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 text-xs text-red-300 font-medium mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. manas"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manas@vinayaka.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-brandPurple focus:bg-white/10"
                  required
                />
              </div>
            </div>

            {/* Role Selection Slider Toggle */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Account Role (Testing Toggle)
              </label>
              <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole("User")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    role === "User"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Admin")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    role === "Admin"
                      ? "bg-brandPurple/20 text-brandPurple border border-brandPurple/20"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Administrator
                </button>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed pl-1">
                {role === "Admin" 
                  ? "Admins can create, edit, reassign, delete, and view all system tasks." 
                  : "Users can view only their assigned tasks and change task statuses."}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brandPurple to-brandIndigo text-sm font-bold text-white shadow-glowPurple hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Anchor to Login */}
        <div className="text-center mt-6 text-xs text-gray-500">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="font-bold text-brandPurple hover:text-brandIndigo hover:underline transition-colors duration-200"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

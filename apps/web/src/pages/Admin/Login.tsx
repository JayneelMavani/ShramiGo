import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { login } from "../../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await login(email.trim(), password);
      if (response.user.role !== "admin") {
        localStorage.removeItem("shramigo_token");
        localStorage.removeItem("shramigo_user");
        setError("This account is not authorized for administration.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          onClick={() => navigate("/role-selection")}
          className="flex items-center gap-2 text-sm text-gray-600 mb-6 hover:text-[#087F7A]"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <BrandLogo size="md" />
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Login
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Secure access to the ShramiGo administration panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shramsetu.com"
                  required
                  disabled={loading}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm font-medium text-[#087F7A] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#087F7A] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#066F6A] transition"
            >
              {loading ? "Signing in..." : "Login to Admin Panel"}
              <ArrowRight size={19} />
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 rounded-2xl bg-[#087F7A]/5 flex gap-3">
            <ShieldCheck
              size={20}
              className="text-[#087F7A] shrink-0 mt-0.5"
            />

            <div>
              <p className="text-sm font-semibold text-gray-800">
                Secure Access
              </p>

              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This portal is restricted to authorized ShramiGo
                administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 ShramiGo · Connecting people. Empowering work.
        </p>
      </div>
    </div>
  );
}
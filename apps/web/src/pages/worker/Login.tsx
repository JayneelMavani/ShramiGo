import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  BriefcaseBusiness,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { login } from "../../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(
        email,
        password
      );

      if (response.user.role !== "worker") {
        localStorage.removeItem("shramigo_token");
        localStorage.removeItem("shramigo_user");
        localStorage.removeItem("shramigo_refresh_token");

        setError(
          "This account is not registered as a worker."
        );

        return;
      }

      navigate("/worker");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm">
        {/* Header */}
        <header className="px-5 pt-5">
          <button
            onClick={() => navigate("/role-selection")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8]"
          >
            <ArrowLeft size={20} />
          </button>
        </header>

        <main className="px-5 pb-10 pt-7">
          {/* Logo */}
          <div className="flex justify-center">
            <BrandLogo size="md" />
          </div>

          {/* Heading */}
          <div className="mt-5 text-center">
            <h1 className="text-2xl font-bold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Sign in to manage your jobs, schedule and earnings.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6">
            {/* Email */}
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#087F7A]">
                <Mail size={18} />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-gray-200 bg-white h-[50px] pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <label className="mb-2 mt-5 block text-xs font-semibold text-gray-700">
              Password
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#087F7A]">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 bg-white h-[50px] pl-11 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className="flex items-center gap-2"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    remember
                      ? "border-[#087F7A] bg-[#087F7A]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {remember && (
                    <span className="text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </span>

                <span className="text-xs text-gray-500">
                  Remember me
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setError(
                    "Password reset is currently handled via support. Please contact support@shramigo.in for account recovery."
                  )
                }
                className="text-xs font-semibold text-[#087F7A] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#087F7A] py-3.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Security */}
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#E9F7F6] px-4 py-3">
            <ShieldCheck
              size={17}
              className="text-[#087F7A]"
            />

            <p className="text-[10px] font-medium text-[#087F7A]">
              Your account and personal information are secure
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">
              OR
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Register */}
          <p className="text-center text-sm text-gray-500">
            Don't have a worker account?{" "}
            <Link
              to="/worker/register"
              className="font-bold text-[#087F7A]"
            >
              Create Account
            </Link>
          </p>

          {/* Worker Role */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <BriefcaseBusiness size={13} />
            <span>Logging in as Worker</span>
          </div>
          
          <button
            type="button"
            onClick={() =>
              navigate("/role-selection")
            }
            className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Change role
          </button>
        </main>
      </div>
    </div>
  );
}
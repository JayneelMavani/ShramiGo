import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[720px] bg-white sm:rounded-[32px] shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-[#087F7A] px-6 pt-8 pb-9 rounded-b-[34px]">

          <button
            type="button"
            onClick={() => navigate("/role-selection")}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mt-7 flex items-center gap-3">
            <BrandLogo size="sm" />

            <div>
              <p className="text-white/60 text-xs">
                Worker Account
              </p>

              <h1 className="text-xl font-bold text-white">
                Welcome back
              </h1>
            </div>
          </div>

          <p className="text-white/75 text-sm mt-5 leading-5">
            Sign in to manage your jobs, schedule and earnings.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pt-8">

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign in
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Enter your account details to continue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="w-full h-13 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">

                <label className="block text-sm font-semibold text-gray-800">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-semibold text-[#087F7A] hover:underline"
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full h-13 rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#087F7A] hover:bg-[#066C68] disabled:bg-[#087F7A]/60 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-100 transition-all active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>

          {/* Security */}
          <div className="mt-7 flex items-center justify-center gap-2">
            <ShieldCheck
              size={16}
              className="text-[#087F7A]"
            />

            <p className="text-xs text-gray-500">
              Your account information is secure
            </p>
          </div>

        </div>

        {/* Register */}
        <div className="px-6 pb-8 pt-6">

          <div className="h-px bg-gray-100 mb-6" />

          <p className="text-center text-sm text-gray-500">
            Don't have a worker account?
          </p>

          <Link
            to="/worker/register"
            className="mt-2 flex items-center justify-center text-sm font-semibold text-[#FF5A00] hover:underline"
          >
            Create Worker Account
          </Link>

          <button
            type="button"
            onClick={() =>
              navigate("/role-selection")
            }
            className="w-full mt-5 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Change role
          </button>

        </div>

      </div>
    </div>
  );
}
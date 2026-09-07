import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { login } from "../../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] =
    useState<"phone" | "email">("phone");

  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginType === "phone") {
      setError(
        "Phone login is not connected yet. Please use Email login."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await login(value.trim(), password);

      if (response.user.role !== "customer") {
        localStorage.removeItem("shramigo_token");
        localStorage.removeItem("shramigo_user");
        localStorage.removeItem("shramigo_refresh_token");

        setError("This account is not registered as a customer.");
        return;
      }

      navigate("/customer");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your email and password."
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
            onClick={() => navigate(-1)}
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
              Welcome Back!
            </h1>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Login to your ShramiGo customer account
            </p>
          </div>

          {/* Login Type */}
          <div className="mt-7 rounded-xl bg-[#F7F8F8] p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setLoginType("phone");
                  setValue("");
                  setError("");
                }}
                className={`rounded-lg py-2.5 text-xs font-semibold transition ${
                  loginType === "phone"
                    ? "bg-white text-[#FF5A00] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Phone Number
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType("email");
                  setValue("");
                  setError("");
                }}
                className={`rounded-lg py-2.5 text-xs font-semibold transition ${
                  loginType === "email"
                    ? "bg-white text-[#FF5A00] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Email
              </button>
            </div>
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
          <form onSubmit={handleLogin} className="mt-6">
            {/* Phone / Email */}
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              {loginType === "phone"
                ? "Phone Number"
                : "Email Address"}
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5A00]">
                {loginType === "phone" ? (
                  <Phone size={18} />
                ) : (
                  <Mail size={18} />
                )}
              </div>

              <input
                type={
                  loginType === "phone"
                    ? "tel"
                    : "email"
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  loginType === "phone"
                    ? "Enter your phone number"
                    : "Enter your email address"
                }
                className="w-full rounded-xl border border-gray-200 bg-white h-[50px] pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10"
                required
              />
            </div>

            {/* Password */}
            <label className="mb-2 mt-5 block text-xs font-semibold text-gray-700">
              Password
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5A00]">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 bg-white h-[50px] pl-11 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10"
                required
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
                      ? "border-[#FF5A00] bg-[#FF5A00]"
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
                className="text-xs font-semibold text-[#FF5A00] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#FF5A00] py-3.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Security */}
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#FFF5F0] px-4 py-3">
            <ShieldCheck
              size={17}
              className="text-[#FF5A00]"
            />

            <p className="text-[10px] font-medium text-[#FF5A00]">
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

          {/* OTP */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700"
          >
            <Phone
              size={17}
              className="text-[#FF5A00]"
            />
            Login with OTP
          </button>

          {/* Register */}
          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() =>
                navigate("/customer/register")
              }
              className="font-bold text-[#FF5A00]"
            >
              Create Account
            </button>
          </p>

          {/* Customer Role */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <UserRound size={13} />
            <span>Logging in as Customer</span>
          </div>
        </main>
      </div>
    </div>
  );
}
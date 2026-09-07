import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { registerWorker } from "../../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerWorker({
        full_name: fullName,
        phone,
        email,
        password,
      });

      if (response.user.role !== "worker") {
        localStorage.removeItem("shramigo_token");
        localStorage.removeItem("shramigo_user");

        setError(
          "Registration failed. Worker account could not be created."
        );

        return;
      }

      navigate("/worker/skills");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[760px] bg-white sm:rounded-[32px] shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-[#087F7A] px-6 pt-8 pb-8 rounded-b-[34px]">

          <button
            type="button"
            onClick={() => navigate("/worker/login")}
            disabled={loading}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mt-6 flex items-center gap-3">

            <BrandLogo size="sm" />

            <div>
              <p className="text-white/60 text-xs">
                Worker Account
              </p>

              <h1 className="text-xl font-bold text-white">
                Create your account
              </h1>
            </div>

          </div>

          <p className="text-white/75 text-sm mt-4 leading-5">
            Join ShramiGo and start connecting with customers near you.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pt-7 overflow-y-auto">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Let's get started
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Enter your basic details first.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Mobile number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter your mobile number"
                  required
                  maxLength={10}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
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
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
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
                  placeholder="Create a password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm outline-none focus:border-[#087F7A] focus:ring-2 focus:ring-[#087F7A]/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <button
              type="button"
              onClick={() => setAgree(!agree)}
              disabled={loading}
              className="flex items-start gap-3 text-left pt-1 disabled:opacity-60"
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                  agree
                    ? "bg-[#087F7A] border-[#087F7A]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {agree && (
                  <Check
                    size={14}
                    className="text-white"
                    strokeWidth={3}
                  />
                )}
              </div>

              <span className="text-xs text-gray-500 leading-5">
                I agree to the{" "}
                <span className="font-semibold text-[#087F7A]">
                  Terms & Conditions
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[#087F7A]">
                  Privacy Policy
                </span>
                .
              </span>
            </button>

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
              className="w-full h-14 rounded-2xl bg-[#087F7A] hover:bg-[#066C68] disabled:bg-[#087F7A]/60 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-100 transition-all active:scale-[0.98] mt-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Continue
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Login */}
        <div className="px-6 pb-7 pt-5 bg-white">

          <div className="h-px bg-gray-100 mb-5" />

          <p className="text-center text-sm text-gray-500">
            Already have a worker account?
          </p>

          <Link
            to="/worker/login"
            className="mt-2 flex items-center justify-center text-sm font-semibold text-[#FF5A00] hover:underline"
          >
            Sign in
          </Link>

        </div>

      </div>
    </div>
  );
}
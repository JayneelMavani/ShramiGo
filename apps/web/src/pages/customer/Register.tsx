import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerCustomer({
        full_name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/customer");
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
    <main className="min-h-screen w-full bg-[#F9FAFB] flex items-center justify-center">
      <div
        className="
          relative
          flex
          min-h-screen
          w-full
          max-w-[430px]
          flex-col
          overflow-hidden
          bg-white
        "
      >
        {/* Header */}
        <div className="px-5 pt-7">
          <button
            onClick={() => navigate("/customer/login")}
            aria-label="Go back"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-[#111827]
              transition
              hover:bg-[#F3F4F6]
              active:scale-95
            "
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-5 pt-6">
          {/* Heading */}
          <div>
            <h1
              className="
                text-[25px]
                font-bold
                leading-tight
                tracking-[-0.5px]
                text-[#111827]
              "
            >
              Create your account
            </h1>

            <p
              className="
                mt-2
                max-w-[320px]
                text-[13px]
                leading-[1.55]
                text-[#6B7280]
              "
            >
              Join ShramiGo and find trusted local services near you.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 flex flex-1 flex-col"
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-[12px] font-medium text-[#374151]"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  strokeWidth={1.8}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#9CA3AF]
                  "
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="
                    h-[50px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    pl-11
                    pr-4
                    text-[13px]
                    text-[#111827]
                    outline-none
                    transition
                    placeholder:text-[#9CA3AF]
                    focus:border-[#FF5A00]
                    focus:ring-2
                    focus:ring-[#FF5A00]/10
                  "
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="mt-4">
              <label
                htmlFor="phone"
                className="mb-2 block text-[12px] font-medium text-[#374151]"
              >
                Mobile Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  strokeWidth={1.8}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#9CA3AF]
                  "
                />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  className="
                    h-[50px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    pl-11
                    pr-4
                    text-[13px]
                    text-[#111827]
                    outline-none
                    transition
                    placeholder:text-[#9CA3AF]
                    focus:border-[#FF5A00]
                    focus:ring-2
                    focus:ring-[#FF5A00]/10
                  "
                />
              </div>
            </div>

            {/* Email */}
            <div className="mt-4">
              <label
                htmlFor="email"
                className="mb-2 block text-[12px] font-medium text-[#374151]"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  strokeWidth={1.8}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#9CA3AF]
                  "
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="
                    h-[50px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    pl-11
                    pr-4
                    text-[13px]
                    text-[#111827]
                    outline-none
                    transition
                    placeholder:text-[#9CA3AF]
                    focus:border-[#FF5A00]
                    focus:ring-2
                    focus:ring-[#FF5A00]/10
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div className="mt-4">
              <label
                htmlFor="password"
                className="mb-2 block text-[12px] font-medium text-[#374151]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="
                    h-[50px]
                    w-full
                    rounded-[12px]
                    border
                    border-[#E5E7EB]
                    bg-white
                    px-4
                    pr-12
                    text-[13px]
                    text-[#111827]
                    outline-none
                    transition
                    placeholder:text-[#9CA3AF]
                    focus:border-[#FF5A00]
                    focus:ring-2
                    focus:ring-[#FF5A00]/10
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-9
                    w-9
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    text-[#9CA3AF]
                    hover:bg-[#F3F4F6]
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="mt-5 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) =>
                  setAcceptedTerms(e.target.checked)
                }
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  accent-[#FF5A00]
                "
              />

              <span className="text-[11px] leading-5 text-[#6B7280]">
                I agree to the{" "}
                <button
                  type="button"
                  className="font-medium text-[#FF5A00]"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-medium text-[#FF5A00]"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Bottom area */}
            <div className="mt-auto pb-8 pt-7">
              <button
                type="submit"
                disabled={!acceptedTerms || loading}
                className="
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[12px]
                  bg-[#FF5A00]
                  text-[14px]
                  font-semibold
                  text-white
                  shadow-[0_6px_18px_rgba(255,90,0,0.20)]
                  transition
                  hover:bg-[#E64A00]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:bg-[#FDBA8C]
                  disabled:shadow-none
                "
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>


              <p className="mt-4 text-center text-[12px] text-[#6B7280]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/customer/login")}
                  className="font-semibold text-[#FF5A00]"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
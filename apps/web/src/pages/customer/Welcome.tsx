import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[720px] bg-white sm:rounded-[32px] shadow-xl overflow-hidden flex flex-col">

        {/* Hero Section */}
        <div className="relative bg-[#087F7A] px-6 pt-12 pb-10 rounded-b-[38px] overflow-hidden">

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative z-10">

            {/* Logo */}
            <div className="mb-7">
              <BrandLogo size="sm" />
            </div>

            <p className="text-white/70 text-sm font-medium mb-2">
              Welcome to
            </p>

            <h1 className="text-4xl font-bold text-white tracking-tight">
              ShramiGo
            </h1>

            <p className="text-white/85 text-sm leading-6 mt-4 max-w-[310px]">
              A trusted platform connecting customers with skilled local
              professionals.
            </p>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 pt-8">

          <h2 className="text-xl font-bold text-gray-900">
            One platform. Two possibilities.
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-5">
            Whether you need a service or want to offer your skills, ShramiGo
            connects you with the right people.
          </p>

          {/* Customer / Worker preview */}
          <div className="grid grid-cols-2 gap-3 mt-7">

            {/* Customer */}
            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4">
                <Search
                  size={20}
                  className="text-[#FF5A00]"
                />
              </div>

              <h3 className="font-bold text-gray-900 text-sm">
                Need a Service?
              </h3>

              <p className="text-xs text-gray-500 leading-5 mt-1">
                Find trusted professionals near you.
              </p>
            </div>

            {/* Worker */}
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4">
                <BriefcaseBusiness
                  size={20}
                  className="text-[#087F7A]"
                />
              </div>

              <h3 className="font-bold text-gray-900 text-sm">
                Offer Your Skills
              </h3>

              <p className="text-xs text-gray-500 leading-5 mt-1">
                Find jobs and grow your work.
              </p>
            </div>

          </div>

          {/* Trust points */}
          <div className="mt-7 space-y-3">

            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#087F7A] shrink-0"
              />
              <span className="text-sm text-gray-600">
                Verified local professionals
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck
                size={18}
                className="text-[#087F7A] shrink-0"
              />
              <span className="text-sm text-gray-600">
                Safe and trusted connections
              </span>
            </div>

          </div>

        </div>

        {/* Bottom Action */}
        <div className="px-6 pb-8 pt-7">

          <button
            onClick={() => navigate("/role-selection")}
            className="w-full h-14 rounded-2xl bg-[#FF5A00] hover:bg-[#e95000] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={19} />
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Choose your role to continue
          </p>

        </div>

      </div>
    </div>
  );
}
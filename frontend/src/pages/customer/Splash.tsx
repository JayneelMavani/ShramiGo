import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Handshake, ShieldCheck, Users } from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[720px] bg-white sm:rounded-[32px] overflow-hidden shadow-xl flex flex-col">

        {/* Main Splash Area */}
        <div className="relative flex-1 bg-[#087F7A] flex flex-col items-center justify-center px-6 overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5" />

          <div className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-white/5" />

          <div className="absolute top-1/3 -left-16 w-32 h-32 rounded-full bg-[#FF5A00]/10" />

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center">

            <div className="mb-7 shadow-2xl">
              <BrandLogo size="lg" />
            </div>

            {/* Brand */}
            <h1 className="text-4xl font-bold tracking-tight text-white">
              ShramiGo
            </h1>

            <p className="text-white/80 text-center text-sm mt-3">
              Connecting people. Empowering work.
            </p>

            <p className="text-white/60 text-center text-xs mt-2">
              Your trusted platform for local services
            </p>
          </div>

          {/* Loading indicator */}
          <div className="absolute bottom-9 left-0 right-0 flex flex-col items-center">

            <div className="flex gap-1.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />

              <span
                className="w-2 h-2 rounded-full bg-white animate-pulse"
                style={{ animationDelay: "150ms" }}
              />

              <span
                className="w-2 h-2 rounded-full bg-white animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </div>

            <p className="text-white/60 text-xs">
              Getting things ready...
            </p>

          </div>
        </div>

        {/* Bottom Information */}
        <div className="bg-white px-6 py-7">

          <div className="grid grid-cols-3 gap-3">

            {/* Customers */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-2">
                <Users
                  size={19}
                  className="text-[#FF5A00]"
                />
              </div>

              <p className="text-[11px] font-semibold text-gray-800">
                Find Services
              </p>
            </div>

            {/* Workers */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
                <Handshake
                  size={19}
                  className="text-[#087F7A]"
                />
              </div>

              <p className="text-[11px] font-semibold text-gray-800">
                Find Work
              </p>
            </div>

            {/* Trust */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-2">
                <ShieldCheck
                  size={19}
                  className="text-green-600"
                />
              </div>

              <p className="text-[11px] font-semibold text-gray-800">
                Trusted
              </p>
            </div>

          </div>

          <p className="text-center text-[10px] text-gray-400 mt-6">
            Empowering communities through local services
          </p>

        </div>
      </div>
    </div>
  );
}
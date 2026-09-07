import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";

type Role = "customer" | "worker";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("customer");

  const handleContinue = () => {
    if (selectedRole === "customer") {
      navigate("/customer/login");
    } else {
      navigate("/worker/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[760px] bg-white sm:rounded-[32px] shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 pt-10 pb-7">
          <div className="flex items-center gap-3 mb-8">
            <BrandLogo size="sm" />

            <div>
              <p className="text-xs text-gray-400 font-medium">
                Welcome to
              </p>

              <h1 className="text-lg font-bold text-gray-900">
                ShramiGo
              </h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            How would you like
            <br />
            to use ShramiGo?
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-5">
            Select your role to get started with the right experience.
          </p>
        </div>

        {/* Role Cards */}
        <div className="px-6 flex-1">

          {/* ================= CUSTOMER ================= */}
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`w-full text-left rounded-3xl p-5 border-2 transition-all ${
              selectedRole === "customer"
                ? "border-[#FF5A00] bg-orange-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className="flex items-start gap-4">

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  selectedRole === "customer"
                    ? "bg-[#FF5A00]"
                    : "bg-orange-50"
                }`}
              >
                <Search
                  size={25}
                  className={
                    selectedRole === "customer"
                      ? "text-white"
                      : "text-[#FF5A00]"
                  }
                  strokeWidth={2.2}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">

                  <h3 className="font-bold text-gray-900">
                    I'm a Customer
                  </h3>

                  {selectedRole === "customer" && (
                    <CheckCircle2
                      size={21}
                      className="text-[#FF5A00] shrink-0"
                      fill="currentColor"
                      stroke="white"
                    />
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-5 mt-1">
                  Find trusted professionals for your household and
                  community services.
                </p>
              </div>
            </div>

            {selectedRole === "customer" && (
              <div className="mt-4 pt-4 border-t border-orange-100 flex items-center gap-2">
                <MapPin
                  size={15}
                  className="text-[#FF5A00]"
                />

                <span className="text-xs text-gray-600">
                  Discover skilled workers near you
                </span>
              </div>
            )}
          </button>

          {/* ================= WORKER ================= */}
          <button
            type="button"
            onClick={() => setSelectedRole("worker")}
            className={`w-full text-left rounded-3xl p-5 border-2 transition-all mt-4 ${
              selectedRole === "worker"
                ? "border-[#087F7A] bg-teal-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className="flex items-start gap-4">

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  selectedRole === "worker"
                    ? "bg-[#087F7A]"
                    : "bg-teal-50"
                }`}
              >
                <BriefcaseBusiness
                  size={25}
                  className={
                    selectedRole === "worker"
                      ? "text-white"
                      : "text-[#087F7A]"
                  }
                  strokeWidth={2.2}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">

                  <h3 className="font-bold text-gray-900">
                    I'm a Worker
                  </h3>

                  {selectedRole === "worker" && (
                    <CheckCircle2
                      size={21}
                      className="text-[#087F7A] shrink-0"
                      fill="currentColor"
                      stroke="white"
                    />
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-5 mt-1">
                  Offer your skills, find nearby jobs and grow your
                  professional network.
                </p>
              </div>
            </div>

            {selectedRole === "worker" && (
              <div className="mt-4 pt-4 border-t border-teal-100 flex items-center gap-2">
                <BriefcaseBusiness
                  size={15}
                  className="text-[#087F7A]"
                />

                <span className="text-xs text-gray-600">
                  Find work and earn on your terms
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Bottom */}
        <div className="px-6 pb-8 pt-7">

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className={`w-full h-14 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
              selectedRole === "customer"
                ? "bg-[#FF5A00] hover:bg-[#e95000] shadow-orange-200"
                : "bg-[#087F7A] hover:bg-[#066c68] shadow-teal-200"
            }`}
          >
            Continue as{" "}
            {selectedRole === "customer"
              ? "Customer"
              : "Worker"}

            <ArrowRight size={19} />
          </button>

          {/* Admin Portal */}
          <div className="mt-6 pt-5 border-t border-gray-100">

            <div className="flex items-center justify-center gap-2">
              <ShieldCheck
                size={15}
                className="text-gray-400"
                strokeWidth={2}
              />

              <span className="text-[11px] text-gray-400">
                Platform administrator?
              </span>

              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="text-[11px] font-semibold text-[#087F7A] hover:text-[#066c68] hover:underline transition-colors"
              >
                Admin Portal
              </button>
            </div>
          </div>

          {/* Role Information */}
          <p className="text-center text-[11px] text-gray-400 mt-4">
            You can change your role by returning to this screen.
          </p>

        </div>
      </div>
    </div>
  );
}
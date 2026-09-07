import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  HeartHandshake,
  IndianRupee,
  ShieldCheck,
  Stethoscope,
  Umbrella,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: Stethoscope,
    title: "Health Support",
    description: "Access affordable health and medical support.",
    color: "text-red-500 bg-red-50",
  },
  {
    icon: ShieldCheck,
    title: "Accident Protection",
    description: "Protection support for work-related accidents.",
    color: "text-[#087F7A] bg-teal-50",
  },
  {
    icon: Umbrella,
    title: "Emergency Assistance",
    description: "Financial support during eligible emergencies.",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: Users,
    title: "Worker Community",
    description: "Connect with other workers and share experiences.",
    color: "text-purple-500 bg-purple-50",
  },
];

export default function Welfare() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#F7F8F8]">

        {/* Header */}
        <div className="bg-[#087F7A] px-5 pt-7 pb-8 rounded-b-[32px] text-white">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/worker")}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <p className="text-xs text-white/60">
                ShramiGo Worker
              </p>

              <h1 className="text-xl font-bold mt-1">
                Welfare & Benefits
              </h1>
            </div>

          </div>

          {/* Hero */}
          <div className="mt-7 flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
              <HeartHandshake
                size={28}
                className="text-[#FF5A00]"
              />
            </div>

            <div>
              <h2 className="text-base font-bold">
                Your work. Your security.
              </h2>

              <p className="text-[11px] text-white/65 mt-1 leading-5">
                Explore benefits and support available to workers.
              </p>
            </div>

          </div>

        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-10">

          {/* Welfare status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <ShieldCheck
                  size={20}
                  className="text-green-600"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">
                  Worker protection
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  Your welfare profile is active
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
                Active
              </span>

            </div>

          </div>

          {/* Benefits */}
          <div className="mt-7">

            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Available benefits
              </h2>

              <p className="text-[11px] text-gray-400 mt-1">
                Support designed for ShramiGo workers
              </p>
            </div>

            <div className="space-y-3">

              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <button
                    key={benefit.title}
                    type="button"
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 text-left"
                  >

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${benefit.color}`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {benefit.title}
                      </p>

                      <p className="text-[10px] text-gray-400 leading-4 mt-1">
                        {benefit.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="text-gray-400"
                    />

                  </button>
                );
              })}

            </div>

          </div>

          {/* Financial support */}
          <div className="mt-7">

            <h2 className="text-base font-bold text-gray-900 mb-3">
              Financial support
            </h2>

            <div className="bg-[#FF5A00] rounded-2xl p-5 text-white">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <IndianRupee size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    Emergency fund
                  </p>

                  <p className="text-[10px] text-white/70 mt-1">
                    Learn about available financial assistance
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="w-full h-10 mt-5 rounded-xl bg-white text-[#FF5A00] text-xs font-bold"
              >
                Explore Support
              </button>

            </div>

          </div>

          {/* Documents */}
          <div className="mt-7">

            <h2 className="text-base font-bold text-gray-900 mb-3">
              Important resources
            </h2>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              <ResourceRow
                icon={<FileText size={18} />}
                title="Worker benefits guide"
                subtitle="Learn about available welfare programs"
              />

              <ResourceRow
                icon={<CircleHelp size={18} />}
                title="Frequently asked questions"
                subtitle="Find answers about worker benefits"
                last
              />

            </div>

          </div>

          {/* Help */}
          <div className="mt-5 bg-teal-50 rounded-2xl p-4">

            <div className="flex items-start gap-3">

              <HeartHandshake
                size={19}
                className="text-[#087F7A] mt-0.5"
              />

              <div>
                <p className="text-xs font-bold text-[#087F7A]">
                  Need help?
                </p>

                <p className="text-[10px] text-[#087F7A]/70 mt-1 leading-4">
                  Contact ShramiGo support if you need assistance
                  with any welfare benefit.
                </p>

                <button
                  type="button"
                  className="text-[10px] font-bold text-[#087F7A] mt-2"
                >
                  Contact Support →
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

function ResourceRow({
  icon,
  title,
  subtitle,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 p-4 text-left ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">
          {title}
        </p>

        <p className="text-[10px] text-gray-400 mt-1">
          {subtitle}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="text-gray-400"
      />
    </button>
  );
}
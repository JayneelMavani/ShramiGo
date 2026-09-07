import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  HelpCircle,
  Home,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { BottomNavigation } from "../../components/navigation/BottomNavigation";

export default function CustomerPages() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Find a Worker",
      subtitle: "Search trusted workers",
      icon: Search,
      path: "/customer/search",
      color: "orange",
    },
    {
      title: "AI Recommendations",
      subtitle: "Get smart suggestions",
      icon: Sparkles,
      path: "/customer/recommendations",
      color: "teal",
    },
    {
      title: "My Bookings",
      subtitle: "Track your services",
      icon: CalendarDays,
      path: "/customer/bookings",
      color: "orange",
    },
    {
      title: "My Profile",
      subtitle: "Manage your account",
      icon: User,
      path: "/customer/profile",
      color: "teal",
    },
  ];

  const services = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "Cleaner",
    "AC Repair",
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-[#171717]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-white shadow-sm">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F8F8]"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-bold">Customer</h1>

          <button
            onClick={() => navigate("/customer/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1E8] text-[#FF5A00]"
          >
            <User size={19} />
          </button>
        </header>

        <main className="px-5 pb-8 pt-5">
          {/* Welcome */}
          <section className="rounded-3xl bg-gradient-to-br from-[#FFF2E8] to-white p-5">
            <p className="text-xs font-medium text-gray-500">
              Welcome back 👋
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              What service do you need?
            </h2>

            <p className="mt-2 text-sm leading-5 text-gray-500">
              Find reliable local workers for your household and community
              services.
            </p>

            <button
              onClick={() => navigate("/customer/search")}
              className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
            >
              <Search size={19} className="text-[#FF5A00]" />

              <span className="flex-1 text-sm text-gray-400">
                Search for a service...
              </span>

              <ChevronRight size={17} className="text-gray-400" />
            </button>
          </section>

          {/* Location */}
          <button className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E9F7F6] text-[#087F7A]">
              <MapPin size={18} />
            </div>

            <div className="flex-1">
              <p className="text-[10px] text-gray-400">Your location</p>
              <p className="mt-0.5 text-sm font-semibold">
                Set your service location
              </p>
            </div>

            <ChevronRight size={17} className="text-gray-400" />
          </button>

          {/* Quick Actions */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((item) => {
                const Icon = item.icon;
                const isOrange = item.color === "orange";

                return (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isOrange
                          ? "bg-[#FFF1E8] text-[#FF5A00]"
                          : "bg-[#E9F7F6] text-[#087F7A]"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <h4 className="mt-3 text-sm font-bold">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      {item.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Popular Services */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Popular Services</h3>

              <button
                onClick={() => navigate("/customer/services")}
                className="text-xs font-semibold text-[#FF5A00]"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {services.map((service, index) => (
                <button
                  key={service}
                  onClick={() => navigate("/customer/search")}
                  className="rounded-2xl bg-[#F7F8F8] p-3 text-center"
                >
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      index % 2 === 0
                        ? "bg-[#FFF1E8] text-[#FF5A00]"
                        : "bg-[#E9F7F6] text-[#087F7A]"
                    }`}
                  >
                    {service.charAt(0)}
                  </div>

                  <p className="mt-2 text-[10px] font-semibold">
                    {service}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Trust Card */}
          <section className="mt-7 rounded-2xl bg-[#087F7A] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  Trusted by the community
                </h3>

                <p className="mt-1 text-[10px] text-white/75">
                  Verified workers • Secure payments • Easy booking
                </p>
              </div>
            </div>
          </section>

          {/* More */}
          <section className="mt-7">
            <h3 className="mb-3 text-base font-bold">More</h3>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <button className="flex w-full items-center gap-4 border-b border-gray-100 p-4 text-left">
                <HelpCircle size={19} className="text-gray-600" />

                <span className="flex-1 text-sm font-medium">
                  Help & Support
                </span>

                <ChevronRight size={17} className="text-gray-400" />
              </button>

              <button className="flex w-full items-center gap-4 border-b border-gray-100 p-4 text-left">
                <Settings size={19} className="text-gray-600" />

                <span className="flex-1 text-sm font-medium">
                  Settings
                </span>

                <ChevronRight size={17} className="text-gray-400" />
              </button>

              <button className="flex w-full items-center gap-4 p-4 text-left">
                <Wallet size={19} className="text-gray-600" />

                <span className="flex-1 text-sm font-medium">
                  Payments & Wallet
                </span>

                <ChevronRight size={17} className="text-gray-400" />
              </button>
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation role="customer" />
      </div>
    </div>
  );
}

export { CustomerPages as CustomerPage };
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ==================== COMMON / CUSTOMER FLOW ====================
import Splash from "./pages/customer/Splash";
import Welcome from "./pages/customer/Welcome";
import RoleSelection from "./pages/customer/RoleSelection";

// ==================== CUSTOMER ====================
import CustomerLogin from "./pages/customer/Login";
import CustomerRegister from "./pages/customer/Register";
import CustomerHome from "./pages/customer/Home";
import CustomerServices from "./pages/customer/Services";
import SearchWorkers from "./pages/customer/SearchWorkers";
import WorkerDetails from "./pages/customer/WorkerDetails";
import BookService from "./pages/customer/BookService";
import Payment from "./pages/customer/Payment";
import BookingConfirmation from "./pages/customer/BookingConfirmation";
import BookingTracking from "./pages/customer/BookingTracking";
import BookingHistory from "./pages/customer/BookingHistory";
import CustomerProfile from "./pages/customer/Profile";
import AIRecommendation from "./pages/customer/AIRecommendations";
import Invoice from "./pages/customer/Invoice";
import Rating from "./pages/customer/Rating";
import CustomerPages from "./pages/customer/CustomerPages";
import CustomerNotifications from "./pages/customer/Notification";

// ==================== WORKER ====================
import WorkerPages from "./pages/worker/WorkerPages";
import WorkerNotifications from "./pages/worker/Notification";

// ==================== ADMIN ====================
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminWorkers from "./pages/Admin/Workers";
import AdminBookings from "./pages/Admin/Bookings";
import AdminReports from "./pages/Admin/Reports";
import AdminNotifications from "./pages/Admin/Notifications";
import AdminServices from "./pages/Admin/Services";
import AdminPayments from "./pages/Admin/Payments";
import AdminReviews from "./pages/Admin/Reviews";
import AdminSettings from "./pages/Admin/Settings";
import AdminDeleteUsers from "./pages/Admin/DeleteUsers";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { PWAInstallPrompt } from "./components/common/PWAInstallPrompt";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            COMMON APP FLOW
           ===================================================== */}

        {/* App Splash */}
        <Route path="/" element={<Splash />} />

        {/* Welcome */}
        <Route path="/welcome" element={<Welcome />} />

        {/* Customer / Worker selection */}
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* =====================================================
            CUSTOMER ROUTES
           ===================================================== */}

        {/* Authentication */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />

        {/* Main Customer Pages */}
        <Route path="/customer" element={<ProtectedRoute roles={["customer"]}><CustomerHome /></ProtectedRoute>} />
        <Route path="/customer/services" element={<ProtectedRoute roles={["customer"]}><CustomerServices /></ProtectedRoute>} />
        <Route path="/customer/search" element={<ProtectedRoute roles={["customer"]}><SearchWorkers /></ProtectedRoute>} />
        <Route
          path="/customer/worker/:id"
          element={<ProtectedRoute roles={["customer"]}><WorkerDetails /></ProtectedRoute>}
        />

        {/* Booking Flow */}
        <Route
          path="/customer/book-service/:id"
          element={<ProtectedRoute roles={["customer"]}><BookService /></ProtectedRoute>}
        />

        <Route
          path="/customer/payment/:id"
          element={<ProtectedRoute roles={["customer"]}><Payment /></ProtectedRoute>}
        />

        <Route
          path="/customer/booking-confirmation"
          element={<ProtectedRoute roles={["customer"]}><BookingConfirmation /></ProtectedRoute>}
        />

        <Route
          path="/customer/booking-tracking"
          element={<ProtectedRoute roles={["customer"]}><BookingTracking /></ProtectedRoute>}
        />

        <Route
          path="/customer/bookings"
          element={<ProtectedRoute roles={["customer"]}><BookingHistory /></ProtectedRoute>}
        />

        {/* Customer Profile */}
        <Route
          path="/customer/profile"
          element={<ProtectedRoute roles={["customer"]}><CustomerProfile /></ProtectedRoute>}
        />

        {/* AI Recommendation */}
        <Route
          path="/customer/recommendations"
          element={<ProtectedRoute roles={["customer"]}><AIRecommendation /></ProtectedRoute>}
        />

        {/* Invoice */}
        <Route
          path="/customer/invoice"
          element={<ProtectedRoute roles={["customer"]}><Invoice /></ProtectedRoute>}
        />

        {/* Rating */}
        <Route
          path="/customer/rating"
          element={<ProtectedRoute roles={["customer"]}><Rating /></ProtectedRoute>}
        />

        {/* Customer route aggregator if needed */}
        <Route
          path="/customer/pages/*"
          element={<ProtectedRoute roles={["customer"]}><CustomerPages /></ProtectedRoute>}
        />

        <Route
          path="/customer/notifications"
          element={<ProtectedRoute roles={["customer"]}><CustomerNotifications /></ProtectedRoute>}
        />

        {/* =====================================================
            WORKER ROUTES
           
            WorkerPages handles:
            /worker/login
            /worker/register
            /worker/skills
            /worker/availability
            /worker
            /worker/job-requests
            /worker/job-details/:id
            /worker/active-job/:id
            /worker/earnings
            /worker/profile
            /worker/welfare
           ===================================================== */}

        <Route
          path="/worker/*"
          element={<WorkerPages />}
        />

        {/* =====================================================
            ADMIN ROUTES
           
            Admin is intentionally separate from public
            Customer / Worker role selection.
           ===================================================== */}

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
        />

        {/* Admin Users */}
        <Route
          path="/admin/users"
          element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>}
        />

        {/* Admin Workers */}
        <Route
          path="/admin/workers"
          element={<ProtectedRoute roles={["admin"]}><AdminWorkers /></ProtectedRoute>}
        />

        {/* Admin Bookings */}
        <Route
          path="/admin/bookings"
          element={<ProtectedRoute roles={["admin"]}><AdminBookings /></ProtectedRoute>}
        />

        {/* Admin Reports */}
        <Route
          path="/admin/reports"
          element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>}
        />

        <Route
          path="/admin/notifications"
          element={<ProtectedRoute roles={["admin"]}><AdminNotifications /></ProtectedRoute>}
        />

        {/* Admin Services */}
        <Route
          path="/admin/services"
          element={<ProtectedRoute roles={["admin"]}><AdminServices /></ProtectedRoute>}
        />

        {/* Admin Payments */}
        <Route
          path="/admin/payments"
          element={<ProtectedRoute roles={["admin"]}><AdminPayments /></ProtectedRoute>}
        />

        {/* Admin Reviews */}
        <Route
          path="/admin/reviews"
          element={<ProtectedRoute roles={["admin"]}><AdminReviews /></ProtectedRoute>}
        />

        {/* Admin Settings */}
        <Route
          path="/admin/settings"
          element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>}
        />

        {/* Admin Delete Users */}
        <Route
          path="/admin/delete-users"
          element={<ProtectedRoute roles={["admin"]}><AdminDeleteUsers /></ProtectedRoute>}
        />

        {/* =====================================================
            FALLBACK
           ===================================================== */}

        {/* Any unknown URL → Root / Splash */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
      <PWAInstallPrompt />
    </BrowserRouter>
  );
}
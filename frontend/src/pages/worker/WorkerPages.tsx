import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Skills from "./Skills";
import Availability from "./Availability";
import Dashboard from "./Dashboard";
import JobRequests from "./JobRequests";
import JobDetails from "./JobDetails";
import ActiveJob from "./ActiveJob";
import Earnings from "./Earnings";
import Profile from "./Profile";
import Welfare from "./Welfare";
import Notifications from "./Notification";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

function WorkerOnly({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={["worker"]}>{children}</ProtectedRoute>;
}

export default function WorkerPages() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Worker onboarding */}
      <Route path="skills" element={<WorkerOnly><Skills /></WorkerOnly>} />
      <Route path="availability" element={<WorkerOnly><Availability /></WorkerOnly>} />

      {/* Main worker app */}
      <Route path="" element={<WorkerOnly><Dashboard /></WorkerOnly>} />
      <Route path="job-requests" element={<WorkerOnly><JobRequests /></WorkerOnly>} />
      <Route path="job-details/:id" element={<WorkerOnly><JobDetails /></WorkerOnly>} />
      <Route path="active-job/:id" element={<WorkerOnly><ActiveJob /></WorkerOnly>} />
      <Route path="earnings" element={<WorkerOnly><Earnings /></WorkerOnly>} />
      <Route path="profile" element={<WorkerOnly><Profile /></WorkerOnly>} />
      <Route path="welfare" element={<WorkerOnly><Welfare /></WorkerOnly>} />
      <Route path="notifications" element={<WorkerOnly><Notifications /></WorkerOnly>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/worker" replace />} />
    </Routes>
  );
}
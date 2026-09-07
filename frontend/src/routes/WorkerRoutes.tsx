import { Route } from 'react-router-dom'
import { WorkerLayout } from '../layouts/WorkerLayout'
import Login from '../pages/worker/Login'
import Register from '../pages/worker/Register'
import Skills from '../pages/worker/Skills'
import Availability from '../pages/worker/Availability'
import ActiveJob from '../pages/worker/ActiveJob'
import Dashboard from '../pages/worker/Dashboard'
import Earnings from '../pages/worker/Earnings'
import JobRequests from '../pages/worker/JobRequests'
import JobDetails from '../pages/worker/JobDetails'
import Profile from '../pages/worker/Profile'
import Welfare from '../pages/worker/Welfare'

export function WorkerRoutes() {
  return <Route path="/worker" element={<WorkerLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="jobs" element={<JobRequests />} />
    <Route path="jobs/:id" element={<JobDetails />} />
    <Route path="active-job/:id" element={<ActiveJob />} />
    <Route path="earnings" element={<Earnings />} />
    <Route path="profile" element={<Profile />} />
    <Route path="skills" element={<Skills />} />
    <Route path="availability" element={<Availability />} />
    <Route path="welfare" element={<Welfare />} />
  </Route>
}

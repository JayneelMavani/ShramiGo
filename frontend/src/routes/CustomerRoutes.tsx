import { Route } from 'react-router-dom'
import { PlaceholderPage } from '../components/common/PlaceholderPage'
import { CustomerLayout } from '../layouts/CustomerLayout'
import AIRecommendation from '../pages/customer/AIRecommendations'
import BookService from '../pages/customer/BookService'
import BookingConfirmation from '../pages/customer/BookingConfirmation'
import BookingHistory from '../pages/customer/BookingHistory'
import Home from '../pages/customer/Home'
import Invoice from '../pages/customer/Invoice'
import Login from '../pages/customer/Login'
import Payment from '../pages/customer/Payment'
import Rating from '../pages/customer/Rating'
import BookingTracking from '../pages/customer/BookingTracking'
import CustomerPages from '../pages/customer/CustomerPages'
import Profile from '../pages/customer/Profile'
import Register from '../pages/customer/Register'
import SearchWorkers from '../pages/customer/SearchWorkers'
import Services from '../pages/customer/Services'
import WorkerDetails from '../pages/customer/WorkerDetails'

export function CustomerRoutes() {
  return <Route path="/customer" element={<CustomerLayout />}>
    <Route index element={<Home />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="services" element={<Services />} />
    <Route path="search" element={<SearchWorkers />} />
    <Route path="recommendations" element={<AIRecommendation />} />
    <Route path="pages" element={<CustomerPages />} />
    <Route path="worker/:id" element={<WorkerDetails />} />
    <Route path="book" element={<BookService />} />
    <Route path="booking/:id" element={<BookingConfirmation />} />
    <Route path="tracking/:id" element={<BookingTracking />} />
    <Route path="payment/:id" element={<Payment />} />
    <Route path="invoice/:id" element={<Invoice />} />
    <Route path="rating/:id" element={<Rating />} />
    <Route path="bookings" element={<BookingHistory />} />
    <Route path="profile" element={<Profile />} />
  </Route>
}

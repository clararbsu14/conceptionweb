import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Client pages
import HomePage from './pages/HomePage'
import VehiclesPage from './pages/VehiclesPage'
import ReservationPage from './pages/ReservationPage'
import ConfirmationPage from './pages/ConfirmationPage'
import ManageReservationPage from './pages/ManageReservationPage'
import InvoicePage from './pages/InvoicePage'

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminFleetPage from './pages/admin/AdminFleetPage'
import AdminAlertsPage from './pages/admin/AdminAlertsPage'

// Client layout wrapper
function ClientLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Client routes ── */}
          <Route path="/" element={
            <ClientLayout><HomePage /></ClientLayout>
          } />
          <Route path="/vehicules" element={
            <ClientLayout><VehiclesPage /></ClientLayout>
          } />
          <Route path="/reservation/:vehicleId" element={
            <ClientLayout><ReservationPage /></ClientLayout>
          } />
          <Route path="/confirmation/:id" element={
            <ClientLayout><ConfirmationPage /></ClientLayout>
          } />
          <Route path="/ma-reservation" element={
            <ClientLayout><ManageReservationPage /></ClientLayout>
          } />
          <Route path="/facture/:id" element={
            <ClientLayout><InvoicePage /></ClientLayout>
          } />

          {/* ── Admin login (no auth) ── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ── Admin protected routes ── */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vehicules" element={<AdminVehiclesPage />} />
            <Route path="reservations" element={<AdminBookingsPage />} />
            <Route path="flotte" element={<AdminFleetPage />} />
            <Route path="alertes" element={<AdminAlertsPage />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={
            <ClientLayout>
              <div className="flex-1 flex items-center justify-center text-center px-4 py-20">
                <div>
                  <p className="text-7xl font-black text-primary mb-4">404</p>
                  <h1 className="text-2xl font-black text-dark mb-2">Page introuvable</h1>
                  <p className="text-gray-500 text-sm mb-6">La page que vous cherchez n'existe pas.</p>
                  <a href="/" className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg text-sm inline-block">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            </ClientLayout>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

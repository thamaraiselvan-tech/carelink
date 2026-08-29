import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Background3D from './components/layout/Background3D';
import AshaDashboard from './pages/asha/AshaDashboard';
import PatientProfile from './pages/asha/PatientProfile';
import TriageFlow from './pages/asha/TriageFlow';
import CreateReferral from './pages/asha/CreateReferral';
import ReferralTracker from './pages/asha/ReferralTracker';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReferralDetail from './pages/doctor/ReferralDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import KioskPage from './pages/kiosk/KioskPage';
import PatientPortal from './pages/patient/PatientPortal';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Background3D />
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <Routes>
            {/* ASHA Routes */}
            <Route path="/asha" element={<AshaDashboard />} />
            <Route path="/asha/patient/:id" element={<PatientProfile />} />
            <Route path="/asha/triage/:patientId" element={<TriageFlow />} />
            <Route path="/asha/referral/create/:patientId" element={<CreateReferral />} />
            <Route path="/asha/referrals" element={<ReferralTracker />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/referral/:id" element={<ReferralDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Default redirect based on role */}
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
          
          <div className="data-disclaimer">
            CareLink AI Prototype · Synthetic Patient & Facility Data for Demonstration Purposes.
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'asha' || user.role === 'anm') return <Navigate to="/asha" replace />;
  if (user.role === 'doctor' || user.role === 'specialist') return <Navigate to="/doctor" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/asha" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={
                <>
                  <Background3D />
                  <LoginPage />
                </>
              } />
              
              {/* Dedicated Standalone Kiosk Route */}
              <Route path="/kiosk" element={<KioskPage />} />

              {/* Dedicated Standalone Minimal Patient OPD Portal Route */}
              <Route path="/patient" element={<PatientPortal />} />

              <Route path="/*" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

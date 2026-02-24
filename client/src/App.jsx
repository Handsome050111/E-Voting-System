import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import Results from './pages/Results';
import VoterActivity from './pages/VoterActivity';
import VerifyOTP from './pages/VerifyOTP';
import AdminUsers from './pages/AdminUsers';
import Landing from './pages/Landing';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/activity" element={
            <ProtectedRoute role="admin">
              <VoterActivity />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute role="voter">
              <VoterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/results" element={<Results />} />
          <Route path="/faq" element={<InfoPage type="faq" />} />
          <Route path="/privacy" element={<InfoPage type="privacy" />} />
          <Route path="/help" element={<InfoPage type="help" />} />
          <Route path="/how-it-works" element={<InfoPage type="how-it-works" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

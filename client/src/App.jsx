// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import ProtectedRoute from './components/common/ProtectedRoute';

// import Landing from './pages/Landing';
// import Login from './pages/auth/Login';
// import UserSignup from './pages/auth/UserSignup';
// import HospitalSignup from './pages/auth/HospitalSignup';

// // Placeholder dashboards (we build these in Step 4 & 5)
// import UserDashboard from './pages/user/UserDashboard';

// import HospitalDashboard from './pages/hospital/HospitalDashboard'; 

// function AppRoutes() {
//   const { isAuthenticated, role } = useAuth();

//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
//       <Route path="/login" element={
//         isAuthenticated
//           ? <Navigate to={role === 'hospital' ? '/hospital/dashboard' : '/user/dashboard'} replace />
//           : <Login />
//       } />
//       <Route path="/signup/user" element={<UserSignup />} />
//       <Route path="/signup/hospital" element={<HospitalSignup />} />

//       <Route path="/user/dashboard" element={
//         <ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>
//       } />
//       <Route path="/hospital/dashboard" element={
//         <ProtectedRoute allowedRole="hospital"><HospitalDashboard /></ProtectedRoute>
//       } />

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <Router>
//           <Toaster position="top-right" toastOptions={{
//             style: { background: '#0f1f3d', color: '#e8f0fe', border: '1px solid rgba(0,212,170,0.2)' }
//           }} />
//         </Router>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import UserSignup from './pages/auth/UserSignup';
import HospitalSignup from './pages/auth/HospitalSignup';
import UserDashboard from './pages/user/UserDashboard';
import HospitalDashboard from './pages/hospital/HospitalDashboard';

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={role === 'hospital' ? '/hospital/dashboard' : '/user/dashboard'} replace />
          : <Login />
      } />
      <Route path="/signup/user" element={<UserSignup />} />
      <Route path="/signup/hospital" element={<HospitalSignup />} />
      <Route path="/user/dashboard" element={
        <ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>
      } />
      <Route path="/hospital/dashboard" element={
        <ProtectedRoute allowedRole="hospital"><HospitalDashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/student/Dashboard';
import Profile from '../pages/Profile';
import SubjectDetails from '../pages/student/SubjectDetails';
import SessionConfirm from '../pages/student/SessionConfirm';
import Quiz from '../pages/student/Quiz';
import Result from '../pages/student/Result';
import SessionResult from '../pages/student/SessionResult';
import ReviewAnswers from '../pages/student/ReviewAnswers';
import MyResults from '../pages/student/MyResults';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageSubjects from '../pages/admin/ManageSubjects';
import ManageQuestions from '../pages/admin/ManageQuestions';
import ManageResults from '../pages/admin/ManageResults';
import ManageUsers from '../pages/admin/ManageUsers';
import ActivityLogs from '../pages/admin/ActivityLogs';
import BootstrapChief from '../pages/admin/BootstrapChief';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleRoute from '../components/common/RoleRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/my-results" element={<ProtectedRoute><MyResults /></ProtectedRoute>} />
      <Route path="/subject/:subjectId" element={<ProtectedRoute><SubjectDetails /></ProtectedRoute>} />
      <Route path="/session/confirm" element={<ProtectedRoute><SessionConfirm /></ProtectedRoute>} />
      <Route path="/exam/:subjectId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/result/:resultId" element={<ProtectedRoute><Result /></ProtectedRoute>} />
      <Route path="/session-result" element={<ProtectedRoute><SessionResult /></ProtectedRoute>} />
      <Route path="/review/:resultId" element={<ProtectedRoute><ReviewAnswers /></ProtectedRoute>} />
      <Route
        path="/admin"
        element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'chief']}><AdminDashboard /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/subjects"
        element={<ProtectedRoute><RoleRoute allowedRoles={['chief']}><ManageSubjects /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/questions"
        element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'chief']}><ManageQuestions /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/results"
        element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'chief']}><ManageResults /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute><RoleRoute allowedRoles={['chief']}><ManageUsers /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/admin/activity"
        element={<ProtectedRoute><RoleRoute allowedRoles={['admin', 'chief']}><ActivityLogs /></RoleRoute></ProtectedRoute>}
      />
      <Route path="/bootstrap-chief" element={<ProtectedRoute><BootstrapChief /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
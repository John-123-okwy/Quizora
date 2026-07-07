import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { userProfile, currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
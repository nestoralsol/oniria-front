import { Navigate } from 'react-router-dom';

export default function RequireRole({ role, children }) {
  const current = localStorage.getItem('role');

  if (current !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

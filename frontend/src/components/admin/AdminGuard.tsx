import { Navigate } from 'react-router-dom';

/**
 * Guard component that checks if user has admin role.
 * Redirects to home page if not an admin.
 */
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const role = localStorage.getItem('user_role');
  
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminGuard;

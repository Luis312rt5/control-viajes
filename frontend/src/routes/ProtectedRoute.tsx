import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../api/types';

interface ProtectedRouteProps extends RouteProps {
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ allowedRoles, component: Component, ...rest }: ProtectedRouteProps) {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) return <Redirect to="/login" />;
        if (!allowedRoles.includes(user.role)) {
          return <Redirect to={user.role === 'admin' ? '/admin' : '/driver'} />;
        }
        if (!Component) return null;
        return <Component {...props} />;
      }}
    />
  );
}

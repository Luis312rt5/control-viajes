import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CreateTrip } from './pages/admin/CreateTrip';
import { AdminTripDetail } from './pages/admin/AdminTripDetail';
import { DriverHome } from './pages/driver/DriverHome';
import { DriverTripDetail } from './pages/driver/TripDetail';
import { TripSummary } from './pages/driver/TripSummary';
import { ScanQr } from './pages/driver/ScanQr';

/* Estilos base de Ionic (requeridos) */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Nuestro sistema de tokens — sobreescribe los defaults de Ionic */
import './theme/variables.css';

setupIonicReact({ mode: 'md' });

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={user.role === 'admin' ? '/admin' : '/driver'} />;
}

function AppRoutes() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />

        <ProtectedRoute exact path="/admin" allowedRoles={['admin']} component={AdminDashboard} />
        <ProtectedRoute exact path="/admin/nuevo-viaje" allowedRoles={['admin']} component={CreateTrip} />
        <ProtectedRoute
          exact
          path="/admin/trips/:id"
          allowedRoles={['admin']}
          component={AdminTripDetail}
        />

        <ProtectedRoute exact path="/driver" allowedRoles={['driver']} component={DriverHome} />
        <ProtectedRoute exact path="/driver/scan" allowedRoles={['driver']} component={ScanQr} />
        <ProtectedRoute
          exact
          path="/driver/trips/:id"
          allowedRoles={['driver']}
          component={DriverTripDetail}
        />
        <ProtectedRoute
          exact
          path="/driver/trips/:id/summary"
          allowedRoles={['driver']}
          component={TripSummary}
        />

        <Route exact path="/" render={() => <RootRedirect />} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
}

export function App() {
  return (
    <IonApp>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </IonApp>
  );
}

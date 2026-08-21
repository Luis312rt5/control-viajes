import { IonIcon } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  homeOutline,
  addCircleOutline,
  listOutline,
  qrCodeOutline,
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './AppTabs.css';

interface TabItem {
  label: string;
  path: string;
  icon: string;
}

// El diseño muestra una barra con las cuatro pantallas del recorrido, pero en
// la aplicación real ningún usuario las ve todas: el administrador no tiene
// "Mis viajes" y el conductor no tiene el panel. Cada rol recibe entonces sus
// propias pestañas, con la misma estructura de navegación del diseño.
const TABS_BY_ROLE: Record<string, TabItem[]> = {
  admin: [
    { label: 'Viajes', path: '/admin', icon: listOutline },
    { label: 'Nuevo', path: '/admin/nuevo-viaje', icon: addCircleOutline },
  ],
  driver: [
    { label: 'Mis viajes', path: '/driver', icon: homeOutline },
    { label: 'Escanear', path: '/driver/scan', icon: qrCodeOutline },
  ],
};

interface AppTabsProps {
  placement: 'top' | 'bottom';
}

export function AppTabs({ placement }: AppTabsProps) {
  const { user } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const tabs = user ? TABS_BY_ROLE[user.role] : undefined;
  if (!tabs) return null;

  return (
    <nav className={`app-tabs app-tabs--${placement}`}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            className={`app-tabs__tab${active ? ' app-tabs__tab--active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => history.push(tab.path)}
          >
            {placement === 'bottom' && <IonIcon icon={tab.icon} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

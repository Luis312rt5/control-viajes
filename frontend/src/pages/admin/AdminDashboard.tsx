import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { logOutOutline, addOutline } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchTrips } from '../../api/trips';
import { Trip } from '../../api/types';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { StatusBadge } from '../../components/StatusBadge';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { logout } = useAuth();
  const history = useHistory();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const load = async (page = 1) => {
    setLoading(true);
    const res = await fetchTrips(page, 10);
    setTrips(res.data);
    setMeta(res.meta);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Panel de administración</IonTitle>
          <IonButtons slot="end">
            <ThemeSwitcher />
            <IonButton onClick={logout}>
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="admin-dashboard__toolbar">
          <div>
            <h2>Viajes ({meta.total})</h2>
            <p>Supervisa el estado de todos los viajes y sus reportes.</p>
          </div>
          <IonButton onClick={() => history.push('/admin/nuevo-viaje')}>
            <IonIcon icon={addOutline} slot="start" />
            Nuevo viaje
          </IonButton>
        </div>

        {loading ? (
          <IonSpinner name="dots" />
        ) : trips.length === 0 ? (
          <p className="admin-dashboard__empty">Aún no hay viajes creados.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Ruta</th>
                <th>Conductor</th>
                <th>Pasajeros</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr
                  key={trip.id}
                  onClick={() => history.push(`/admin/trips/${trip.id}`)}
                  className="admin-table__row"
                >
                  <td className="admin-table__code">{trip.code}</td>
                  <td>
                    {trip.origin} → {trip.destination}
                  </td>
                  <td>{trip.driver?.fullName}</td>
                  <td>
                    {trip.passengers.filter((p) => p.boarded).length}/{trip.passengers.length}
                  </td>
                  <td>
                    <StatusBadge status={trip.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {meta.totalPages > 1 && (
          <div className="admin-dashboard__pagination">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <IonButton
                key={p}
                size="small"
                fill={p === meta.page ? 'solid' : 'outline'}
                onClick={() => load(p)}
              >
                {p}
              </IonButton>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}

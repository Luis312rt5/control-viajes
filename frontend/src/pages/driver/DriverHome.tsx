import { useState } from 'react';
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
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  useIonViewWillEnter,
} from '@ionic/react';
import { logOutOutline, busOutline, qrCodeOutline, chevronForward } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMyTrips } from '../../api/trips';
import { Trip } from '../../api/types';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { StatusBadge } from '../../components/StatusBadge';
import { AppTabs } from '../../components/AppTabs';
import './DriverHome.css';

export function DriverHome() {
  const { user, logout } = useAuth();
  const history = useHistory();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await fetchMyTrips();
    setTrips(data);
    setLoading(false);
  };

  // Ionic mantiene esta página viva en el stack de navegación cuando vas al
  // detalle de un viaje y volvés atrás (no la desmonta), así que un
  // useEffect(..., []) de solo montaje nunca se volvía a ejecutar al
  // regresar — por eso el estado se veía desactualizado hasta cerrar sesión
  // y volver a entrar (eso sí fuerza un montaje nuevo). useIonViewWillEnter
  // se dispara cada vez que esta vista vuelve a quedar activa, incluyendo
  // al volver atrás, así que la lista siempre recarga el estado más reciente.
  useIonViewWillEnter(() => {
    load();
  });

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await load();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis viajes</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/driver/scan')} aria-label="Escanear QR">
              <IonIcon icon={qrCodeOutline} slot="icon-only" />
            </IonButton>
            <ThemeSwitcher />
            <IonButton onClick={logout} aria-label="Cerrar sesión">
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <AppTabs placement="top" />
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="page-shell">
          <p className="driver-home__greeting">Hola, {user?.fullName?.split(' ')[0]}</p>

          {loading ? (
            <div className="driver-home__state">
              <IonSpinner name="dots" />
            </div>
          ) : trips.length === 0 ? (
            <div className="driver-home__state">
              <IonIcon icon={busOutline} />
              <p>Todavía no tienes viajes asignados.</p>
            </div>
          ) : (
            <div className="ui-card trip-list">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  className="trip-list__row"
                  onClick={() => history.push(`/driver/trips/${trip.id}`)}
                >
                  <span className="trip-list__info">
                    <span className="trip-list__code">{trip.code}</span>
                    <span className="trip-list__route">
                      {trip.origin} → {trip.destination}
                    </span>
                  </span>
                  <span className="trip-list__meta">
                    <StatusBadge status={trip.status} />
                    <IonIcon icon={chevronForward} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </IonContent>

      <AppTabs placement="bottom" />
    </IonPage>
  );
}

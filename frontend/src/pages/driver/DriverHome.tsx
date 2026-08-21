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
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  useIonViewWillEnter,
} from '@ionic/react';
import { logOutOutline, busOutline, qrCodeOutline } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMyTrips } from '../../api/trips';
import { Trip } from '../../api/types';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { StatusBadge } from '../../components/StatusBadge';
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
            <IonButton onClick={() => history.push('/driver/scan')}>
              <IonIcon icon={qrCodeOutline} slot="icon-only" />
            </IonButton>
            <ThemeSwitcher />
            <IonButton onClick={logout}>
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="driver-home__greeting">
          <p>Hola, {user?.fullName?.split(' ')[0]}</p>
        </div>

        {loading ? (
          <div className="driver-home__loading">
            <IonSpinner name="dots" />
          </div>
        ) : trips.length === 0 ? (
          <div className="driver-home__empty">
            <IonIcon icon={busOutline} />
            <p>Todavía no tienes viajes asignados.</p>
          </div>
        ) : (
          <IonList>
            {trips.map((trip) => (
              <IonItem
                key={trip.id}
                button
                detail
                onClick={() => history.push(`/driver/trips/${trip.id}`)}
              >
                <IonLabel>
                  <h2>{trip.code}</h2>
                  <p>
                    {trip.origin} → {trip.destination}
                  </p>
                </IonLabel>
                <StatusBadge status={trip.status} slot="end" />
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}

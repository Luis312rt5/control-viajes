import { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonSpinner,
  IonText,
  IonToast,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { fetchTrip, checkInPassenger, signTrip, startTrip, closeTrip } from '../../api/trips';
import { Trip } from '../../api/types';
import { extractErrorMessage } from '../../api/client';
import { SignaturePad } from '../../components/SignaturePad';
import { StatusBadge } from '../../components/StatusBadge';
import { RouteOperations } from './RouteOperations';
import './TripDetail.css';

export function DriverTripDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchTrip(id);
    setTrip(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckIn = async (passengerId: string, boarded: boolean) => {
    if (!trip) return;
    try {
      const updated = await checkInPassenger(trip.id, passengerId, boarded);
      setTrip(updated);
    } catch (err) {
      setToastMsg(extractErrorMessage(err));
    }
  };

  const handleSign = async (dataUrl: string) => {
    if (!trip) return;
    setBusy(true);
    try {
      const updated = await signTrip(trip.id, dataUrl);
      setTrip(updated);
      setToastMsg('Firma registrada correctamente');
    } catch (err) {
      setToastMsg(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async () => {
    if (!trip) return;
    setBusy(true);
    try {
      const updated = await startTrip(trip.id);
      setTrip(updated);
      setToastMsg('¡Viaje iniciado! Ya puedes reportar gastos y novedades.');
    } catch (err) {
      setToastMsg(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleClose = async () => {
    if (!trip) return;
    setBusy(true);
    try {
      await closeTrip(trip.id);
      history.push(`/driver/trips/${trip.id}/summary`);
    } catch (err) {
      setToastMsg(extractErrorMessage(err));
      setBusy(false);
    }
  };

  if (loading || !trip) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonSpinner name="dots" />
        </IonContent>
      </IonPage>
    );
  }

  const canStart = !!trip.signature && trip.status !== 'in_progress' && trip.status !== 'closed';
  const isInProgress = trip.status === 'in_progress';
  const isClosed = trip.status === 'closed';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/driver" />
          </IonButtons>
          <IonTitle>{trip.code}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="trip-detail__header">
          <div>
            <h2>
              {trip.origin} → {trip.destination}
            </h2>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        {!isInProgress && !isClosed && (
          <>
            <IonCard>
              <IonCardContent>
                <p className="trip-detail__section-title">
                  Lista de pasajeros ({trip.passengers.filter((p) => p.boarded).length}/
                  {trip.passengers.length} abordados)
                </p>
                <IonList>
                  {trip.passengers.map((p) => (
                    <IonItem key={p.id} lines="full">
                      <IonCheckbox
                        slot="start"
                        checked={p.boarded}
                        onIonChange={(e) => handleCheckIn(p.id, e.detail.checked)}
                      />
                      <IonLabel>
                        <h3>{p.name}</h3>
                        <p>{p.document}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardContent>
                {trip.signature ? (
                  <IonText color="success">
                    <p>✓ Firma capturada. El viaje puede iniciar.</p>
                  </IonText>
                ) : (
                  <SignaturePad onConfirm={handleSign} disabled={busy} />
                )}
              </IonCardContent>
            </IonCard>

            <IonButton
              expand="block"
              disabled={!canStart || busy}
              onClick={handleStart}
              className="trip-detail__start-btn"
            >
              {busy ? <IonSpinner name="dots" /> : 'Iniciar viaje'}
            </IonButton>
            {!trip.signature && (
              <p className="trip-detail__lock-note">
                El botón de arranque permanece bloqueado hasta capturar la firma digital.
              </p>
            )}
          </>
        )}

        {isInProgress && (
          <RouteOperations tripId={trip.id} onClose={handleClose} busy={busy} />
        )}

        {isClosed && (
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => history.push(`/driver/trips/${trip.id}/summary`)}
          >
            Ver resumen del viaje
          </IonButton>
        )}

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg || ''}
          duration={3000}
          onDidDismiss={() => setToastMsg(null)}
        />
      </IonContent>
    </IonPage>
  );
}

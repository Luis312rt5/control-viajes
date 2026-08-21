import { useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCheckbox,
  IonIcon,
  IonSpinner,
  IonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
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

  // useIonViewWillEnter en vez de useEffect: recarga el viaje cada vez que
  // volvés a esta pantalla (por ejemplo, tras escanear el QR de nuevo o
  // volver del resumen), no solo la primera vez que se monta.
  useIonViewWillEnter(() => {
    load();
  });

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
        <IonContent>
          <div className="ui-loading">
            <IonSpinner name="dots" />
          </div>
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
      <IonContent>
        <div className="page-shell page-shell--narrow trip-detail">
          <div className="ui-page-head">
            <div>
              <h2>
                {trip.origin} → {trip.destination}
              </h2>
              <p>
                {trip.passengers.filter((p) => p.boarded).length} de {trip.passengers.length}{' '}
                pasajeros abordados
              </p>
            </div>
            <StatusBadge status={trip.status} />
          </div>

          {!isInProgress && !isClosed && (
            <>
              <section className="ui-section">
                <p className="ui-eyebrow">Lista de pasajeros</p>
                {trip.passengers.map((p) => (
                  <div key={p.id} className="ui-row">
                    <IonCheckbox
                      className="trip-detail__passenger"
                      labelPlacement="end"
                      justify="start"
                      checked={p.boarded}
                      onIonChange={(e) => handleCheckIn(p.id, e.detail.checked)}
                    >
                      <span className="ui-row__title">{p.name}</span>
                      <span className="ui-row__sub">{p.document}</span>
                    </IonCheckbox>
                  </div>
                ))}
              </section>

              <section className="ui-section">
                {trip.signature ? (
                  <p className="trip-detail__signed">
                    <IonIcon icon={checkmarkCircle} />
                    Firma capturada. El viaje puede iniciar.
                  </p>
                ) : (
                  <SignaturePad onConfirm={handleSign} disabled={busy} />
                )}
              </section>

              <div>
                <button
                  type="button"
                  className="ui-button ui-button--block"
                  disabled={!canStart || busy}
                  onClick={handleStart}
                >
                  {busy ? <IonSpinner name="dots" /> : 'Iniciar viaje'}
                </button>
                {!trip.signature && (
                  <p className="trip-detail__lock-note">
                    El botón de arranque permanece bloqueado hasta capturar la firma digital.
                  </p>
                )}
              </div>
            </>
          )}

          {isInProgress && (
            <RouteOperations tripId={trip.id} onClose={handleClose} busy={busy} />
          )}

          {isClosed && (
            <button
              type="button"
              className="ui-button ui-button--block ui-button--ghost"
              onClick={() => history.push(`/driver/trips/${trip.id}/summary`)}
            >
              Ver resumen del viaje
            </button>
          )}
        </div>

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

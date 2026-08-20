import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { addOutline, trashOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { fetchDrivers } from '../../api/users';
import { createTrip } from '../../api/trips';
import { Driver, Trip } from '../../api/types';
import { extractErrorMessage } from '../../api/client';
import { TripQrCode } from '../../components/TripQrCode';
import { CityAutocomplete } from '../../components/CityAutocomplete';
import './CreateTrip.css';

interface PassengerRow {
  name: string;
  document: string;
}

export function CreateTrip() {
  const history = useHistory();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [driverId, setDriverId] = useState('');
  const [passengers, setPassengers] = useState<PassengerRow[]>([
    { name: '', document: '' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    fetchDrivers().then(setDrivers);
  }, []);

  const updatePassenger = (index: number, field: keyof PassengerRow, value: string) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPassenger = () => setPassengers((prev) => [...prev, { name: '', document: '' }]);

  const removePassenger = (index: number) =>
    setPassengers((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validPassengers = passengers.filter((p) => p.name && p.document);
    if (!origin || !destination || !driverId || validPassengers.length === 0) {
      setError('Completa origen, destino, conductor y al menos un pasajero.');
      return;
    }

    setSaving(true);
    try {
      const trip = await createTrip({ origin, destination, driverId, passengers: validPassengers });
      setCreatedTrip(trip);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (createdTrip) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin" />
            </IonButtons>
            <IonTitle>Viaje creado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="create-trip-success">
            <IonIcon icon={checkmarkCircleOutline} color="success" className="create-trip-success__icon" />
            <h2>{createdTrip.code} creado correctamente</h2>
            <p>Entrégale el código QR al conductor asignado para que acceda al viaje.</p>

            <TripQrCode tripId={createdTrip.id} tripCode={createdTrip.code} />

            <IonButton
              expand="block"
              fill="outline"
              className="create-trip-success__action"
              onClick={() => history.push(`/admin/trips/${createdTrip.id}`)}
            >
              Ver detalle del viaje
            </IonButton>
            <IonButton
              expand="block"
              fill="clear"
              onClick={() => history.push('/admin')}
            >
              Volver al panel
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>Nuevo viaje</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="create-trip-form">
          <div className="create-trip-form__row">
            <CityAutocomplete
              label="Origen"
              value={origin}
              onChange={setOrigin}
              placeholder="Ej: Neiva"
            />
            <CityAutocomplete
              label="Destino"
              value={destination}
              onChange={setDestination}
              placeholder="Ej: Pitalito"
            />
          </div>

          <IonItem>
            <IonLabel position="stacked">Conductor asignado</IonLabel>
            <IonSelect value={driverId} onIonChange={(e) => setDriverId(e.detail.value)}>
              {drivers.map((d) => (
                <IonSelectOption key={d.id} value={d.id}>
                  {d.fullName}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <div className="create-trip-form__passengers-header">
            <p>Pasajeros</p>
            <IonButton size="small" fill="outline" onClick={addPassenger} type="button">
              <IonIcon icon={addOutline} slot="start" />
              Agregar
            </IonButton>
          </div>

          {passengers.map((p, index) => (
            <div key={index} className="create-trip-form__passenger-row">
              <IonItem>
                <IonLabel position="stacked">Nombre</IonLabel>
                <IonInput
                  value={p.name}
                  onIonInput={(e) => updatePassenger(index, 'name', e.detail.value || '')}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Documento</IonLabel>
                <IonInput
                  value={p.document}
                  onIonInput={(e) => updatePassenger(index, 'document', e.detail.value || '')}
                />
              </IonItem>
              {passengers.length > 1 && (
                <IonButton
                  fill="clear"
                  color="danger"
                  type="button"
                  onClick={() => removePassenger(index)}
                >
                  <IonIcon icon={trashOutline} slot="icon-only" />
                </IonButton>
              )}
            </div>
          ))}

          {error && (
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
          )}

          <IonButton expand="block" type="submit" disabled={saving} className="create-trip-form__submit">
            {saving ? <IonSpinner name="dots" /> : 'Crear viaje'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}


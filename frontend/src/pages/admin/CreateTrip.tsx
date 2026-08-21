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
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { addOutline, closeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { fetchDrivers } from '../../api/users';
import { createTrip } from '../../api/trips';
import { Driver, Trip } from '../../api/types';
import { extractErrorMessage } from '../../api/client';
import { TripQrCode } from '../../components/TripQrCode';
import { CityAutocomplete } from '../../components/CityAutocomplete';
import { AppTabs } from '../../components/AppTabs';
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
          <AppTabs placement="top" />
        </IonHeader>
        <IonContent>
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

        <AppTabs placement="bottom" />
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
        <AppTabs placement="top" />
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit} className="page-shell page-shell--narrow create-trip-form">
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

          <label className="ui-field">
            <span className="ui-field__label">Conductor asignado</span>
            <select
              className="ui-select"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              <option value="">Selecciona un conductor</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="create-trip-form__passengers-header">
              <p className="ui-eyebrow">Pasajeros</p>
              <button type="button" className="ui-button ui-button--ghost" onClick={addPassenger}>
                <IonIcon icon={addOutline} />
                Agregar
              </button>
            </div>

            {passengers.map((p, index) => (
              <div key={index} className="create-trip-form__passenger-row">
                <input
                  className="ui-input"
                  value={p.name}
                  placeholder="Nombre"
                  aria-label={`Nombre del pasajero ${index + 1}`}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                />
                <input
                  className="ui-input"
                  value={p.document}
                  placeholder="Documento"
                  aria-label={`Documento del pasajero ${index + 1}`}
                  onChange={(e) => updatePassenger(index, 'document', e.target.value)}
                />
                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="create-trip-form__remove"
                    aria-label={`Quitar pasajero ${index + 1}`}
                    onClick={() => removePassenger(index)}
                  >
                    <IonIcon icon={closeOutline} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <p className="create-trip-form__error">{error}</p>}

          <button type="submit" className="ui-button ui-button--block" disabled={saving}>
            {saving ? <IonSpinner name="dots" /> : 'Crear viaje'}
          </button>
        </form>
      </IonContent>

      <AppTabs placement="bottom" />
    </IonPage>
  );
}


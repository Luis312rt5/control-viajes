import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonText,
  IonSpinner,
  useIonViewDidEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { fetchTrip } from '../../api/trips';
import { extractErrorMessage } from '../../api/client';
import './ScanQr.css';

const SCANNER_ELEMENT_ID = 'qr-reader';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ScanQr() {
  const history = useHistory();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Se usa el ciclo de vida de Ionic (en vez de useEffect en el montaje) porque
  // Ionic anima la entrada de la página: si la cámara se inicia mientras esa
  // animación todavía corre, el contenedor mide 0x0 px y el video queda en
  // blanco. "ionViewDidEnter" garantiza que la transición ya terminó.
  useIonViewDidEnter(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (!runningRef.current || checking) return;
          const tripId = decodedText.trim();

          if (!UUID_REGEX.test(tripId)) {
            setError('El código QR no corresponde a un viaje válido.');
            return;
          }

          setChecking(true);
          try {
            await scanner.stop();
            runningRef.current = false;
          } catch {
            // el escáner ya pudo haberse detenido, no es crítico
          }

          try {
            await fetchTrip(tripId);
            history.replace(`/driver/trips/${tripId}`);
          } catch (err) {
            setError(extractErrorMessage(err));
            setChecking(false);
          }
        },
        () => {
          // callback de "no se detectó QR en este frame" — se ignora, es continuo
        },
      )
      .then(() => {
        runningRef.current = true;
      })
      .catch(() => {
        setError(
          'No se pudo acceder a la cámara. Revisa los permisos de tu navegador o dispositivo.',
        );
      });
  });

  useIonViewWillLeave(() => {
    const scanner = scannerRef.current;
    if (scanner && runningRef.current) {
      scanner.stop().catch(() => {});
    }
    scanner?.clear();
    runningRef.current = false;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/driver" />
          </IonButtons>
          <IonTitle>Escanear QR del viaje</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding scan-qr-page">
        <p className="scan-qr-page__hint">
          Apunta la cámara al código QR que te entregó el administrador.
        </p>
        <div id={SCANNER_ELEMENT_ID} className="scan-qr-page__reader" />

        {checking && (
          <div className="scan-qr-page__status">
            <IonSpinner name="dots" />
            <p>Verificando viaje...</p>
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p className="scan-qr-page__error">{error}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
}

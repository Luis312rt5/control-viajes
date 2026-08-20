import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { IonButton, IonIcon } from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';
import './TripQrCode.css';

interface TripQrCodeProps {
  tripId: string;
  tripCode: string;
}

export function TripQrCode({ tripId, tripCode }: TripQrCodeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = wrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${tripCode}.png`;
    link.click();
  };

  return (
    <div className="trip-qr">
      <p className="trip-qr__hint">
        Entrégale este código QR al conductor. Al escanearlo desde la app, accede
        directo a este viaje.
      </p>
      <div className="trip-qr__canvas-wrap" ref={wrapperRef}>
        <QRCodeCanvas value={tripId} size={180} includeMargin />
      </div>
      <IonButton size="small" fill="outline" onClick={handleDownload}>
        <IonIcon icon={downloadOutline} slot="start" />
        Descargar QR
      </IonButton>
    </div>
  );
}

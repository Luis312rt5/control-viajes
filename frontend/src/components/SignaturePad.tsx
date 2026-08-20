import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { IonButton, IonIcon } from '@ionic/react';
import { refreshOutline, checkmarkOutline } from 'ionicons/icons';
import './SignaturePad.css';

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void;
  disabled?: boolean;
}

export function SignaturePad({ onConfirm, disabled }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);

  const clear = () => sigRef.current?.clear();

  const confirm = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    onConfirm(dataUrl);
  };

  return (
    <div className={`signature-pad ${disabled ? 'signature-pad--disabled' : ''}`}>
      <p className="signature-pad__hint">
        Firma del despachador/cliente para autorizar la salida
      </p>
      <div className="signature-pad__canvas-wrap">
        <SignatureCanvas
          ref={sigRef}
          penColor="var(--color-text)"
          canvasProps={{ className: 'signature-pad__canvas' }}
        />
      </div>
      <div className="signature-pad__actions">
        <IonButton fill="outline" size="small" onClick={clear} disabled={disabled}>
          <IonIcon icon={refreshOutline} slot="start" />
          Limpiar
        </IonButton>
        <IonButton size="small" onClick={confirm} disabled={disabled}>
          <IonIcon icon={checkmarkOutline} slot="start" />
          Confirmar firma
        </IonButton>
      </div>
    </div>
  );
}

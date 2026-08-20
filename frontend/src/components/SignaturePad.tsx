import { useCallback, useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { IonButton, IonIcon } from '@ionic/react';
import { refreshOutline, checkmarkOutline } from 'ionicons/icons';
import './SignaturePad.css';

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void;
  disabled?: boolean;
}

const CANVAS_HEIGHT = 180;

// Lee el color real detrás de una variable CSS (ej. "--color-text"). El
// <canvas> 2D NO entiende `var(--color-text)` como valor de strokeStyle —
// esa sintaxis solo la resuelve el motor de CSS, no el Canvas API. Al
// pasarle un color inválido, el navegador simplemente lo ignora y mantiene
// el negro por defecto: en el tema oscuro (el que usa el conductor en
// ruta) eso significa firmar en negro sobre un fondo casi negro —
// invisible, aunque el trazo sí se esté registrando.
function resolveCssColor(varName: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

export function SignaturePad({ onConfirm, disabled }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [penColor, setPenColor] = useState('#111111');

  useEffect(() => {
    setPenColor(resolveCssColor('--color-text', '#111111'));
  }, []);

  // El ancho del <canvas> se fijaba solo por CSS (width: 100%) mientras el
  // elemento <canvas> real seguía con su resolución HTML por defecto
  // (300x150). Un canvas estirado por CSS "hace zoom" sobre su propio
  // dibujo: el punto donde tocás/hacés clic ya no coincide con el punto
  // donde signature_pad dibuja, y en la práctica el trazo cae fuera del
  // área visible. Por eso medimos el contenedor real y se lo pasamos al
  // <canvas> como atributos width/height reales.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const { width } = el.getBoundingClientRect();
      if (width > 0) setCanvasWidth(Math.round(width));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clear = () => sigRef.current?.clear();

  const confirm = useCallback(() => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    onConfirm(dataUrl);
  }, [onConfirm]);

  return (
    <div className={`signature-pad ${disabled ? 'signature-pad--disabled' : ''}`}>
      <p className="signature-pad__hint">
        Firma del despachador/cliente para autorizar la salida
      </p>
      <div className="signature-pad__canvas-wrap" ref={wrapRef}>
        <SignatureCanvas
          ref={sigRef}
          penColor={penColor}
          canvasProps={{
            className: 'signature-pad__canvas',
            width: canvasWidth,
            height: CANVAS_HEIGHT,
          }}
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

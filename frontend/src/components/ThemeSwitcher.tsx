import { IonIcon, IonPopover, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { colorPaletteOutline, moonOutline, sunnyOutline, optionsOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import './ThemeSwitcher.css';

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Modo claro', icon: sunnyOutline },
  { value: 'dark', label: 'Modo oscuro', icon: moonOutline },
  { value: 'custom', label: 'Tema personalizado', icon: optionsOutline },
];

export function ThemeSwitcher() {
  const { mode, setMode, customColors, setCustomColor } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton id="theme-switcher-trigger" fill="clear" aria-label="Cambiar tema">
        <IonIcon icon={colorPaletteOutline} slot="icon-only" />
      </IonButton>
      <IonPopover
        trigger="theme-switcher-trigger"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onIonPopoverDidPresent={() => setOpen(true)}
      >
        <IonList>
          {MODE_OPTIONS.map((opt) => (
            <IonItem
              key={opt.value}
              button
              detail={false}
              onClick={() => setMode(opt.value)}
              color={mode === opt.value ? 'light' : undefined}
            >
              <IonIcon icon={opt.icon} slot="start" />
              <IonLabel>{opt.label}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        {mode === 'custom' && (
          <div className="custom-theme-panel">
            <p className="custom-theme-title">Colores personalizados</p>
            <label>
              Fondo
              <input
                type="color"
                value={customColors.bg}
                onChange={(e) => setCustomColor('bg', e.target.value)}
              />
            </label>
            <label>
              Superficie
              <input
                type="color"
                value={customColors.surface}
                onChange={(e) => setCustomColor('surface', e.target.value)}
              />
            </label>
            <label>
              Texto
              <input
                type="color"
                value={customColors.text}
                onChange={(e) => setCustomColor('text', e.target.value)}
              />
            </label>
            <label>
              Acento
              <input
                type="color"
                value={customColors.accent}
                onChange={(e) => setCustomColor('accent', e.target.value)}
              />
            </label>
          </div>
        )}
      </IonPopover>
    </>
  );
}

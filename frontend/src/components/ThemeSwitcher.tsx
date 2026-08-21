import { IonIcon, IonPopover, IonButton } from '@ionic/react';
import { moonOutline, sunnyOutline, optionsOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTheme, ThemeMode, CustomThemeColors } from '../contexts/ThemeContext';
import './ThemeSwitcher.css';

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Modo claro', icon: sunnyOutline },
  { value: 'dark', label: 'Modo oscuro', icon: moonOutline },
  { value: 'custom', label: 'Personalizado', icon: optionsOutline },
];

const COLOR_FIELDS: { key: keyof CustomThemeColors; label: string }[] = [
  { key: 'bg', label: 'Fondo' },
  { key: 'surface', label: 'Superficie' },
  { key: 'text', label: 'Texto' },
  { key: 'accent', label: 'Acento' },
];

export function ThemeSwitcher() {
  const { mode, setMode, customColors, setCustomColor } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton id="theme-switcher-trigger" fill="clear" aria-label="Cambiar tema">
        <IonIcon icon={moonOutline} slot="icon-only" />
      </IonButton>
      <IonPopover
        trigger="theme-switcher-trigger"
        className="theme-popover"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onIonPopoverDidPresent={() => setOpen(true)}
      >
        <div className="theme-panel">
          <p className="ui-eyebrow theme-panel__title">Apariencia</p>

          <div className="theme-panel__options">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`theme-panel__option${
                  mode === opt.value ? ' theme-panel__option--active' : ''
                }`}
                onClick={() => setMode(opt.value)}
              >
                <IonIcon icon={opt.icon} />
                {opt.label}
              </button>
            ))}
          </div>

          {mode === 'custom' && (
            <div className="theme-panel__colors">
              {COLOR_FIELDS.map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    type="color"
                    value={customColors[field.key]}
                    onChange={(e) => setCustomColor(field.key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </IonPopover>
    </>
  );
}

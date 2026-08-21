import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'custom';

export interface CustomThemeColors {
  bg: string;
  surface: string;
  text: string;
  accent: string;
}

const CUSTOM_VARS_MAP: Record<keyof CustomThemeColors, string> = {
  bg: '--color-bg',
  surface: '--color-surface',
  text: '--color-text',
  accent: '--color-accent',
};

const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  bg: '#14161B',
  surface: '#1D2027',
  text: '#EDEEF0',
  accent: '#F5A623',
};

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  customColors: CustomThemeColors;
  setCustomColor: (key: keyof CustomThemeColors, value: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem('themeMode');
  if (stored === 'light' || stored === 'dark' || stored === 'custom') return stored;
  return 'light';
}

function readStoredCustomColors(): CustomThemeColors {
  const raw = localStorage.getItem('customThemeColors');
  if (!raw) return DEFAULT_CUSTOM_COLORS;
  try {
    return { ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CUSTOM_COLORS;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [customColors, setCustomColors] = useState<CustomThemeColors>(readStoredCustomColors);

  const applyCustomColors = useCallback((colors: CustomThemeColors) => {
    const root = document.documentElement;
    (Object.keys(colors) as (keyof CustomThemeColors)[]).forEach((key) => {
      root.style.setProperty(CUSTOM_VARS_MAP[key], colors[key]);
    });
  }, []);

  // El tema personalizado se aplica escribiendo estilos EN LÍNEA sobre <html>
  // (root.style.setProperty). Un estilo en línea siempre gana por encima de
  // cualquier regla de la hoja de estilos, sin importar su especificidad —
  // incluida la regla ":root[data-theme='light']" / "[data-theme='dark']".
  // Por eso, al salir del modo personalizado, no basta con cambiar el
  // atributo "data-theme": si no se limpian esos estilos en línea, los
  // colores personalizados quedan "pegados" para siempre y el usuario ve
  // que claro/oscuro no cambian nada. clearCustomColors() los remueve para
  // que las reglas normales de light/dark vuelvan a tomar el control.
  const clearCustomColors = useCallback(() => {
    const root = document.documentElement;
    (Object.keys(CUSTOM_VARS_MAP) as (keyof CustomThemeColors)[]).forEach((key) => {
      root.style.removeProperty(CUSTOM_VARS_MAP[key]);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('themeMode', mode);
    if (mode === 'custom') {
      applyCustomColors(customColors);
    } else {
      clearCustomColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => setModeState(newMode), []);

  const setCustomColor = useCallback(
    (key: keyof CustomThemeColors, value: string) => {
      setCustomColors((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem('customThemeColors', JSON.stringify(next));
        if (mode === 'custom') applyCustomColors(next);
        return next;
      });
    },
    [mode, applyCustomColors],
  );

  return (
    <ThemeContext.Provider value={{ mode, setMode, customColors, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}

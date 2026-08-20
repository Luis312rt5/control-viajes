import { useEffect, useRef, useState } from 'react';
import { IonItem, IonLabel, IonInput } from '@ionic/react';
import { CITIES } from '../data/cities';
import './CityAutocomplete.css';

interface CityAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MAX_SUGGESTIONS = 8;

export function CityAutocomplete({ label, value, onChange, placeholder }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const query = value.trim().toLowerCase();
  const filtered = (
    query === '' ? CITIES : CITIES.filter((c) => c.toLowerCase().includes(query))
  ).slice(0, MAX_SUGGESTIONS);

  const handleSelect = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  return (
    <div className="city-autocomplete" ref={containerRef}>
      <IonItem>
        <IonLabel position="stacked">{label}</IonLabel>
        <IonInput
          value={value}
          placeholder={placeholder}
          onIonFocus={() => setOpen(true)}
          onIonInput={(e) => {
            onChange(e.detail.value || '');
            setOpen(true);
          }}
        />
      </IonItem>

      {open && filtered.length > 0 && (
        <div className="city-autocomplete__dropdown">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              className="city-autocomplete__option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../api/client';
import './Login.css';

export function Login() {
  const { login, isLoading } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      history.replace(user.role === 'admin' ? '/admin' : '/driver');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <IonPage>
      <IonContent className="login-page" fullscreen>
        <div className="login-card">
          <div className="login-brand">
            <span className="login-brand__mark">VJ</span>
            <div>
              <h1>Control de Viajes</h1>
              <p>Ingresa con tu cuenta asignada</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <IonItem>
              <IonLabel position="stacked">Correo</IonLabel>
              <IonInput
                type="email"
                value={email}
                required
                onIonInput={(e) => setEmail(e.detail.value || '')}
                placeholder="admin@viajes.com"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                required
                onIonInput={(e) => setPassword(e.detail.value || '')}
                placeholder="••••••••"
              />
            </IonItem>

            {error && (
              <IonText color="danger">
                <p className="login-error">{error}</p>
              </IonText>
            )}

            <IonButton expand="block" type="submit" disabled={isLoading}>
              {isLoading ? <IonSpinner name="dots" /> : 'Ingresar'}
            </IonButton>
          </form>

          <p className="login-hint">
            Admin: admin@viajes.com / Admin123! · Conductor: conductor@viajes.com / Conductor123!
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}

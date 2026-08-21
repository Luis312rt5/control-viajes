import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonIcon, IonSpinner } from '@ionic/react';
import { busOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../api/client';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
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
        <div className="login-page__theme">
          <ThemeSwitcher />
        </div>

        <div className="login-card">
          <div className="login-brand">
            <span className="login-brand__mark">
              <IonIcon icon={busOutline} />
            </span>
            <span className="login-brand__name">Control de Viajes</span>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="ui-field">
              <span className="ui-field__label">Correo</span>
              <span className="login-field">
                <IonIcon icon={mailOutline} />
                <input
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@viajes.com"
                />
              </span>
            </label>

            <label className="ui-field">
              <span className="ui-field__label">Contraseña</span>
              <span className="login-field">
                <IonIcon icon={lockClosedOutline} />
                <input
                  type="password"
                  value={password}
                  required
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </span>
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="ui-button ui-button--block" disabled={isLoading}>
              {isLoading ? <IonSpinner name="dots" /> : 'Iniciar sesión'}
            </button>
          </form>

          <p className="login-hint">admin@viajes.com · conductor@viajes.com</p>
        </div>
      </IonContent>
    </IonPage>
  );
}

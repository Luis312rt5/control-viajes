import { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  useIonViewWillEnter,
} from '@ionic/react';
import { homeOutline } from 'ionicons/icons';
import { fetchTripReport } from '../../api/trips';
import { TripReport } from '../../api/types';
import './TripSummary.css';

export function TripSummary() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [report, setReport] = useState<TripReport | null>(null);

  useIonViewWillEnter(() => {
    fetchTripReport(id).then(setReport);
  });

  if (!report) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonSpinner name="dots" />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/driver" />
          </IonButtons>
          <IonTitle>Resumen — {report.trip.code}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-stat__value">
              {report.passengers.boarded}/{report.passengers.total}
            </span>
            <span className="summary-stat__label">Pasajeros transportados</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat__value">
              ${report.expenses.total.toLocaleString('es-CO')}
            </span>
            <span className="summary-stat__label">Total gastos</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat__value">{report.incidents.total}</span>
            <span className="summary-stat__label">Novedades</span>
          </div>
        </div>

        <IonCard>
          <IonCardContent>
            <p className="summary-section-title">Gastos reportados</p>
            <IonList>
              {report.expenses.items.map((e) => (
                <IonItem key={e.id} lines="full">
                  <IonLabel>
                    <h3>{e.concept}</h3>
                    <p>{e.type}</p>
                  </IonLabel>
                  <IonLabel slot="end">${Number(e.amount).toLocaleString('es-CO')}</IonLabel>
                </IonItem>
              ))}
              {report.expenses.items.length === 0 && (
                <p className="summary-empty">Sin gastos reportados.</p>
              )}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardContent>
            <p className="summary-section-title">Novedades reportadas</p>
            <IonList>
              {report.incidents.items.map((i) => (
                <IonItem key={i.id} lines="full">
                  <IonLabel>
                    <h3>{i.type}</h3>
                    <p>{i.description}</p>
                  </IonLabel>
                </IonItem>
              ))}
              {report.incidents.items.length === 0 && (
                <p className="summary-empty">Sin novedades reportadas.</p>
              )}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          className="trip-summary__home-btn"
          onClick={() => history.push('/driver')}
        >
          <IonIcon icon={homeOutline} slot="start" />
          Volver a mis viajes
        </IonButton>
      </IonContent>
    </IonPage>
  );
}

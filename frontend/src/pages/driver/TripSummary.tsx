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
  IonIcon,
  IonSpinner,
  useIonViewWillEnter,
} from '@ionic/react';
import { homeOutline, busOutline, warningOutline } from 'ionicons/icons';
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
        <IonContent>
          <div className="ui-loading">
            <IonSpinner name="dots" />
          </div>
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

      <IonContent>
        <div className="page-shell page-shell--narrow summary">
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

          <section className="ui-section">
            <p className="ui-eyebrow">Gastos reportados</p>
            {report.expenses.items.length === 0 ? (
              <p className="ui-empty">Sin gastos reportados.</p>
            ) : (
              report.expenses.items.map((e) => (
                <div key={e.id} className="ui-row">
                  <span className="ui-row__main">
                    <IonIcon icon={busOutline} className="ui-row__icon" />
                    <span>
                      <span className="ui-row__title">{e.concept}</span>
                      <span className="ui-row__sub">{e.type}</span>
                    </span>
                  </span>
                  <span className="ui-row__value">
                    ${Number(e.amount).toLocaleString('es-CO')}
                  </span>
                </div>
              ))
            )}
          </section>

          <section className="ui-section">
            <p className="ui-eyebrow">Novedades reportadas</p>
            {report.incidents.items.length === 0 ? (
              <p className="ui-empty">Sin novedades reportadas.</p>
            ) : (
              report.incidents.items.map((i) => (
                <div key={i.id} className="ui-row">
                  <span className="ui-row__main">
                    <IonIcon
                      icon={warningOutline}
                      className="ui-row__icon ui-row__icon--warning"
                    />
                    <span>
                      <span className="ui-row__title">{i.type}</span>
                      <span className="ui-row__sub">{i.description}</span>
                    </span>
                  </span>
                </div>
              ))
            )}
          </section>

          <button
            type="button"
            className="ui-button ui-button--block"
            onClick={() => history.push('/driver')}
          >
            <IonIcon icon={homeOutline} />
            Volver a mis viajes
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
}

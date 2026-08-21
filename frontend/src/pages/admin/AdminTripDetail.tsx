import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonIcon,
  useIonViewWillEnter,
} from '@ionic/react';
import { checkmarkCircle, ellipseOutline, cashOutline, warningOutline } from 'ionicons/icons';
import { fetchTripReport } from '../../api/trips';
import { TripReport } from '../../api/types';
import { StatusBadge } from '../../components/StatusBadge';
import { TripQrCode } from '../../components/TripQrCode';
import '../driver/TripSummary.css';
import './AdminTripDetail.css';

export function AdminTripDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<TripReport | null>(null);

  // useIonViewWillEnter en vez de useEffect: así el detalle se refresca
  // también al volver a entrar (por ejemplo, después de que el conductor
  // avanzó el viaje mientras el admin estaba en otra pantalla).
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
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>{report.trip.code}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="page-shell summary">
          <div className="ui-page-head">
            <div>
              <h2>
                {report.trip.origin} → {report.trip.destination}
              </h2>
              <p>Conductor: {report.trip.driver?.fullName}</p>
            </div>
            <StatusBadge status={report.trip.status} />
          </div>

          <div className="summary-stats">
            <div className="summary-stat">
              <span className="summary-stat__value">
                {report.passengers.boarded}/{report.passengers.total}
              </span>
              <span className="summary-stat__label">Pasajeros</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__value">
                ${report.expenses.total.toLocaleString('es-CO')}
              </span>
              <span className="summary-stat__label">Gastos</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat__value">{report.incidents.total}</span>
              <span className="summary-stat__label">Novedades</span>
            </div>
          </div>

          {report.trip.status !== 'closed' && (
            <div className="admin-trip-detail__qr">
              <TripQrCode tripId={report.trip.id} tripCode={report.trip.code} />
            </div>
          )}

          <section className="ui-section">
            <p className="ui-eyebrow">Lista de pasajeros</p>
            {report.passengers.list.map((p) => (
              <div key={p.id} className="ui-row">
                <span className="ui-row__main">
                  <IonIcon
                    icon={p.boarded ? checkmarkCircle : ellipseOutline}
                    className={`ui-row__icon${p.boarded ? '' : ' admin-trip-detail__pending'}`}
                  />
                  <span>
                    <span className="ui-row__title">{p.name}</span>
                    <span className="ui-row__sub">{p.document}</span>
                  </span>
                </span>
                <span className="ui-row__value admin-trip-detail__boarded">
                  {p.boarded ? 'Abordó' : 'No abordó'}
                </span>
              </div>
            ))}
          </section>

          <section className="ui-section">
            <p className="ui-eyebrow">Gastos</p>
            {report.expenses.items.length === 0 ? (
              <p className="ui-empty">Sin gastos.</p>
            ) : (
              report.expenses.items.map((e) => (
                <div key={e.id} className="ui-row">
                  <span className="ui-row__main">
                    <IonIcon icon={cashOutline} className="ui-row__icon" />
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
            <p className="ui-eyebrow">Novedades</p>
            {report.incidents.items.length === 0 ? (
              <p className="ui-empty">Sin novedades.</p>
            ) : (
              report.incidents.items.map((i) => (
                <div key={i.id} className="ui-row">
                  <span className="ui-row__main">
                    <IonIcon icon={warningOutline} className="ui-row__icon ui-row__icon--warning" />
                    <span>
                      <span className="ui-row__title">{i.type}</span>
                      <span className="ui-row__sub">{i.description}</span>
                    </span>
                  </span>
                </div>
              ))
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
}

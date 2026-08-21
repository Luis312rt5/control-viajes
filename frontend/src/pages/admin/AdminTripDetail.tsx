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
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  useIonViewWillEnter,
} from '@ionic/react';
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
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>{report.trip.code}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="admin-trip-detail__header">
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

        <p className="summary-section-title">Lista de pasajeros</p>
        <IonList>
          {report.passengers.list.map((p) => (
            <IonItem key={p.id} lines="full">
              <IonCheckbox slot="start" checked={p.boarded} disabled />
              <IonLabel>
                <h3>{p.name}</h3>
                <p>{p.document}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <p className="summary-section-title">Gastos</p>
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
          {report.expenses.items.length === 0 && <p className="summary-empty">Sin gastos.</p>}
        </IonList>

        <p className="summary-section-title">Novedades</p>
        <IonList>
          {report.incidents.items.map((i) => (
            <IonItem key={i.id} lines="full">
              <IonLabel>
                <h3>{i.type}</h3>
                <p>{i.description}</p>
              </IonLabel>
            </IonItem>
          ))}
          {report.incidents.items.length === 0 && <p className="summary-empty">Sin novedades.</p>}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

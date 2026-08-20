import { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonList,
  IonIcon,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import { cashOutline, warningOutline, lockClosedOutline } from 'ionicons/icons';
import { createExpense, createIncident, fetchExpenses, fetchIncidents } from '../../api/operations';
import { Expense, ExpenseType, Incident, IncidentType } from '../../api/types';
import { extractErrorMessage } from '../../api/client';
import './RouteOperations.css';

const EXPENSE_LABELS: Record<ExpenseType, string> = {
  combustible: 'Combustible extra',
  peaje: 'Peaje no previsto',
  reparacion: 'Reparación / desvare',
  otro: 'Otro',
};

const INCIDENT_LABELS: Record<IncidentType, string> = {
  retraso: 'Retraso',
  problema_pasajero: 'Problema con pasajero',
  desvio: 'Desvío',
  otro: 'Otro',
};

interface RouteOperationsProps {
  tripId: string;
  onClose: () => void;
  busy: boolean;
}

export function RouteOperations({ tripId, onClose, busy }: RouteOperationsProps) {
  const [tab, setTab] = useState<'expenses' | 'incidents'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [expenseType, setExpenseType] = useState<ExpenseType>('combustible');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  const [incidentType, setIncidentType] = useState<IncidentType>('retraso');
  const [description, setDescription] = useState('');
  const [savingIncident, setSavingIncident] = useState(false);

  const loadAll = async () => {
    const [e, i] = await Promise.all([fetchExpenses(tripId), fetchIncidents(tripId)]);
    setExpenses(e);
    setIncidents(i);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const submitExpense = async () => {
    if (!amount || !concept) return;
    setSavingExpense(true);
    try {
      await createExpense({ tripId, type: expenseType, amount: Number(amount), concept });
      setAmount('');
      setConcept('');
      await loadAll();
      setToastMsg('Gasto registrado');
    } catch (err) {
      setToastMsg(extractErrorMessage(err));
    } finally {
      setSavingExpense(false);
    }
  };

  const submitIncident = async () => {
    if (!description) return;
    setSavingIncident(true);
    try {
      await createIncident({ tripId, type: incidentType, description });
      setDescription('');
      await loadAll();
      setToastMsg('Novedad registrada');
    } catch (err) {
      setToastMsg(extractErrorMessage(err));
    } finally {
      setSavingIncident(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="route-ops">
      <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as any)}>
        <IonSegmentButton value="expenses">
          <IonIcon icon={cashOutline} />
          <IonLabel>Gastos</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="incidents">
          <IonIcon icon={warningOutline} />
          <IonLabel>Novedades</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {tab === 'expenses' && (
        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Concepto</IonLabel>
              <IonSelect value={expenseType} onIonChange={(e) => setExpenseType(e.detail.value)}>
                {Object.entries(EXPENSE_LABELS).map(([value, label]) => (
                  <IonSelectOption key={value} value={value}>
                    {label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Monto (COP)</IonLabel>
              <IonInput
                type="number"
                value={amount}
                onIonInput={(e) => setAmount(e.detail.value || '')}
                placeholder="50000"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Descripción</IonLabel>
              <IonInput
                value={concept}
                onIonInput={(e) => setConcept(e.detail.value || '')}
                placeholder="Ej: Tanqueo en estación La 5ta"
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={submitExpense}
              disabled={savingExpense || !amount || !concept}
            >
              {savingExpense ? <IonSpinner name="dots" /> : 'Registrar gasto'}
            </IonButton>

            <IonList className="route-ops__list">
              {expenses.map((e) => (
                <IonItem key={e.id} lines="full">
                  <IonLabel>
                    <h3>{EXPENSE_LABELS[e.type]}</h3>
                    <p>{e.concept}</p>
                  </IonLabel>
                  <IonLabel slot="end" className="route-ops__amount">
                    ${Number(e.amount).toLocaleString('es-CO')}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
            {expenses.length > 0 && (
              <p className="route-ops__total">
                Total gastos: <strong>${totalExpenses.toLocaleString('es-CO')}</strong>
              </p>
            )}
          </IonCardContent>
        </IonCard>
      )}

      {tab === 'incidents' && (
        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Tipo de novedad</IonLabel>
              <IonSelect value={incidentType} onIonChange={(e) => setIncidentType(e.detail.value)}>
                {Object.entries(INCIDENT_LABELS).map(([value, label]) => (
                  <IonSelectOption key={value} value={value}>
                    {label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Descripción</IonLabel>
              <IonTextarea
                value={description}
                onIonInput={(e) => setDescription(e.detail.value || '')}
                placeholder="Describe lo ocurrido..."
                rows={3}
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={submitIncident}
              disabled={savingIncident || !description}
            >
              {savingIncident ? <IonSpinner name="dots" /> : 'Registrar novedad'}
            </IonButton>

            <IonList className="route-ops__list">
              {incidents.map((i) => (
                <IonItem key={i.id} lines="full">
                  <IonLabel>
                    <h3>{INCIDENT_LABELS[i.type]}</h3>
                    <p>{i.description}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      )}

      <IonButton expand="block" color="dark" onClick={onClose} disabled={busy}>
        <IonIcon icon={lockClosedOutline} slot="start" />
        Cerrar viaje
      </IonButton>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg || ''}
        duration={2500}
        onDidDismiss={() => setToastMsg(null)}
      />
    </div>
  );
}

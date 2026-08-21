import { useEffect, useState } from 'react';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
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
      <IonSegment
        className="route-ops__segment"
        value={tab}
        onIonChange={(e) => setTab(e.detail.value as any)}
      >
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
        <>
          <section className="ui-section route-ops__form">
            <p className="ui-eyebrow">Registrar gasto</p>

            <label className="ui-field">
              <span className="ui-field__label">Concepto</span>
              <select
                className="ui-select"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
              >
                {Object.entries(EXPENSE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="ui-field">
              <span className="ui-field__label">Monto (COP)</span>
              <input
                className="ui-input"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
              />
            </label>

            <label className="ui-field">
              <span className="ui-field__label">Descripción</span>
              <input
                className="ui-input"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej: Tanqueo en estación La 5ta"
              />
            </label>

            <button
              type="button"
              className="ui-button ui-button--block"
              onClick={submitExpense}
              disabled={savingExpense || !amount || !concept}
            >
              {savingExpense ? <IonSpinner name="dots" /> : 'Registrar gasto'}
            </button>
          </section>

          <section className="ui-section">
            <p className="ui-eyebrow">Gastos del viaje</p>
            {expenses.length === 0 ? (
              <p className="ui-empty">Todavía no has reportado gastos.</p>
            ) : (
              <>
                {expenses.map((e) => (
                  <div key={e.id} className="ui-row">
                    <span className="ui-row__main">
                      <IonIcon icon={cashOutline} className="ui-row__icon" />
                      <span>
                        <span className="ui-row__title">{EXPENSE_LABELS[e.type]}</span>
                        <span className="ui-row__sub">{e.concept}</span>
                      </span>
                    </span>
                    <span className="ui-row__value route-ops__amount">
                      ${Number(e.amount).toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
                <div className="ui-row route-ops__total">
                  <span className="ui-row__title">Total gastos</span>
                  <span className="ui-row__value route-ops__amount">
                    ${totalExpenses.toLocaleString('es-CO')}
                  </span>
                </div>
              </>
            )}
          </section>
        </>
      )}

      {tab === 'incidents' && (
        <>
          <section className="ui-section route-ops__form">
            <p className="ui-eyebrow">Registrar novedad</p>

            <label className="ui-field">
              <span className="ui-field__label">Tipo de novedad</span>
              <select
                className="ui-select"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
              >
                {Object.entries(INCIDENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="ui-field">
              <span className="ui-field__label">Descripción</span>
              <textarea
                className="ui-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lo ocurrido..."
                rows={3}
              />
            </label>

            <button
              type="button"
              className="ui-button ui-button--block"
              onClick={submitIncident}
              disabled={savingIncident || !description}
            >
              {savingIncident ? <IonSpinner name="dots" /> : 'Registrar novedad'}
            </button>
          </section>

          <section className="ui-section">
            <p className="ui-eyebrow">Novedades del viaje</p>
            {incidents.length === 0 ? (
              <p className="ui-empty">Todavía no has reportado novedades.</p>
            ) : (
              incidents.map((i) => (
                <div key={i.id} className="ui-row">
                  <span className="ui-row__main">
                    <IonIcon icon={warningOutline} className="ui-row__icon ui-row__icon--warning" />
                    <span>
                      <span className="ui-row__title">{INCIDENT_LABELS[i.type]}</span>
                      <span className="ui-row__sub">{i.description}</span>
                    </span>
                  </span>
                </div>
              ))
            )}
          </section>
        </>
      )}

      <button
        type="button"
        className="ui-button ui-button--block ui-button--dark"
        onClick={onClose}
        disabled={busy}
      >
        <IonIcon icon={lockClosedOutline} />
        Cerrar viaje
      </button>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg || ''}
        duration={2500}
        onDidDismiss={() => setToastMsg(null)}
      />
    </div>
  );
}

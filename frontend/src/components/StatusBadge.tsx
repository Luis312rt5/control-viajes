import { IonBadge } from '@ionic/react';
import { TripStatus } from '../api/types';

const STATUS_LABEL: Record<TripStatus, string> = {
  pending: 'Pendiente',
  ready: 'Listo',
  in_progress: 'En ruta',
  closed: 'Cerrado',
};

const STATUS_COLOR: Record<TripStatus, string> = {
  pending: 'medium',
  ready: 'primary',
  in_progress: 'success',
  closed: 'dark',
};

interface StatusBadgeProps {
  status: TripStatus;
  slot?: string;
}

export function StatusBadge({ status, slot }: StatusBadgeProps) {
  return (
    <IonBadge color={STATUS_COLOR[status]} slot={slot}>
      {STATUS_LABEL[status]}
    </IonBadge>
  );
}

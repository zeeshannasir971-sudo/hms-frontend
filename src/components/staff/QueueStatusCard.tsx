import React from 'react';
import { Badge } from '../ui/Badge';
import { Queue } from '@/types';

interface QueueStatusCardProps {
  queueItem: Queue;
}

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({ queueItem }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'warning';
      case 'in-consultation':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {queueItem.position}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {typeof queueItem.patientId === 'object' && queueItem.patientId ? 
              `${queueItem.patientId.user?.firstName || ''} ${queueItem.patientId.user?.lastName || ''}` : 
              queueItem.patient ? `${queueItem.patient.user?.firstName || ''} ${queueItem.patient.user?.lastName || ''}` : 'Unknown Patient'
            }
          </p>
          <p className="text-sm text-gray-500">
            Dr. {typeof queueItem.doctorId === 'object' && queueItem.doctorId ? 
              `${queueItem.doctorId.user?.firstName || queueItem.doctorId.firstName || ''} ${queueItem.doctorId.user?.lastName || queueItem.doctorId.lastName || ''}` : 
              queueItem.doctor ? `${queueItem.doctor.user?.firstName || queueItem.doctor.firstName || ''} ${queueItem.doctor.user?.lastName || queueItem.doctor.lastName || ''}` : 'Unknown Doctor'
            }
          </p>
          <p className="text-xs text-gray-400">
            Wait: {queueItem.estimatedWaitTime} min
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <Badge variant={getStatusVariant(queueItem.status)}>
          {queueItem.status}
        </Badge>
      </div>
    </div>
  );
};

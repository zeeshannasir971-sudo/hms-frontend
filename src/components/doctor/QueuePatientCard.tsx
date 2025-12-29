import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Queue } from '@/types';

interface QueuePatientCardProps {
  queueItem: Queue;
  onStartConsultation: (queueId: string) => void;

}

export const QueuePatientCard: React.FC<QueuePatientCardProps> = ({
  queueItem,
  onStartConsultation,
  onCompleteConsultation
}) => {
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
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
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
            Checked in: {new Date(queueItem.checkedInAt).toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-400">
            Wait time: {queueItem.estimatedWaitTime} minutes
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusVariant(queueItem.status)}>
          {queueItem.status}
        </Badge>
        
        {queueItem.status === 'waiting' && (
          <Button
            size="sm"
            onClick={() => onStartConsultation(queueItem.id)}
          >
            Start Consultation
          </Button>
        )}
        
        {queueItem.status === 'in-consultation' && (
          <Button
            variant="success"
            size="sm"
            onClick={() => onCompleteConsultation(queueItem.id)}
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Clock } from 'lucide-react';
import { Queue } from '@/types';

interface QueueStatusAlertProps {
  queueStatus: Queue;
}

export const QueueStatusAlert: React.FC<QueueStatusAlertProps> = ({ queueStatus }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center">
        <Clock className="h-5 w-5 text-blue-600 mr-2" />
        <div>
          <h3 className="text-sm font-medium text-blue-900">
            You are #{queueStatus.position} in the queue
          </h3>
          <p className="text-sm text-blue-700">
            Estimated wait time: {queueStatus.estimatedWaitTime} minutes with Dr. {
              typeof queueStatus.doctorId === 'object' && queueStatus.doctorId ? 
                `${queueStatus.doctorId.user?.firstName || queueStatus.doctorId.firstName || ''} ${queueStatus.doctorId.user?.lastName || queueStatus.doctorId.lastName || ''}` : 
                queueStatus.doctor ? `${queueStatus.doctor.user?.firstName || queueStatus.doctor.firstName || ''} ${queueStatus.doctor.user?.lastName || queueStatus.doctor.lastName || ''}` : 'Unknown Doctor'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
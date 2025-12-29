import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Appointment } from '@/types';

interface CheckInCardProps {
  appointment: Appointment;
  isCheckedIn: boolean;
  onCheckIn: (appointmentId: string, patientId: string, doctorId: string) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
  appointment,
  isCheckedIn,
  onCheckIn
}) => {
  const getStatusVariant = (status: string, checkedIn: boolean) => {
    if (checkedIn) return 'success';
    
    switch (status) {
      case 'confirmed':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {typeof appointment.patientId === 'object' && appointment.patientId ? 
              `${appointment.patientId.user?.firstName || ''} ${appointment.patientId.user?.lastName || ''}` : 
              appointment.patient ? `${appointment.patient.user?.firstName || ''} ${appointment.patient.user?.lastName || ''}` : 'Unknown Patient'
            }
          </p>
          <p className="text-sm text-gray-500">
            Dr. {typeof appointment.doctorId === 'object' && appointment.doctorId ? 
              `${appointment.doctorId.user?.firstName || appointment.doctorId.firstName || ''} ${appointment.doctorId.user?.lastName || appointment.doctorId.lastName || ''}` : 
              appointment.doctor ? `${appointment.doctor.user?.firstName || appointment.doctor.firstName || ''} ${appointment.doctor.user?.lastName || appointment.doctor.lastName || ''}` : 'Unknown Doctor'
            }
          </p>
          <p className="text-xs text-gray-400">
            {appointment.timeSlot} - {appointment.reason}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusVariant(appointment.status, isCheckedIn)}>
          {isCheckedIn ? 'Checked In' : appointment.status}
        </Badge>
        
        {!isCheckedIn && appointment.status === 'confirmed' && (
          <Button
            size="sm"
            onClick={() => {
              const appointmentId = appointment.id || appointment._id;
              const patientId = typeof appointment.patientId === 'string' 
                ? appointment.patientId 
                : appointment.patientId.id;
              const doctorId = typeof appointment.doctorId === 'string' 
                ? appointment.doctorId 
                : appointment.doctorId.id || appointment.doctorId._id;
              
              if (appointmentId && patientId && doctorId) {
                onCheckIn(appointmentId, patientId, doctorId);
              }
            }}
          >
            Check In
          </Button>
        )}
      </div>
    </div>
  );
};
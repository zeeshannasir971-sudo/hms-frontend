import React from 'react';
import { Badge } from '../ui/Badge';
import { Appointment } from '@/types';
import { Calendar, Clock, User } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <Calendar className="h-8 w-8 text-primary-600" />
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Dr. {typeof appointment.doctorId === 'object' && appointment.doctorId ? 
                `${appointment.doctorId.user?.firstName || appointment.doctorId.firstName || ''} ${appointment.doctorId.user?.lastName || appointment.doctorId.lastName || ''}` : 
                appointment.doctor ? `${appointment.doctor.user?.firstName || appointment.doctor.firstName || ''} ${appointment.doctor.user?.lastName || appointment.doctor.lastName || ''}` : 'Unknown Doctor'
              }
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {appointment.reason}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <Badge variant={getStatusVariant(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>
    </div>
  );
};
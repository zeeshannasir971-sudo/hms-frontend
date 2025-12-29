'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Calendar, Clock, User, Filter } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { appointmentApi } from '@/lib/api';
import { Appointment } from '@/types';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointments();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Filter appointments for this doctor
      const doctorAppointments = response.data.filter((apt: any) => {
        const aptDoctorId = typeof apt.doctorId === 'object' ? apt.doctorId._id : apt.doctorId;
        return aptDoctorId === user.roleSpecificId;
      });
      
      setAppointments(doctorAppointments);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.updateAppointment(appointmentId, { status: 'confirmed' });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
      setError('Failed to confirm appointment');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.updateAppointment(appointmentId, { status: 'completed' });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to complete appointment:', err);
      setError('Failed to complete appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toDateString();
      return new Date(appointment.appointmentDate).toDateString() === today;
    }
    return appointment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'confirmed': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) return <Layout userRole="doctor"><LoadingPage /></Layout>;

  return (
    <Layout userRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your scheduled appointments
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({appointments.length})
            </Button>
            <Button
              variant={filter === 'today' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('today')}
            >
              Today
            </Button>
            <Button
              variant={filter === 'scheduled' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('scheduled')}
            >
              Scheduled
            </Button>
            <Button
              variant={filter === 'confirmed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('confirmed')}
            >
              Confirmed
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader title={`Appointments (${filteredAppointments.length})`} />
          
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id || appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {typeof appointment.patientId === 'object' && appointment.patientId
                            ? `${appointment.patientId.user?.firstName || ''} ${appointment.patientId.user?.lastName || ''}`
                            : appointment.patient 
                            ? `${appointment.patient.user?.firstName || ''} ${appointment.patient.user?.lastName || ''}`
                            : 'Patient Name'
                          }
                        </h3>
                        <p className="text-sm text-gray-600">{appointment.reason}</p>
                        {appointment.appointmentType && (
                          <p className="text-sm text-blue-600 font-medium">
                            Type: {appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.timeSlot}</span>
                    </div>
                    <div>
                      <span className="font-medium">Department: </span>
                      {typeof appointment.departmentId === 'object' && appointment.departmentId && 'name' in appointment.departmentId
                        ? (appointment.departmentId as any).name 
                        : appointment.department?.name || 'Department'
                      }
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-2">
                    {appointment.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => handleConfirmAppointment(appointment._id || appointment.id || '')}
                      >
                        Confirm
                      </Button>
                    )}
                    {(appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => handleCompleteAppointment(appointment._id || appointment.id || '')}
                      >
                        Complete Consultation
                      </Button>
                    )}
                    <Button size="sm" variant="secondary">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments found"
              description="No appointments match the selected filter."
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
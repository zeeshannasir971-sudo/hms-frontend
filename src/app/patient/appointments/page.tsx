'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, LinkButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { appointmentApi } from '@/lib/api';
import { Appointment } from '@/types';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchAppointments();
    
    // Check for success parameter
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await appointmentApi.getAppointments();
      // Filter appointments for current patient
      const patientAppointments = response.data.filter((apt: any) => {
        // Handle both string and object patientId
        const aptPatientId = typeof apt.patientId === 'object' ? apt.patientId._id : apt.patientId;
        return aptPatientId === user.roleSpecificId;
      });
      setAppointments(patientAppointments);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      await appointmentApi.cancelAppointment(appointmentId);
      await fetchAppointments(); // Refresh the list
      
      // Trigger dashboard refresh for all dashboards
      localStorage.setItem('dashboardRefresh', Date.now().toString());
      
      // Show success message
      setError('');
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err);
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['scheduled', 'confirmed'].includes(apt.status);
    if (filter === 'completed') return apt.status === 'completed';
    if (filter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  if (loading) return <Layout userRole="patient"><LoadingPage /></Layout>;

  return (
    <Layout userRole="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage your appointments
            </p>
          </div>
          <LinkButton href="/patient/appointments/book">
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </LinkButton>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">Appointment booked successfully!</span>
            </div>
            <p className="mt-1 text-sm">Your appointment has been scheduled. You will receive a confirmation shortly.</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex space-x-2">
          {['all', 'upcoming', 'completed', 'cancelled'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(filterOption)}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader title="Appointments" />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id || appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </span>
                        <Clock className="h-4 w-4 text-gray-500 ml-4" />
                        <span className="text-sm">{appointment.timeSlot}</span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">
                        Dr. {typeof appointment.doctorId === 'object' && appointment.doctorId ? 
                          `${appointment.doctorId.user?.firstName || appointment.doctorId.firstName || ''} ${appointment.doctorId.user?.lastName || appointment.doctorId.lastName || ''}` : 
                          appointment.doctor ? `${appointment.doctor.user?.firstName || appointment.doctor.firstName || ''} ${appointment.doctor.user?.lastName || appointment.doctor.lastName || ''}` : 'Unknown Doctor'
                        }
                      </h3>
                      
                      {appointment.appointmentType && (
                        <p className="text-sm text-blue-600 mb-1 font-medium">
                          Type: {appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1)}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Reason: {appointment.reason}
                      </p>
                      
                      {appointment.notes && (
                        <p className="text-sm text-gray-500">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      
                      {appointment.status === 'scheduled' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const appointmentId = appointment._id || appointment.id;
                            if (appointmentId) {
                              handleCancelAppointment(appointmentId);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments found"
              description="You don't have any appointments matching the selected filter."
              actionLabel="Book Appointment"
              actionHref="/patient/appointments/book"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
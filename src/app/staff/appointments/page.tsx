'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Calendar, Clock, User, Search, Filter } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { appointmentApi, queueApi, notificationsApi, api } from '@/lib/api';
import { Appointment } from '@/types';

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointments();
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    const patientName = typeof appointment.patientId === 'object' && appointment.patientId
      ? `${appointment.patientId.user?.firstName || ''} ${appointment.patientId.user?.lastName || ''}`
      : appointment.patient 
      ? `${appointment.patient.user?.firstName || ''} ${appointment.patient.user?.lastName || ''}`
      : '';
    
    const searchMatch = searchTerm === '' || patientName.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const statusMatch = filter === 'all' || appointment.status === filter;

    // Date filter
    let dateMatch = true;
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    
    if (dateFilter === 'today') {
      dateMatch = appointmentDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateMatch = appointmentDate.toDateString() === tomorrow.toDateString();
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      dateMatch = appointmentDate >= today && appointmentDate <= weekFromNow;
    }

    return searchMatch && statusMatch && dateMatch;
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

  const handleTestNotification = async (appointment: Appointment) => {
    try {
      // Get the current user to send test notification to them
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const testUserId = currentUser.id || currentUser._id;
      
      if (!testUserId) {
        alert('Current user ID not found');
        return;
      }

      console.log('Sending test notification to user:', testUserId); // Debug log

      const response = await api.post('/notifications/test-notification', {
        userId: testUserId,
        title: '🔔 Test Notification',
        message: 'This is a test notification to verify the notification system is working properly.'
      });

      if (response.data.success) {
        alert('Test notification sent successfully! Check your notifications.');
        // Trigger notification refresh
        localStorage.setItem('notificationRefresh', Date.now().toString());
      } else {
        alert('Failed to send test notification: ' + response.data.error);
      }
    } catch (error: any) {
      console.error('Test notification error:', error);
      alert('Failed to send test notification: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCheckIn = async (appointment: Appointment) => {
    try {
      // Add patient to queue
      await queueApi.addToQueue({
        patientId: typeof appointment.patientId === 'object' && appointment.patientId 
          ? appointment.patientId._id || appointment.patientId.id
          : appointment.patientId,
        doctorId: typeof appointment.doctorId === 'object' && appointment.doctorId 
          ? appointment.doctorId._id || appointment.doctorId.id
          : appointment.doctorId,
        appointmentId: appointment._id || appointment.id
      });
      
      // Trigger queue refresh
      localStorage.setItem('queueRefresh', Date.now().toString());
      
      // Trigger dashboard refresh
      localStorage.setItem('dashboardRefresh', Date.now().toString());
      
      alert('Patient checked in successfully and added to queue!');
    } catch (error) {
      alert('Failed to check in patient');
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentApi.updateAppointment(appointmentId, { status: newStatus });
      fetchAppointments();
      
      // Trigger notification refresh for all users
      localStorage.setItem('notificationRefresh', Date.now().toString());
      
      // Trigger dashboard refresh
      localStorage.setItem('dashboardRefresh', Date.now().toString());
      
      // Show success message
      alert(`Appointment ${newStatus} successfully! Patient will receive a notification.`);
    } catch (error) {
      alert('Failed to update appointment status');
    }
  };

  if (loading) return <Layout userRole="staff"><LoadingPage /></Layout>;

  return (
    <Layout userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track all patient appointments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <Button
                  variant={dateFilter === 'today' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDateFilter('today')}
                >
                  Today
                </Button>
                <Button
                  variant={dateFilter === 'tomorrow' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDateFilter('tomorrow')}
                >
                  Tomorrow
                </Button>
                <Button
                  variant={dateFilter === 'week' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDateFilter('week')}
                >
                  This Week
                </Button>
                <Button
                  variant={dateFilter === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDateFilter('all')}
                >
                  All
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Button
                  variant={filter === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({appointments.length})
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
            </div>
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
                        <p className="text-sm text-gray-600">
                          Dr. {typeof appointment.doctorId === 'object' && appointment.doctorId
                            ? typeof appointment.doctorId.userId === 'object' 
                              ? `${appointment.doctorId.userId.firstName || ''} ${appointment.doctorId.userId.lastName || ''}`
                              : 'Doctor Name'
                            : appointment.doctor 
                            ? `${appointment.doctor.user?.firstName || ''} ${appointment.doctor.user?.lastName || ''}`
                            : 'Doctor Name'
                          }
                        </p>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
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
                      {(() => {
                        if (typeof appointment.departmentId === 'object' && appointment.departmentId && 'name' in appointment.departmentId) {
                          return (appointment.departmentId as any).name;
                        }
                        return appointment.department?.name || 'Department';
                      })()}
                    </div>
                    <div>
                      <span className="font-medium">Reason: </span>
                      {appointment.reason}
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {appointment.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => handleStatusUpdate(appointment._id || appointment.id || '', 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleCheckIn(appointment)}
                        >
                          Check In Patient
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleStatusUpdate(appointment._id || appointment.id || '', 'completed')}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                    {(appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
                      <Button 
                        size="sm" 
                        variant="warning"
                        onClick={() => handleStatusUpdate(appointment._id || appointment.id || '', 'cancelled')}
                      >
                        Cancel
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
              description="No appointments match the selected filters."
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
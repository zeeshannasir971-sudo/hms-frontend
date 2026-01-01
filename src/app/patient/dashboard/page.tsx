'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Calendar, Clock, FileText, Bell } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppointmentCard } from '@/components/patient/AppointmentCard';
import { QueueStatusAlert } from '@/components/patient/QueueStatusAlert';
import { MedicalSummaryCard } from '@/components/patient/MedicalSummaryCard';
import { NotificationCard } from '@/components/patient/NotificationCard';
import { QuickActions } from '@/components/patient/QuickActions';
import { usePatientDashboard } from '@/hooks/usePatientDashboard';

export default function PatientDashboard() {
  const {
    appointments,
    queueStatus,
    medicalSummary,
    notifications,
    loading,
    error,
    downloadMedicalReport
  } = usePatientDashboard();

  if (loading) {
    return (
      <Layout userRole="patient">
        <LoadingPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userRole="patient">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  const upcomingAppointments = appointments.filter((apt: any) => {
    const isValidStatus = apt.status === 'scheduled' || apt.status === 'confirmed';
    const appointmentDate = new Date(apt.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const isFutureOrToday = appointmentDate >= today;
    
    return isValidStatus && isFutureOrToday;
  }).slice(0, 3);

  return (
    <Layout userRole="patient">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's an overview of your healthcare activities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Upcoming Appointments"
            value={upcomingAppointments.length}
            icon={Calendar}
          />
          <StatCard
            title="Queue Position"
            value={queueStatus?.position || 'Not in queue'}
            icon={Clock}
          />
          <StatCard
            title="Total Visits"
            value={medicalSummary?.totalVisits || 0}
            icon={FileText}
          />
          <StatCard
            title="Notifications"
            value={notifications.filter((n: any) => !n.isRead).length}
            icon={Bell}
          />
        </div>

        {/* Queue Status Alert */}
        {queueStatus && <QueueStatusAlert queueStatus={queueStatus} />}

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader
            title="Upcoming Appointments"
            action={
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Refresh
                </button>
                <a href="/patient/appointments" className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </a>
              </div>
            }
          />
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment: any) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming appointments"
              description="Get started by booking your first appointment."
              actionLabel="Book Appointment"
              actionHref="/patient/appointments/book"
            />
          )}
        </Card>

        {/* Medical Summary */}
        {medicalSummary && (
          <MedicalSummaryCard
            medicalSummary={medicalSummary}
            onDownloadReport={downloadMedicalReport}
          />
        )}

        {/* Recent Notifications */}
        <Card>
          <CardHeader
            title="Recent Notifications"
            action={
              <a href="/patient/notifications" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </a>
            }
          />
          
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification: any) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up!"
            />
          )}
        </Card>

        {/* Quick Actions */}
   
      </div>
    </Layout>
  );
}

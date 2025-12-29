'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Calendar, Clock, Users, UserPlus, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/Button';
import { CheckInCard } from '@/components/staff/CheckInCard';
import { QueueStatusCard } from '@/components/staff/QueueStatusCard';
import { useStaffDashboard } from '@/hooks/useStaffDashboard';

export default function StaffDashboard() {
  const {
    appointments,
    queueData,
    stats,
    loading,
    error,
    refetch,
    handleCheckInPatient
  } = useStaffDashboard();

  if (loading) {
    return (
      <Layout userRole="staff">
        <LoadingPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userRole="staff">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage patient check-ins and queue operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
          />
          <StatCard
            title="Checked In"
            value={stats.checkedInPatients}
            icon={UserPlus}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Waiting"
            value={stats.waitingPatients}
            icon={Clock}
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={CheckCircle}
            iconColor="text-green-600"
          />
        </div>

        {/* Today's Appointments - Check In */}
        <Card>
          <CardHeader
            title="Today's Appointments - Check In"
            action={
              <button 
                onClick={refetch}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Refresh
              </button>
            }
          />
          
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appointment: any) => {
                const isCheckedIn = queueData.some((q: any) => q.appointmentId === appointment.id);
                
                return (
                  <CheckInCard
                    key={appointment.id}
                    appointment={appointment}
                    isCheckedIn={isCheckedIn}
                    onCheckIn={handleCheckInPatient}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments today"
              description="No scheduled appointments for today."
            />
          )}
        </Card>

        {/* Current Queue Status */}
        <Card>
          <CardHeader
            title="Current Queue Status"
            action={
              <a href="/staff/queue" className="text-sm text-primary-600 hover:text-primary-500">
                Manage Queue
              </a>
            }
          />
          
          {queueData.length > 0 ? (
            <div className="space-y-3">
              {queueData.slice(0, 5).map((queueItem: any) => (
                <QueueStatusCard key={queueItem.id} queueItem={queueItem} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No patients in queue"
              description="Queue is empty at the moment."
            />
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LinkButton href="/staff/appointments">
              Manage Appointments
            </LinkButton>
            <LinkButton href="/staff/queue" variant="secondary">
              Queue Management
            </LinkButton>
            <LinkButton href="/staff/patients" variant="secondary">
              Patient Records
            </LinkButton>
            <LinkButton href="/staff/reports" variant="secondary">
              Daily Reports
            </LinkButton>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
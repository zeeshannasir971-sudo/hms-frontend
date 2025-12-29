'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppointmentCard } from '@/components/patient/AppointmentCard';
import { QueuePatientCard } from '@/components/doctor/QueuePatientCard';
import { LinkButton } from '@/components/ui/Button';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';

export default function DoctorDashboard() {
  const {
    appointments,
    queuePatients,
    stats,
    loading,
    error,
    refetch,
    handleStartConsultation,
    handleCompleteConsultation
  } = useDoctorDashboard();

  if (loading) {
    return (
      <Layout userRole="doctor">
        <LoadingPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userRole="doctor">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your appointments and patient consultations
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
            title="Completed Today"
            value={stats.completedToday}
            icon={CheckCircle}
            iconColor="text-green-600"
          />
          <StatCard
            title="Current Queue"
            value={stats.currentQueue}
            icon={Clock}
            iconColor="text-yellow-600"
          />
          <StatCard
            title="In Consultation"
            value={stats.pendingConsultations}
            icon={AlertCircle}
            iconColor="text-red-600"
          />
        </div>

        {/* Current Queue */}
        <Card>
          <CardHeader
            title="Current Queue"
            action={
              <button 
                onClick={refetch}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Refresh
              </button>
            }
          />
          
          {queuePatients.length > 0 ? (
            <div className="space-y-3">
              {queuePatients.map((queueItem: any) => (
                <QueuePatientCard
                  key={queueItem.id}
                  queueItem={queueItem}
                  onStartConsultation={handleStartConsultation}
                  onCompleteConsultation={handleCompleteConsultation}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No patients in queue"
              description="Patients will appear here when they check in."
            />
          )}
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader
            title="Today's Appointments"
            action={
              <a href="/doctor/appointments" className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </a>
            }
          />
          
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment: any) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments today"
              description="Your schedule is clear for today."
            />
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LinkButton href="/doctor/appointments">
              View All Appointments
            </LinkButton>
            <LinkButton href="/doctor/patients" variant="secondary">
              Patient Records
            </LinkButton>
            <LinkButton href="/doctor/schedule" variant="secondary">
              Manage Schedule
            </LinkButton>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
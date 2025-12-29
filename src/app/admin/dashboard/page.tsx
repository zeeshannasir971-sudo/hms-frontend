'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Users, Calendar, Building, Settings, AlertTriangle, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton, Button } from '@/components/ui/Button';
import { SystemHealthAlert } from '@/components/admin/SystemHealthAlert';
import { ActivityCard } from '@/components/admin/ActivityCard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboard() {
  const {
    stats,
    recentActivity,
    systemHealth,
    loading,
    error
  } = useAdminDashboard();

  if (loading) {
    return (
      <Layout userRole="admin">
        <LoadingPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userRole="admin">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            System overview and management console
          </p>
        </div>

        {/* System Health Alert */}
        <SystemHealthAlert {...systemHealth} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
          />
          <StatCard
            title="Active Patients"
            value={stats.totalPatients}
            icon={Users}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Active Doctors"
            value={stats.totalDoctors}
            icon={Users}
            iconColor="text-green-600"
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon={Building}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Current Queue"
            value={stats.currentQueue}
            icon={Users}
            iconColor="text-orange-600"
          />
          <StatCard
            title="Active Staff"
            value={stats.activeStaff}
            icon={Users}
            iconColor="text-indigo-600"
          />
          <StatCard
            title="System Alerts"
            value={stats.systemAlerts}
            icon={AlertTriangle}
            iconColor="text-red-600"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent System Activity" />
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No recent activity"
              description="System activity will appear here."
            />
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Pending Approvals */}
          <Card>
            <CardHeader title="Pending Approvals" />
            <div className="p-4">
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals || 0}</p>
                <p className="text-sm text-gray-600 mb-4">Users awaiting approval</p>
                <LinkButton href="/admin/pending-users" variant="warning" size="sm">
                  Review Pending
                </LinkButton>
              </div>
            </div>
          </Card>

          {/* Management Actions */}
          <Card>
            <CardHeader title="Management" />
            <div className="grid grid-cols-1 gap-3">
              <LinkButton href="/admin/users">
                Manage Users
              </LinkButton>
              <LinkButton href="/admin/departments" variant="secondary">
                Manage Departments
              </LinkButton>
              <LinkButton href="/admin/staff" variant="secondary">
                Manage Staff
              </LinkButton>
            </div>
          </Card>

          {/* System Actions */}
          <Card>
            <CardHeader title="System" />
            <div className="grid grid-cols-1 gap-3">
              <LinkButton href="/admin/reports">
                View Reports
              </LinkButton>
              <Button variant="secondary" className="text-center">
                System Backup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
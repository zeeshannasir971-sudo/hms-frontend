'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BarChart3, Download, Calendar, Users, Clock, TrendingUp, FileText } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { reportsApi } from '@/lib/api';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const [reportData, setReportData] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    averageWaitTime: 0,
    departmentStats: [] as any[],
    appointmentTrends: [] as any[]
  });

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const [dashboardRes, appointmentRes, patientRes] = await Promise.all([
        reportsApi.getDashboardSummary(),
        reportsApi.getAppointmentVolumeReport(dateRange.startDate, dateRange.endDate),
        reportsApi.getPatientStatistics(dateRange.startDate, dateRange.endDate)
      ]);

      // Fix data mapping to match actual API response structure
      const dashboardData = dashboardRes.data.summary || {};
      const appointmentData = appointmentRes.data.summary || {};
      const patientData = patientRes.data.patientStatistics || {};

      setReportData({
        totalAppointments: appointmentData.totalAppointments || 0,
        completedAppointments: appointmentData.completedAppointments || 0,
        cancelledAppointments: appointmentData.cancelledAppointments || 0,
        totalPatients: dashboardData.totalPatients || 0,
        totalDoctors: dashboardData.totalDoctors || 0,
        averageWaitTime: 0, // This would come from queue analytics
        departmentStats: patientRes.data.departmentStatistics || [],
        appointmentTrends: appointmentRes.data.dailyBreakdown || []
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      // Set default values on error
      setReportData({
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalPatients: 0,
        totalDoctors: 0,
        averageWaitTime: 0,
        departmentStats: [],
        appointmentTrends: []
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (format: string) => {
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and view comprehensive system reports and analytics
          </p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader title="Report Parameters" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <Button onClick={generateReport} disabled={loading} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
            <div>
              <Button variant="secondary" onClick={() => downloadReport('json')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Appointments"
            value={reportData.totalAppointments}
            icon={Calendar}
          />
          <StatCard
            title="Completed"
            value={reportData.completedAppointments}
            icon={Users}
            iconColor="text-green-600"
          />
          <StatCard
            title="Cancelled"
            value={reportData.cancelledAppointments}
            icon={Users}
            iconColor="text-red-600"
          />
          <StatCard
            title="Avg Wait Time"
            value={`${reportData.averageWaitTime} min`}
            icon={Clock}
            iconColor="text-yellow-600"
          />
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Patients"
            value={reportData.totalPatients}
            icon={Users}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Doctors"
            value={reportData.totalDoctors}
            icon={Users}
            iconColor="text-green-600"
          />
          <StatCard
            title="Completion Rate"
            value={reportData.totalAppointments > 0 ? `${Math.round((reportData.completedAppointments / reportData.totalAppointments) * 100)}%` : '0%'}
            icon={TrendingUp}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Cancellation Rate"
            value={reportData.totalAppointments > 0 ? `${Math.round((reportData.cancelledAppointments / reportData.totalAppointments) * 100)}%` : '0%'}
            icon={TrendingUp}
            iconColor="text-red-600"
          />
        </div>

        {/* Department Performance */}
        {reportData.departmentStats.length > 0 && (
          <Card>
            <CardHeader title="Department Performance" />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.departmentStats.map((dept, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.totalAppointments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.completedAppointments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.totalAppointments > 0 ? Math.round((dept.completedAppointments / dept.totalAppointments) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Quick Report Actions */}
        <Card>
          <CardHeader title="Quick Reports" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="secondary" className="justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Patient Report
            </Button>
            <Button variant="secondary" className="justify-center">
              <Users className="h-4 w-4 mr-2" />
              Doctor Report
            </Button>
            <Button variant="secondary" className="justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              Appointment Report
            </Button>
            <Button variant="secondary" className="justify-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Financial Report
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
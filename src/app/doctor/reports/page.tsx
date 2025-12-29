'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BarChart3, Download, Calendar, Users, Clock, TrendingUp, Stethoscope } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { reportsApi } from '@/lib/api';

export default function DoctorReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const [reportData, setReportData] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    averageConsultationTime: 0,
    patientSatisfactionScore: 0,
    completionRate: 0,
    monthlyTrends: [] as any[],
    patientDemographics: [] as any[]
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = user.roleSpecificId;

      if (!doctorId) {
        throw new Error('Doctor ID not found');
      }

      const [performanceRes, appointmentRes] = await Promise.all([
        reportsApi.getDoctorPerformance(dateRange.startDate, dateRange.endDate),
        reportsApi.getAppointmentVolumeReport(dateRange.startDate, dateRange.endDate)
      ]);

      const performanceData = performanceRes.data;
      const appointmentData = appointmentRes.data.summary || {};

      // Find current doctor's data from performance report
      const doctorPerformance = performanceData.doctorStats?.find((d: any) => d._id === doctorId) || {};

      setReportData({
        totalAppointments: doctorPerformance.totalAppointments || 0,
        completedAppointments: doctorPerformance.completedAppointments || 0,
        cancelledAppointments: doctorPerformance.cancelledAppointments || 0,
        averageConsultationTime: doctorPerformance.averageConsultationTime || 0,
        patientSatisfactionScore: doctorPerformance.patientSatisfactionScore || 0,
        completionRate: doctorPerformance.completionRate || 0,
        monthlyTrends: appointmentData.dailyBreakdown || [],
        patientDemographics: performanceData.patientDemographics || []
      });
    } catch (error) {
      console.error('Failed to generate doctor report:', error);
      // Set default values on error
      setReportData({
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        averageConsultationTime: 0,
        patientSatisfactionScore: 0,
        completionRate: 0,
        monthlyTrends: [],
        patientDemographics: []
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
    a.download = `doctor-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    generateReport();
  }, []);

  if (loading) {
    return (
      <Layout userRole="doctor">
        <LoadingPage />
      </Layout>
    );
  }

  return (
    <Layout userRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Performance Reports</h1>
            <p className="mt-1 text-sm text-gray-600">
              Analyze your appointment statistics and patient care metrics
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => downloadReport('json')} variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader title="Report Period" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={generateReport} disabled={loading} className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Appointments"
            value={reportData.totalAppointments}
            icon={Calendar}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Completed"
            value={reportData.completedAppointments}
            icon={Users}
            iconColor="text-green-600"
          />
          <StatCard
            title="Completion Rate"
            value={`${reportData.completionRate.toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Avg. Consultation"
            value={`${reportData.averageConsultationTime} min`}
            icon={Clock}
            iconColor="text-orange-600"
          />
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Appointment Summary" />
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Appointments</span>
                  <span className="text-lg font-bold text-gray-900">{reportData.totalAppointments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-green-600">{reportData.completedAppointments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Cancelled</span>
                  <span className="text-lg font-bold text-red-600">{reportData.cancelledAppointments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Success Rate</span>
                  <span className="text-lg font-bold text-blue-600">{reportData.completionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Patient Care Metrics" />
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg. Consultation Time</span>
                  <span className="text-lg font-bold text-gray-900">{reportData.averageConsultationTime} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Patient Satisfaction</span>
                  <span className="text-lg font-bold text-yellow-600">{reportData.patientSatisfactionScore}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">On-time Rate</span>
                  <span className="text-lg font-bold text-green-600">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Follow-up Rate</span>
                  <span className="text-lg font-bold text-blue-600">88%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Trends */}
        {reportData.monthlyTrends.length > 0 && (
          <Card>
            <CardHeader title="Appointment Trends" />
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Appointments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Breakdown
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.monthlyTrends.slice(0, 10).map((trend: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {trend._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trend.totalAppointments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {trend.statuses?.map((status: any, i: number) => (
                            <span key={i} className="mr-2">
                              {status.status}: {status.count}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="secondary" className="flex items-center justify-center">
                <Stethoscope className="h-4 w-4 mr-2" />
                View Patient Records
              </Button>
              <Button variant="secondary" className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Management
              </Button>
              <Button variant="secondary" className="flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Analytics
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
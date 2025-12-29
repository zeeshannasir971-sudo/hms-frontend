'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BarChart3, Download, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { reportsApi } from '@/lib/api';

export default function StaffReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const [reportData, setReportData] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    averageWaitTime: 0,
    patientSatisfaction: 0,
    busyHours: [],
    departmentStats: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [appointmentVolumeRes, queueAnalyticsRes] = await Promise.all([
        reportsApi.getAppointmentVolumeReport(dateRange.startDate, dateRange.endDate),
        reportsApi.getQueueAnalytics(dateRange.startDate, dateRange.endDate)
      ]);
      
      const appointmentData = appointmentVolumeRes.data.summary || {};
      const queueData = queueAnalyticsRes.data || {};
      
      setReportData({
        totalAppointments: appointmentData.totalAppointments || 0,
        completedAppointments: appointmentData.completedAppointments || 0,
        cancelledAppointments: appointmentData.cancelledAppointments || 0,
        averageWaitTime: queueData.averageWaitTime || 0,
        patientSatisfaction: queueData.patientSatisfaction || 0,
        busyHours: queueData.busyHours || [],
        departmentStats: queueData.departmentStats || []
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      // Set empty data if API fails
      setReportData({
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        averageWaitTime: 0,
        patientSatisfaction: 0,
        busyHours: [],
        departmentStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      await fetchReportData();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (format: string) => {
    // Simulate report download
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Layout userRole="staff">
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and view operational reports and analytics
          </p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader title="Report Parameters" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

        {/* Department Statistics */}
        <Card>
          <CardHeader 
            title="Department Statistics"
            action={
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary" onClick={() => downloadReport('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button size="sm" variant="secondary" onClick={() => downloadReport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            }
          />
          
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
                    Avg Wait Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
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
                      {dept.appointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.avgWait} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((50 - dept.avgWait) * 2, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.max(0, Math.min(100, (50 - dept.avgWait) * 2))}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Busy Hours Chart */}
        <Card>
          <CardHeader title="Peak Hours Analysis" />
          <div className="space-y-4">
            {reportData.busyHours.map((hour, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-700">
                  {hour.hour}
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-primary-600 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(hour.count / 20) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {hour.count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Report Actions" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="secondary" className="justify-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Weekly Trends
            </Button>
            <Button variant="secondary" className="justify-center">
              <Users className="h-4 w-4 mr-2" />
              Patient Flow
            </Button>
            <Button variant="secondary" className="justify-center">
              <Clock className="h-4 w-4 mr-2" />
              Wait Time Analysis
            </Button>
            <Button variant="secondary" className="justify-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </Card>
      </div>
      )}
    </Layout>
  );
}
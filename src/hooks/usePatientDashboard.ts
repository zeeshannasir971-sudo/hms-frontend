import { useState, useEffect } from 'react';
import { appointmentApi, queueApi, api } from '@/lib/api';
import { Appointment, Queue, Notification } from '@/types';

interface MedicalSummary {
  totalVisits: number;
  lastVisit?: Date;
  commonDiagnoses?: string[];
  currentMedications?: Array<{
    medication: string;
    dosage: string;
  }>;
}

interface PatientDashboardData {
  appointments: Appointment[];
  queueStatus: Queue | null;
  medicalSummary: MedicalSummary | null;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export const usePatientDashboard = () => {
  const [data, setData] = useState<PatientDashboardData>({
    appointments: [],
    queueStatus: null,
    medicalSummary: null,
    notifications: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user.roleSpecificId;
      
      if (!patientId) {
        throw new Error('Patient ID not found');
      }
      
      const [appointmentsRes, queueRes, medicalRes, notificationsRes] = await Promise.all([
        appointmentApi.getAppointments(),
        queueApi.getPatientQueueStatus(patientId).catch(() => ({ data: null })),
        api.get(`/medical-records/patient/${patientId}/summary`).catch(() => ({ data: null })),
        api.get('/notifications?limit=5').catch(() => ({ data: { notifications: [] } }))
      ]);
      
      // Filter appointments for this patient
      const patientAppointments = appointmentsRes.data.filter((apt: any) => {
        // Handle both string and object patientId
        const aptPatientId = typeof apt.patientId === 'object' ? apt.patientId._id || apt.patientId.id : apt.patientId;
        return aptPatientId === patientId;
      });
      
      setData({
        appointments: patientAppointments,
        queueStatus: queueRes.data,
        medicalSummary: medicalRes.data,
        notifications: notificationsRes.data.notifications || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const downloadMedicalReport = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user.roleSpecificId;
      
      if (!patientId) {
        throw new Error('Patient ID not found');
      }
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1); // Last year's data
      
      const response = await api.get(`/medical-records/patient/${patientId}/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for dashboard refresh events (when data actually changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardRefresh') {
        fetchDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for refresh flag on focus (for same-tab updates)
    const handleFocus = () => {
      const refreshFlag = localStorage.getItem('dashboardRefresh');
      if (refreshFlag) {
        const flagTime = parseInt(refreshFlag);
        const now = Date.now();
        // If flag is less than 5 seconds old, refresh
        if (now - flagTime < 5000) {
          fetchDashboardData();
          localStorage.removeItem('dashboardRefresh');
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return {
    ...data,
    refetch: fetchDashboardData,
    downloadMedicalReport
  };
};
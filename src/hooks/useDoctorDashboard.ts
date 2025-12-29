import { useState, useEffect } from 'react';
import { reportsApi, queueApi } from '@/lib/api';
import { Appointment, Queue } from '@/types';

interface DoctorDashboardData {
  appointments: Appointment[];
  queuePatients: Queue[];
  stats: {
    todayAppointments: number;
    completedToday: number;
    currentQueue: number;
    pendingConsultations: number;
  };
  loading: boolean;
  error: string | null;
}

export const useDoctorDashboard = () => {
  const [data, setData] = useState<DoctorDashboardData>({
    appointments: [],
    queuePatients: [],
    stats: {
      todayAppointments: 0,
      completedToday: 0,
      currentQueue: 0,
      pendingConsultations: 0
    },
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = user.roleSpecificId;
      
      if (!doctorId) {
        throw new Error('Doctor ID not found');
      }
      
      const response = await reportsApi.getDoctorDashboard(doctorId);
      const dashboardData = response.data;
      
      setData({
        appointments: dashboardData.appointments || [],
        queuePatients: dashboardData.queuePatients || [],
        stats: dashboardData.stats || {
          todayAppointments: 0,
          completedToday: 0,
          currentQueue: 0,
          pendingConsultations: 0
        },
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

  const handleStartConsultation = async (queueId: string) => {
    try {
      await queueApi.updateQueueStatus(queueId, 'in-consultation');
      fetchDashboardData();
      
      // Trigger dashboard refresh for all dashboards
      localStorage.setItem('dashboardRefresh', Date.now().toString());
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handleCompleteConsultation = async (queueId: string) => {
    try {
      await queueApi.updateQueueStatus(queueId, 'completed');
      fetchDashboardData();
      
      // Trigger dashboard refresh for all dashboards
      localStorage.setItem('dashboardRefresh', Date.now().toString());
    } catch (error) {
      console.error('Error completing consultation:', error);
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
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    ...data,
    refetch: fetchDashboardData,
    handleStartConsultation,
    handleCompleteConsultation
  };
};
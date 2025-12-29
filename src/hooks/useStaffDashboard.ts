import { useState, useEffect } from 'react';
import { appointmentApi, queueApi } from '@/lib/api';
import { Appointment, Queue } from '@/types';

interface StaffDashboardData {
  appointments: Appointment[];
  queueData: Queue[];
  stats: {
    todayAppointments: number;
    checkedInPatients: number;
    waitingPatients: number;
    completedToday: number;
  };
  loading: boolean;
  error: string | null;
}

export const useStaffDashboard = () => {
  const [data, setData] = useState<StaffDashboardData>({
    appointments: [],
    queueData: [],
    stats: {
      todayAppointments: 0,
      checkedInPatients: 0,
      waitingPatients: 0,
      completedToday: 0
    },
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [appointmentsRes, queueRes] = await Promise.all([
        appointmentApi.getAppointments(),
        queueApi.getQueue()
      ]);
      
      const today = new Date().toDateString();
      const todayAppointments = appointmentsRes.data.filter((apt: any) => 
        new Date(apt.appointmentDate).toDateString() === today
      );
      
      const stats = {
        todayAppointments: todayAppointments.length,
        checkedInPatients: queueRes.data.length,
        waitingPatients: queueRes.data.filter((q: any) => q.status === 'waiting').length,
        completedToday: queueRes.data.filter((q: any) => q.status === 'completed').length
      };
      
      setData({
        appointments: todayAppointments,
        queueData: queueRes.data,
        stats,
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

  const handleCheckInPatient = async (appointmentId: string, patientId: string, doctorId: string) => {
    try {
      await queueApi.addToQueue({
        patientId,
        doctorId,
        appointmentId
      });
      fetchDashboardData();
      
      // Trigger dashboard refresh for all dashboards
      localStorage.setItem('dashboardRefresh', Date.now().toString());
    } catch (error) {
      console.error('Error checking in patient:', error);
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
    handleCheckInPatient
  };
};
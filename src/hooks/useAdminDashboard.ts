import { useState, useEffect } from 'react';
import { adminApi, reportsApi } from '@/lib/api';
import { DashboardStats, AuditLog } from '@/types';

interface AdminDashboardData {
  stats: DashboardStats;
  recentActivity: AuditLog[];
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    details: string[];
  };
  loading: boolean;
  error: string | null;
}

export const useAdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData>({
    stats: {
      totalUsers: 0,
      totalPatients: 0,
      totalDoctors: 0,
      totalDepartments: 0,
      todayAppointments: 0,
      currentQueue: 0,
      activeStaff: 0,
      systemAlerts: 0
    },
    recentActivity: [],
    systemHealth: {
      status: 'healthy',
      message: 'All systems operational',
      details: []
    },
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [statsRes, activityRes] = await Promise.all([
        adminApi.getSystemStatistics().catch(() => ({ data: data.stats })),
        adminApi.getAuditLogs(1, 10).catch(() => ({ data: { logs: [] } }))
      ]);
      
      // Determine system health based on stats
      const stats = statsRes.data;
      let systemHealth: {
        status: 'healthy' | 'warning' | 'critical';
        message: string;
        details: string[];
      } = {
        status: 'healthy',
        message: 'All systems operational',
        details: []
      };

      if (stats.systemAlerts > 0) {
        systemHealth = {
          status: 'warning',
          message: `${stats.systemAlerts} system alerts require attention`,
          details: [
            'Check system logs for details',
            'Review recent error reports'
          ]
        };
      }

      if (stats.systemAlerts > 5) {
        systemHealth = {
          status: 'critical',
          message: 'Multiple system issues detected',
          details: [
            'Immediate attention required',
            'Contact system administrator',
            'Review error logs'
          ]
        };
      }
      
      setData({
        stats,
        recentActivity: activityRes.data.logs || activityRes.data || [],
        systemHealth,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
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
    refetch: fetchDashboardData
  };
};
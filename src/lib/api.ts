import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email: string) =>
    api.post('/auth/reset-password', { email }),
  confirmResetPassword: (email: string, resetCode: string, newPassword: string) =>
    api.post('/auth/confirm-reset-password', { email, resetCode, newPassword }),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUsers: () => api.get('/users'),
  getPatients: () => api.get('/users/patients'),
};

// Appointment API
export const appointmentApi = {
  getAppointments: () => api.get('/appointments'),
  createAppointment: (data: any) => api.post('/appointments', data),
  updateAppointment: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id: string) => api.patch(`/appointments/${id}/cancel`),
  deleteAppointment: (id: string) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (doctorId: string, date: string) =>
    api.get(`/appointments/available-slots/${doctorId}?date=${date}`),
};

// Queue API
export const queueApi = {
  getQueue: (doctorId?: string) => api.get(`/queue${doctorId ? `?doctorId=${doctorId}` : ''}`),
  addToQueue: (data: any) => api.post('/queue', data),
  updateQueueStatus: (id: string, status: string) =>
    api.patch(`/queue/${id}/status`, { status }),
  getPatientQueueStatus: (patientId: string) => api.get(`/queue/patient/${patientId}`),
  removeFromQueue: (id: string) => api.delete(`/queue/${id}`),
};

// Doctor API
export const doctorApi = {
  getDoctors: (departmentId?: string) => 
    api.get(`/doctors${departmentId ? `?departmentId=${departmentId}` : ''}`),
  getDoctorById: (id: string) => api.get(`/doctors/${id}`),
  updateDoctor: (id: string, data: any) => api.put(`/doctors/${id}`, data),
};

// Department API
export const departmentApi = {
  getDepartments: () => api.get('/departments'),
  createDepartment: (data: any) => api.post('/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/departments/${id}`, data),
};

// Medical Records API
export const medicalRecordsApi = {
  getPatientRecords: (patientId: string) => api.get(`/medical-records/patient/${patientId}`),
  getDoctorRecords: (doctorId: string) => api.get(`/medical-records/doctor/${doctorId}`),
  createRecord: (data: any) => api.post('/medical-records', data),
  updateRecord: (id: string, data: any) => api.put(`/medical-records/${id}`, data),
  getPatientSummary: (patientId: string) => api.get(`/medical-records/patient/${patientId}/summary`),
  generateReport: (patientId: string, startDate: string, endDate: string) =>
    api.get(`/medical-records/patient/${patientId}/report?startDate=${startDate}&endDate=${endDate}`),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (page?: number, limit?: number) => 
    api.get(`/notifications?page=${page || 1}&limit=${limit || 20}`),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  getStatistics: () => api.get('/notifications/statistics'),
  testNotification: (userId: string, title: string, message: string) =>
    api.post('/notifications/test-notification', { userId, title, message }),
};

// Reports API
export const reportsApi = {
  getDashboardSummary: () => api.get('/reports/dashboard-summary'),
  getDoctorDashboard: (doctorId: string) => api.get(`/reports/doctor-dashboard/${doctorId}`),
  getAppointmentVolumeReport: (startDate: string, endDate: string) =>
    api.get(`/reports/appointment-volume?startDate=${startDate}&endDate=${endDate}`),
  getPatientStatistics: (startDate: string, endDate: string) =>
    api.get(`/reports/patient-statistics?startDate=${startDate}&endDate=${endDate}`),
  getDoctorPerformance: (startDate: string, endDate: string) =>
    api.get(`/reports/doctor-performance?startDate=${startDate}&endDate=${endDate}`),
  getQueueAnalytics: (startDate: string, endDate: string) =>
    api.get(`/reports/queue-analytics?startDate=${startDate}&endDate=${endDate}`),
  getRevenueReport: (startDate: string, endDate: string) =>
    api.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`),
};

// Admin API
export const adminApi = {
  // System Settings
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSetting: (key: string, value: string) => api.put(`/admin/settings/${key}`, { value }),
  createSystemSetting: (data: any) => api.post('/admin/settings', data),
  
  // User Management
  getAllUsers: (page?: number, limit?: number) => 
    api.get(`/admin/users?page=${page || 1}&limit=${limit || 10}`),
  getPendingUsers: () => api.get('/admin/users/pending'),
  approveUser: (userId: string, adminId: string) => 
    api.put(`/admin/users/${userId}/approve`, { adminId }),
  rejectUser: (userId: string, adminId: string, reason: string) => 
    api.put(`/admin/users/${userId}/reject`, { adminId, reason }),
  createUser: (userData: any) => api.post('/admin/users', userData),
  updateUser: (userId: string, userData: any) => api.put(`/admin/users/${userId}`, userData),
  updatePatient: (patientId: string, patientData: any) => api.put(`/admin/patients/${patientId}`, patientData),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  updateUserRole: (userId: string, role: string, permissions: any) =>
    api.put(`/admin/users/${userId}/role`, { role, permissions }),
  deactivateUser: (userId: string) => api.put(`/admin/users/${userId}/deactivate`),
  activateUser: (userId: string) => api.put(`/admin/users/${userId}/activate`),
  
  // Appointment Types
  getAppointmentTypes: () => api.get('/admin/appointment-types'),
  createAppointmentType: (data: any) => api.post('/admin/appointment-types', data),
  updateAppointmentType: (id: string, data: any) => api.put(`/admin/appointment-types/${id}`, data),
  deleteAppointmentType: (id: string) => api.delete(`/admin/appointment-types/${id}`),
  
  // Staff Management
  getAllStaff: () => api.get('/admin/staff'),
  createStaff: (data: any) => api.post('/admin/staff', data),
  updateStaff: (id: string, data: any) => api.put(`/admin/staff/${id}`, data),
  
  // Audit Logs
  getAuditLogs: (page?: number, limit?: number) =>
    api.get(`/admin/audit-logs?page=${page || 1}&limit=${limit || 50}`),
  
  // System Operations
  getSystemStatistics: () => api.get('/admin/statistics'),
  performMaintenance: () => api.post('/admin/maintenance'),
  exportData: (dataType: string) => api.get(`/admin/export/${dataType}`),
};
export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'staff' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  permissions?: {
    canManageUsers: boolean;
    canManageAppointments: boolean;
    canManageQueue: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  user?: User;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  occupation?: string;
  maritalStatus?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  chronicConditions?: Array<{
    condition: string;
    diagnosedDate: Date;
    status: 'active' | 'resolved' | 'chronic';
  }>;
  currentMedications?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate: Date;
    prescribedBy: string;
  }>;
  surgicalHistory?: Array<{
    surgery: string;
    date: Date;
    hospital: string;
    surgeon: string;
    notes: string;
  }>;
  vaccinations?: Array<{
    vaccine: string;
    date: Date;
    nextDue: Date;
    administeredBy: string;
  }>;
}

export interface Doctor {
  id?: string;
  _id?: string;
  userId: string | {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  user?: User;
  specialization: string;
  licenseNumber: string;
  departmentId: string | {
    _id: string;
    name: string;
    description: string;
  };
  department?: Department;
  experience: number;
  consultationFee: number;
  dutyHours: {
    start: string;
    end: string;
    days: string[];
  };
  isAvailable: boolean;
  firstName?: string;
  lastName?: string;
}

export interface Staff {
  id: string;
  userId: string;
  user?: User;
  employeeId: string;
  position: string;
  departmentId?: string;
  department?: Department;
  joinDate: Date;
  qualification?: string;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  isActive: boolean;
  salary?: number;
  emergencyContact?: string;
  address?: string;
}

export interface Appointment {
  id?: string;
  _id?: string;
  patientId: string | Patient;
  doctorId: string | Doctor;
  departmentId: string;
  patient?: Patient;
  doctor?: Doctor;
  department?: Department;
  appointmentDate: Date;
  timeSlot: string;
  appointmentType?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  prescription?: string;
  diagnosis?: string;
  createdAt: Date;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  color: string;
  isActive: boolean;
  price?: number;
  availableDepartments?: string[];
  requiresPreparation: boolean;
  preparationInstructions?: string;
}

export interface Queue {
  id?: string;
  _id?: string;
  patientId: string | Patient;
  doctorId: string | Doctor;
  appointmentId?: string;
  patient?: Patient;
  doctor?: Doctor;
  position: number;
  status: 'waiting' | 'in-consultation' | 'completed';
  estimatedWaitTime: number;
  checkedInAt: Date;
  consultationStartedAt?: Date;
  consultationCompletedAt?: Date;
}

export interface Department {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  isActive: boolean;
  head?: string;
  location?: string;
  contactNumber?: string;
}

export interface Notification {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'queue' | 'system' | 'reminder' | 'alert';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  expiresAt?: Date;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  visitDate: Date;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
  };
  physicalExamination?: string;
  diagnosis?: string[];
  treatmentPlan?: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  labOrders?: Array<{
    test: string;
    reason: string;
    urgency: 'routine' | 'urgent' | 'stat';
  }>;
  followUpInstructions?: string;
  nextAppointmentDate?: Date;
  attachments?: Array<{
    filename: string;
    mimetype: string;
    size: number;
    uploadDate: Date;
  }>;
  notes?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | User;
  user?: User;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  actionType: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  createdAt: Date;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isSystem: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  todayAppointments: number;
  currentQueue: number;
  activeStaff: number;
  systemAlerts: number;
}

export interface ReportData {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: any;
  data: any[];
}
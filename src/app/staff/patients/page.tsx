'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Search, User, Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { userApi, appointmentApi, adminApi } from '@/lib/api';
import { Patient, Appointment } from '@/types';
import { calculateAge, formatDate } from '@/lib/utils';

export default function StaffPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try the new patients endpoint first
      try {
        const response = await userApi.getPatients();
        
        if (response.data.success) {
          setPatients(response.data.data || []);
          return;
        } else {
          throw new Error(response.data.error || 'Patients endpoint failed');
        }
      } catch (patientsError) {
        // Fallback: use users endpoint and filter for patients
        // Note: This fallback won't have complete patient data, only user data
        const usersResponse = await userApi.getUsers();
        const patientUsers = usersResponse.data.filter((user: any) => user.role === 'patient');
        
        // Convert users to patient format with only available data
        const patientsData = patientUsers.map((user: any) => ({
          id: user.id || user._id,
          userId: user.id || user._id,
          user: user,
          dateOfBirth: user.dateOfBirth || null,
          gender: user.gender || null,
          address: user.address || null,
          emergencyContact: user.emergencyContact || user.phone || null,
          bloodGroup: user.bloodGroup || null,
          allergies: user.allergies || null,
          medicalHistory: null,
          height: null,
          weight: null,
          occupation: null,
          maritalStatus: null,
          insuranceProvider: null,
          insuranceNumber: null,
          chronicConditions: [],
          currentMedications: [],
          surgicalHistory: [],
          vaccinations: []
        }));
        
        setPatients(patientsData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientAppointments = async (patientId: string) => {
    try {
      setAppointmentsLoading(true);
      const response = await appointmentApi.getAppointments();
      const patientAppts = response.data.filter((apt: Appointment) => {
        // Handle both string and object patientId
        const aptPatientId = typeof apt.patientId === 'object' && apt.patientId 
          ? (apt.patientId as any)._id || (apt.patientId as any).id
          : apt.patientId;
        return aptPatientId === patientId;
      });
      setPatientAppointments(patientAppts);
    } catch (err) {
      console.error('Failed to load patient appointments:', err);
      setPatientAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    fetchPatientAppointments(patient.id);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.user?.firstName} ${patient.user?.lastName} ${patient.user?.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSendEmail = (patient: Patient) => {
    if (!patient.user?.email) {
      alert('Patient email not available');
      return;
    }
    
    const subject = encodeURIComponent('Hospital Communication');
    const body = encodeURIComponent(`Dear ${patient.user.firstName} ${patient.user.lastName},\n\nThis is a message from the hospital staff.\n\nBest regards,\nHospital Staff`);
    const mailtoLink = `mailto:${patient.user.email}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowEditModal(true);
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'confirmed': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) return <Layout userRole="staff"><LoadingPage /></Layout>;

  return (
    <Layout userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage patient information and appointment history
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchPatients}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader title={`Patients (${filteredPatients.length})`} />
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {filteredPatients.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-8 w-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {patient.user?.firstName} {patient.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {patient.user?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.dateOfBirth ? (
                              <>Age: {calculateAge(patient.dateOfBirth) ?? 'Unknown'} years</>
                            ) : (
                              'Age: Not provided'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={User}
                  title="No patients found"
                  description="No patients match your search criteria."
                />
              )}
            </Card>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Information */}
                <Card>
                  <CardHeader title="Patient Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-sm text-gray-900">
                        {selectedPatient.user?.firstName} {selectedPatient.user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-sm text-gray-900">
                        {selectedPatient.dateOfBirth ? (
                          <>
                            {formatDate(selectedPatient.dateOfBirth)} 
                            {calculateAge(selectedPatient.dateOfBirth) && (
                              <> (Age: {calculateAge(selectedPatient.dateOfBirth)} years)</>
                            )}
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="text-sm text-gray-900 capitalize">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Blood Group</p>
                      <p className="text-sm text-gray-900">{selectedPatient.bloodGroup || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{selectedPatient.user?.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{selectedPatient.user?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{selectedPatient.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                      <p className="text-sm text-gray-900">{selectedPatient.emergencyContact || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Allergies</p>
                      <p className="text-sm text-gray-900">{selectedPatient.allergies || 'None reported'}</p>
                    </div>
                    {selectedPatient.height && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Height</p>
                        <p className="text-sm text-gray-900">{selectedPatient.height} cm</p>
                      </div>
                    )}
                    {selectedPatient.weight && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Weight</p>
                        <p className="text-sm text-gray-900">{selectedPatient.weight} kg</p>
                      </div>
                    )}
                    {selectedPatient.occupation && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Occupation</p>
                        <p className="text-sm text-gray-900">{selectedPatient.occupation}</p>
                      </div>
                    )}
                    {selectedPatient.maritalStatus && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Marital Status</p>
                        <p className="text-sm text-gray-900 capitalize">{selectedPatient.maritalStatus}</p>
                      </div>
                    )}
                    {selectedPatient.insuranceProvider && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Insurance Provider</p>
                        <p className="text-sm text-gray-900">{selectedPatient.insuranceProvider}</p>
                      </div>
                    )}
                    {selectedPatient.insuranceNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Insurance Number</p>
                        <p className="text-sm text-gray-900">{selectedPatient.insuranceNumber}</p>
                      </div>
                    )}
                    {selectedPatient.medicalHistory && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Medical History</p>
                        <p className="text-sm text-gray-900">{selectedPatient.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleSendEmail(selectedPatient)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleEditPatient(selectedPatient)}
                    >
                      Edit Information
                    </Button>
                  </div>
                </Card>

                {/* Medical Information */}
                {((selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0) || 
                  (selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0)) && (
                  <Card>
                    <CardHeader title="Medical Information" />
                    
                    {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Chronic Conditions</h4>
                        <div className="space-y-2">
                          {selectedPatient.chronicConditions.map((condition: any, index: number) => (
                            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                              <p className="font-medium text-yellow-800">{condition.condition}</p>
                              <p className="text-sm text-yellow-600">
                                Diagnosed: {formatDate(condition.diagnosedDate)} | Status: {condition.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Medications</h4>
                        <div className="space-y-2">
                          {selectedPatient.currentMedications.map((medication: any, index: number) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3">
                              <p className="font-medium text-blue-800">{medication.medication}</p>
                              <p className="text-sm text-blue-600">
                                {medication.dosage} - {medication.frequency}
                              </p>
                              <p className="text-sm text-blue-500">
                                Prescribed by: {medication.prescribedBy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Appointment History */}
                <Card>
                  <CardHeader title="Appointment History" />
                  
                  {appointmentsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : patientAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {patientAppointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-600">
                                at {appointment.timeSlot}
                              </span>
                            </div>
                            <Badge variant={getAppointmentStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p><strong>Doctor:</strong> Dr. {typeof appointment.doctor === 'object' 
                              ? `${appointment.doctor.user?.firstName} ${appointment.doctor.user?.lastName}`
                              : 'Doctor Name'
                            }</p>
                            <p><strong>Department:</strong> {typeof appointment.department === 'object' 
                              ? appointment.department.name 
                              : 'Department'
                            }</p>
                            <p><strong>Reason:</strong> {appointment.reason}</p>
                            {appointment.notes && (
                              <p><strong>Notes:</strong> {appointment.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No appointments"
                      description="This patient has no appointment history."
                    />
                  )}
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Patient</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a patient from the list to view their information and appointment history.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Patient Modal */}
        {showEditModal && editingPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Patient Information
              </h3>
              <PatientEditForm
                patient={editingPatient}
                onSave={async (patientData) => {
                  try {
                    // Update user information
                    if (patientData.user) {
                      await adminApi.updateUser(editingPatient.userId, patientData.user);
                    }
                    
                    // Update patient-specific information
                    if (patientData.patient) {
                      await adminApi.updatePatient(editingPatient.id, patientData.patient);
                    }
                    
                    alert('Patient information updated successfully!');
                    setShowEditModal(false);
                    setEditingPatient(null);
                    fetchPatients(); // Refresh the list
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Failed to update patient information');
                  }
                }}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingPatient(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Patient Edit Form Component
function PatientEditForm({ patient, onSave, onCancel }: {
  patient: Patient;
  onSave: (patientData: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    // User data
    firstName: patient.user?.firstName || '',
    lastName: patient.user?.lastName || '',
    email: patient.user?.email || '',
    phone: patient.user?.phone || '',
    
    // Patient data
    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
    gender: (patient.gender as 'male' | 'female' | 'other') || '',
    address: patient.address || '',
    emergencyContact: patient.emergencyContact || '',
    bloodGroup: patient.bloodGroup || '',
    allergies: patient.allergies || '',
    height: patient.height ? patient.height.toString() : '',
    weight: patient.weight ? patient.weight.toString() : '',
    occupation: patient.occupation || '',
    maritalStatus: patient.maritalStatus || '',
    insuranceProvider: patient.insuranceProvider || '',
    insuranceNumber: patient.insuranceNumber || '',
    medicalHistory: patient.medicalHistory || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientData = {
      user: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      },
      patient: {
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female' | 'other',
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        occupation: formData.occupation,
        maritalStatus: formData.maritalStatus,
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
        medicalHistory: formData.medicalHistory
      }
    };

    onSave(patientData);
  };

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Information */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
              className={inputClassName}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Contact Information</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Medical Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className={inputClassName}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className={inputClassName}
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
            <input
              type="text"
              value={formData.insuranceProvider}
              onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Insurance Number</label>
            <input
              type="text"
              value={formData.insuranceNumber}
              onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
              className={inputClassName}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Allergies</label>
            <textarea
              rows={2}
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className={inputClassName}
              placeholder="List any known allergies..."
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Medical History</label>
            <textarea
              rows={3}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className={inputClassName}
              placeholder="Brief medical history..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Patient
        </Button>
      </div>
    </form>
  );
}
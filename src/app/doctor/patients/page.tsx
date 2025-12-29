'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Search, User, FileText, Calendar } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { medicalRecordsApi, appointmentApi, userApi } from '@/lib/api';
import { Patient, MedicalRecord } from '@/types';
import { calculateAge, formatDate } from '@/lib/utils';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get all patients first
      let allPatients = [];
      try {
        const patientsResponse = await userApi.getPatients();
        
        if (patientsResponse.data.success) {
          allPatients = patientsResponse.data.data || [];
        } else {
          throw new Error(patientsResponse.data.error || 'Failed to fetch patients');
        }
      } catch (patientsError) {
        // Fallback: get users and filter for patients
        const usersResponse = await userApi.getUsers();
        const patientUsers = usersResponse.data.filter((user: any) => user.role === 'patient');
        
        allPatients = patientUsers.map((user: any) => ({
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
      }
      
      // Get appointments for this doctor to find which patients they've seen
      const appointmentsResponse = await appointmentApi.getAppointments();
      const doctorAppointments = appointmentsResponse.data.filter((apt: any) => {
        const aptDoctorId = typeof apt.doctorId === 'object' && apt.doctorId 
          ? apt.doctorId._id || apt.doctorId.id
          : apt.doctorId;
        return aptDoctorId === user.roleSpecificId;
      });
      
      // Get unique patient IDs from appointments
      const patientIdsSet = new Set<string>();
      doctorAppointments.forEach((apt: any) => {
        const aptPatientId = typeof apt.patientId === 'object' && apt.patientId 
          ? apt.patientId._id || apt.patientId.id
          : apt.patientId;
        if (aptPatientId) {
          patientIdsSet.add(aptPatientId);
        }
      });
      const patientIds = Array.from(patientIdsSet);
      
      // Filter patients to only those who have appointments with this doctor
      const doctorPatients = allPatients.filter((patient: any) => 
        patientIds.includes(patient.id)
      );
      
      setPatients(doctorPatients);
    } catch (err) {
      setError('Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientRecords = async (patientId: string) => {
    try {
      setRecordsLoading(true);
      const response = await medicalRecordsApi.getPatientRecords(patientId);
      setPatientRecords(response.data || []);
    } catch (err) {
      console.error('Failed to load patient records:', err);
      setPatientRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    fetchPatientRecords(patient.id);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.user?.firstName} ${patient.user?.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) return <Layout userRole="doctor"><LoadingPage /></Layout>;

  return (
    <Layout userRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Search and view medical records of your patients
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader title="Patients" />
              
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
                <div className="space-y-2">
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
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.user?.firstName} {patient.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {patient.dateOfBirth ? (
                              <>Age: {calculateAge(patient.dateOfBirth) ?? 'Unknown'} years</>
                            ) : (
                              'Age: Not provided'
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{patient.bloodGroup}</p>
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
                {/* Patient Info */}
                <Card>
                  <CardHeader title="Patient Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
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
                      <p className="text-sm text-gray-900">{selectedPatient.bloodGroup || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{selectedPatient.user?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                      <p className="text-sm text-gray-900">{selectedPatient.emergencyContact}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{selectedPatient.address}</p>
                    </div>
                    {selectedPatient.allergies && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">Allergies</p>
                        <p className="text-sm text-gray-900">{selectedPatient.allergies}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Medical Records */}
                <Card>
                  <CardHeader title="Medical Records" />
                  
                  {recordsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : patientRecords.length > 0 ? (
                    <div className="space-y-4">
                      {patientRecords.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {new Date(record.visitDate).toLocaleDateString()}
                              </span>
                            </div>
                            <Button size="sm" variant="secondary">
                              View Details
                            </Button>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{record.chiefComplaint}</p>
                          
                          {record.diagnosis && record.diagnosis.length > 0 && (
                            <div className="text-sm">
                              <strong>Diagnosis:</strong> {record.diagnosis.join(', ')}
                            </div>
                          )}
                          
                          {record.treatmentPlan && (
                            <div className="text-sm mt-1">
                              <strong>Treatment:</strong> {record.treatmentPlan}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No medical records"
                      description="No medical records found for this patient."
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
                    Choose a patient from the list to view their information and medical records.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
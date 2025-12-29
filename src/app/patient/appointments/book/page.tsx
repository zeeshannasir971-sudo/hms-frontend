'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { doctorApi, appointmentApi, departmentApi } from '@/lib/api';
import { Doctor, Department } from '@/types';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    departmentId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: '',
    appointmentType: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      fetchDoctors();
    }
  }, [formData.departmentId]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getDepartments();
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to load departments');
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching doctors for department:', formData.departmentId);
      
      // Fetch doctors filtered by department
      const response = await doctorApi.getDoctors(formData.departmentId);
      console.log('Doctors response:', response.data);
      console.log('Number of doctors found:', response.data.length);
      
      setDoctors(response.data);
      
      // Clear selected doctor if it's not in the new filtered list
      if (formData.doctorId && !response.data.find((d: Doctor) => (d._id || d.id) === formData.doctorId)) {
        setFormData(prev => ({ ...prev, doctorId: '' }));
      }
      
      if (response.data.length === 0) {
        setError('No doctors available in this department. Please select another department.');
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await appointmentApi.getAvailableSlots(formData.doctorId, formData.appointmentDate);
      setAvailableSlots(response.data);
    } catch (err) {
      // Generate default time slots if API fails
      const defaultSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
      setAvailableSlots(defaultSlots);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await appointmentApi.createAppointment({
        patientId: user.roleSpecificId,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        appointmentType: formData.appointmentType,
        reason: formData.reason,
        notes: formData.notes,
        status: 'scheduled'
      });

      // Trigger dashboard refresh by setting a flag in localStorage
      localStorage.setItem('dashboardRefresh', Date.now().toString());
      
      // Trigger notification refresh
      localStorage.setItem('notificationRefresh', Date.now().toString());

      router.push('/patient/appointments?success=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (step === 1 && !formData.departmentId) {
      setError('Please select a department');
      return;
    }
    if (step === 2 && !formData.doctorId) {
      setError('Please select a doctor');
      return;
    }
    if (step === 3 && (!formData.appointmentDate || !formData.timeSlot)) {
      setError('Please select date and time');
      return;
    }
    if (step === 4 && (!formData.appointmentType || !formData.reason)) {
      setError('Please fill in appointment type and reason');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  if (loading && step === 1) return <Layout userRole="patient"><LoadingPage /></Layout>;

  return (
    <Layout userRole="patient">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Step {step} of 4: {
              step === 1 ? 'Select Department' :
              step === 2 ? 'Choose Doctor' :
              step === 3 ? 'Pick Date & Time' :
              'Appointment Details & Type'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Step 1: Select Department */}
            {step === 1 && (
              <div className="space-y-4">
                <CardHeader title="Select Department" />
                <div className="grid grid-cols-1 gap-3">
                  {departments.map((department) => (
                    <label key={department._id || department.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="departmentId"
                        value={department._id || department.id}
                        checked={formData.departmentId === (department._id || department.id)}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border rounded-lg ${
                        formData.departmentId === (department._id || department.id)
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <h3 className="font-medium text-gray-900">{department.name}</h3>
                        <p className="text-sm text-gray-600">{department.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Doctor */}
            {step === 2 && (
              <div className="space-y-4">
                <CardHeader title="Choose Doctor" />
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading doctors...</p>
                  </div>
                ) : doctors.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-3">
                      Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} in this department
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {doctors.map((doctor) => (
                        <label key={doctor._id || doctor.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="doctorId"
                            value={doctor._id || doctor.id}
                            checked={formData.doctorId === (doctor._id || doctor.id)}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`p-4 border rounded-lg transition-all duration-200 ${
                            formData.doctorId === (doctor._id || doctor.id)
                              ? 'border-primary-500 bg-primary-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <User className="h-8 w-8 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 text-lg">
                                  Dr. {typeof doctor.userId === 'object' ? doctor.userId.firstName : doctor.firstName} {typeof doctor.userId === 'object' ? doctor.userId.lastName : doctor.lastName}
                                </h3>
                                <p className="text-sm text-blue-600 font-medium mt-1">{doctor.specialization}</p>
                                <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Experience:</span> {doctor.experience} years
                                  </div>
                                  <div>
                                    <span className="font-medium">Consultation Fee:</span> <span className="text-green-600 font-semibold">${doctor.consultationFee}</span>
                                  </div>
                                </div>
                                {doctor.isAvailable ? (
                                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Available
                                  </div>
                                ) : (
                                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Not Available
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No doctors are currently available in this department.
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      Department ID: {formData.departmentId}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={prevStep}
                      className="mt-4"
                    >
                      Choose Different Department
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Pick Date & Time */}
            {step === 3 && (
              <div className="space-y-4">
                <CardHeader title="Select Date & Time" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                {formData.appointmentDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <label key={slot} className="cursor-pointer">
                          <input
                            type="radio"
                            name="timeSlot"
                            value={slot}
                            checked={formData.timeSlot === slot}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`p-2 text-center border rounded ${
                            formData.timeSlot === slot 
                              ? 'border-primary-500 bg-primary-50 text-primary-900 font-medium' 
                              : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}>
                            {slot}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Appointment Details */}
            {step === 4 && (
              <div className="space-y-4">
                <CardHeader title="Appointment Details" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type *
                  </label>
                  <select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select appointment type</option>
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="checkup">Regular Checkup</option>
                    <option value="emergency">Emergency</option>
                    <option value="screening">Health Screening</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="procedure">Medical Procedure</option>
                    <option value="therapy">Therapy Session</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit *
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g., Regular checkup, Follow-up, Consultation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional information or symptoms..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Appointment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Department:</strong> {departments.find(d => (d._id || d.id) === formData.departmentId)?.name}</p>
                    <p><strong>Doctor:</strong> Dr. {(() => {
                      const doctor = doctors.find(d => (d._id || d.id) === formData.doctorId);
                      if (!doctor) return '';
                      return typeof doctor.userId === 'object' 
                        ? `${doctor.userId.firstName} ${doctor.userId.lastName}`
                        : `${doctor.firstName || ''} ${doctor.lastName || ''}`;
                    })()}</p>
                    <p><strong>Date:</strong> {new Date(formData.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {formData.timeSlot}</p>
                    <p><strong>Type:</strong> <span className="text-blue-600 font-medium">{formData.appointmentType ? formData.appointmentType.charAt(0).toUpperCase() + formData.appointmentType.slice(1) : ''}</span></p>
                    <p><strong>Fee:</strong> ${(() => {
                      const doctor = doctors.find(d => (d._id || d.id) === formData.doctorId);
                      return doctor?.consultationFee || 0;
                    })()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Booking...' : 'Book Appointment'}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
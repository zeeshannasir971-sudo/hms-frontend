'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, departmentApi } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    // Doctor specific fields
    specialization: '',
    licenseNumber: '',
    experience: '',
    consultationFee: '',
    departmentId: '',
    // Staff specific fields
    position: '',
    employeeId: '',
    qualification: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch departments when component mounts
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getDepartments();
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate required fields for all roles
    if (!formData.dateOfBirth || !formData.gender || !formData.address || !formData.emergencyContact) {
      setError('Please fill in all required fields (Date of Birth, Gender, Address, Emergency Contact)');
      setLoading(false);
      return;
    }

    // Validate role-specific required fields
    if (formData.role === 'doctor') {
      if (!formData.specialization || !formData.licenseNumber || !formData.experience || !formData.departmentId) {
        setError('Please fill in all doctor-specific fields including department');
        setLoading(false);
        return;
      }
    }

    if (formData.role === 'staff') {
      if (!formData.position || !formData.employeeId) {
        setError('Please fill in all staff-specific fields');
        setLoading(false);
        return;
      }
    }

    try {
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registrationData } = formData;
      const response = await authApi.register(registrationData);
      
      // Check if user needs approval
      if (response.data.user.approvalStatus === 'pending') {
        // Show pending approval message
        alert(`Registration successful! Your ${response.data.user.role} account is pending admin approval. You will be able to log in once an administrator approves your account.`);
        router.push('/login');
        return;
      }
      
      // For approved users (patients), proceed with login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on user role
        const userRole = response.data.user.role;
        switch (userRole) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'doctor':
            router.push('/doctor/dashboard');
            break;
          case 'staff':
            router.push('/staff/dashboard');
            break;
          default:
            router.push('/patient/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white placeholder-gray-500";

  const renderRoleSpecificFields = () => {
    if (formData.role === 'doctor') {
      return (
        <>
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
              Department *
            </label>
            <select
              id="departmentId"
              name="departmentId"
              required
              value={formData.departmentId}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="">Select Department</option>
              {departments.map((department: any) => (
                <option key={department._id || department.id} value={department._id || department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
              Specialization *
            </label>
            <input
              id="specialization"
              name="specialization"
              type="text"
              required
              value={formData.specialization}
              onChange={handleChange}
              className={inputClassName}
              placeholder="e.g., Cardiology, Neurology"
            />
          </div>
          
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
              Medical License Number *
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              required
              value={formData.licenseNumber}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Years of Experience *
              </label>
              <input
                id="experience"
                name="experience"
                type="number"
                required
                min="0"
                value={formData.experience}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div>
              <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                Consultation Fee
              </label>
              <input
                id="consultationFee"
                name="consultationFee"
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>
        </>
      );
    }

    if (formData.role === 'staff') {
      return (
        <>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
              Employee ID *
            </label>
            <input
              id="employeeId"
              name="employeeId"
              type="text"
              required
              value={formData.employeeId}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position *
            </label>
            <select
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="">Select Position</option>
              <option value="receptionist">Receptionist</option>
              <option value="nurse">Nurse</option>
              <option value="technician">Technician</option>
              <option value="administrator">Administrator</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
              Qualification
            </label>
            <input
              id="qualification"
              name="qualification"
              type="text"
              value={formData.qualification}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am registering as *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor (Requires Admin Approval)</option>
                <option value="staff">Hospital Staff (Requires Admin Approval)</option>
              </select>
              {(formData.role === 'doctor' || formData.role === 'staff') && (
                <p className="mt-1 text-xs text-yellow-600">
                  ⚠️ {formData.role === 'doctor' ? 'Doctor' : 'Staff'} accounts require admin approval before you can log in.
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            {/* Basic Personal Information - Required for all roles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                Emergency Contact *
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="tel"
                required
                value={formData.emergencyContact}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            {/* Role-specific fields */}
            {renderRoleSpecificFields()}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
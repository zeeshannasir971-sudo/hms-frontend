'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Clock, BarChart3, Shield, Heart, Stethoscope, UserCheck } from 'lucide-react';

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">HMS</h1>
              <span className="ml-2 text-sm text-gray-500">Hospital Management System</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            Revolutionizing Healthcare
            <span className="text-primary-600"> Management</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive Hospital Management System streamlines operations, improves patient care, 
            and enhances efficiency across all departments of your healthcare facility.
          </p>
        </div>

        {/* Key Features Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Comprehensive Healthcare Solutions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Appointment Management</h4>
              <p className="text-sm text-gray-600">
                Streamlined booking, rescheduling, and tracking of patient appointments with automated reminders
              </p>
            </div>
            
            <div className="card text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Patient Management</h4>
              <p className="text-sm text-gray-600">
                Complete patient records, medical history, and personalized care tracking
              </p>
            </div>
            
            <div className="card text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Queue Management</h4>
              <p className="text-sm text-gray-600">
                Real-time queue monitoring and efficient patient flow management
              </p>
            </div>
            
            <div className="card text-center">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Reports</h4>
              <p className="text-sm text-gray-600">
                Comprehensive reporting and analytics for data-driven decision making
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Our HMS?
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-semibold text-gray-900 mb-6">For Healthcare Providers</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Stethoscope className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Enhanced Patient Care</h5>
                    <p className="text-gray-600">Access complete patient histories and make informed decisions quickly</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Time Efficiency</h5>
                    <p className="text-gray-600">Reduce administrative tasks and focus more on patient care</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart3 className="h-6 w-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Data-Driven Insights</h5>
                    <p className="text-gray-600">Make informed decisions with comprehensive analytics and reporting</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-2xl font-semibold text-gray-900 mb-6">For Patients</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Easy Appointment Booking</h5>
                    <p className="text-gray-600">Book, reschedule, or cancel appointments online with ease</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Reduced Wait Times</h5>
                    <p className="text-gray-600">Real-time queue updates and estimated wait times</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Better Care Coordination</h5>
                    <p className="text-gray-600">Seamless communication between different healthcare providers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Security & Compliance</h3>
              <p className="text-gray-600 mt-2">Your data security and privacy are our top priorities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">HIPAA Compliant</h4>
                <p className="text-sm text-gray-600">Full compliance with healthcare privacy regulations</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h4>
                <p className="text-sm text-gray-600">All data is encrypted in transit and at rest</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access</h4>
                <p className="text-sm text-gray-600">Granular permissions ensure data access control</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Roles Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Designed for Every Healthcare Role
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Patients</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Online appointment booking</li>
                <li>• Medical history access</li>
                <li>• Queue status updates</li>
                <li>• Prescription tracking</li>
              </ul>
            </div>
            
            <div className="card text-center">
              <Stethoscope className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Doctors</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Patient management dashboard</li>
                <li>• Appointment scheduling</li>
                <li>• Medical records access</li>
                <li>• Treatment planning tools</li>
              </ul>
            </div>
            
            <div className="card text-center">
              <UserCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Hospital Staff</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Queue management tools</li>
                <li>• Patient check-in/out</li>
                <li>• Resource scheduling</li>
                <li>• Administrative functions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Healthcare Operations?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare providers who trust our HMS to deliver exceptional patient care 
            and streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Get Started Today
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">HMS - Hospital Management System</h4>
            <p className="text-gray-400 mb-6">
              Empowering healthcare providers with modern, efficient, and secure management solutions.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
              <Link href="/register" className="text-gray-400 hover:text-white">Register</Link>
              <Link href="/login" className="text-gray-400 hover:text-white">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
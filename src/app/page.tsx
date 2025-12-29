'use client';

import Link from 'next/link';
import { Calendar, Users, Clock, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Modern Healthcare
            <span className="text-primary-600"> Management</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Streamline your hospital operations with our comprehensive management system. 
            From appointments to queue management, we've got you covered.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/learn-more" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Appointment Management</h3>
              <p className="mt-2 text-sm text-gray-600">
                Easy booking, rescheduling, and tracking of appointments
              </p>
            </div>
            
            <div className="card text-center">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Queue Management</h3>
              <p className="mt-2 text-sm text-gray-600">
                Real-time queue tracking with estimated wait times
              </p>
            </div>
            
            <div className="card text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Staff Management</h3>
              <p className="mt-2 text-sm text-gray-600">
                Comprehensive doctor and staff management system
              </p>
            </div>
            
            <div className="card text-center">
              <BarChart3 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
              <p className="mt-2 text-sm text-gray-600">
                Detailed insights and reporting for better decisions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { ArrowLeft, Mail, Key, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code, 3: Success
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetCodeFromServer, setResetCodeFromServer] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.resetPassword(formData.email);
      console.log('Reset password response:', response.data); // Debug log
      
      // For demo purposes, the server returns the reset code
      if (response.data && response.data.resetCode) {
        setResetCodeFromServer(response.data.resetCode);
        console.log('Reset code set:', response.data.resetCode); // Debug log
      } else {
        console.log('No reset code in response:', response.data); // Debug log
        // Set a fallback message
        setError('Reset code sent! Check the backend console for the code.');
      }
      setStep(2);
    } catch (err: any) {
      console.error('Reset password error:', err); // Debug log
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await authApi.confirmResetPassword(formData.email, formData.resetCode, formData.newPassword);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const inputClassName = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/login" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Login
          </Link>
          
          {step === 1 && (
            <>
              <div className="text-center">
                <Mail className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Forgot your password?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your email address and we'll send you a reset code.
                </p>
                <p className="mt-1 text-xs text-red-600">
                  Note: Password reset is not available for admin accounts.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <Key className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Enter Reset Code
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a 6-digit code to {formData.email}
                </p>
                {resetCodeFromServer && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold">
                      🔑 <strong>DEMO MODE - Your Reset Code:</strong>
                    </p>
                    <p className="text-2xl font-mono font-bold text-blue-900 mt-2 tracking-widest">
                      {resetCodeFromServer}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Copy this code and enter it below
                    </p>
                  </div>
                )}
                {!resetCodeFromServer && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      🔍 <strong>To get your reset code:</strong>
                    </p>
                    <div className="text-xs text-yellow-700 space-y-1">
                      <p><strong>Option 1:</strong> Open browser console (F12 → Console tab)</p>
                      <p><strong>Option 2:</strong> Check backend terminal/console logs</p>
                      <p><strong>Option 3:</strong> Use this test code: <span className="font-mono bg-yellow-200 px-1 rounded">147143</span></p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Password Reset Successful
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>
            </>
          )}
        </div>

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">
                Reset Code
              </label>
              <input
                id="resetCode"
                name="resetCode"
                type="text"
                required
                maxLength={6}
                value={formData.resetCode}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Enter 6-digit code"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                value={formData.newPassword}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="mt-8">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Clock, User, CheckCircle, XCircle, Eye, Stethoscope, UserCheck } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  approvalStatus: string;
}

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingUsers();
      setPendingUsers(response.data || []);
    } catch (err) {
      setError('Failed to load pending users');
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      await adminApi.approveUser(userId, currentUser.id);
      await fetchPendingUsers();
      alert('User approved successfully!');
    } catch (error: any) {
      alert('Failed to approve user: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(selectedUser.id);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      await adminApi.rejectUser(selectedUser.id, currentUser.id, rejectionReason);
      await fetchPendingUsers();
      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectionReason('');
      alert('User rejected successfully!');
    } catch (error: any) {
      alert('Failed to reject user: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return Stethoscope;
      case 'staff': return UserCheck;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'success';
      case 'staff': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Layout userRole="admin">
        <LoadingPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout userRole="admin">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending User Approvals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve doctor and staff registrations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingUsers.filter(u => u.role === 'doctor').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingUsers.filter(u => u.role === 'staff').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Users List */}
        {pendingUsers.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No Pending Approvals"
            description="All doctor and staff registrations have been processed."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <Card key={user.id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <RoleIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-gray-600">{user.phone}</p>
                          )}
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant={getRoleColor(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Registered: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {actionLoading === user.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRejectModal(true);
                          }}
                          disabled={actionLoading === user.id}
                          className="flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Reject User Registration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  You are about to reject the registration for:
                  <br />
                  <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                  <br />
                  <span className="text-gray-500">{selectedUser.email}</span>
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedUser(null);
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || actionLoading === selectedUser.id}
                  >
                    {actionLoading === selectedUser.id ? 'Rejecting...' : 'Reject User'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Search, User, Plus, Edit, Trash2, UserCheck, UserX, Building } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { adminApi, userApi } from '@/lib/api';
import { Staff } from '@/types';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllStaff();
      setStaff(response.data || []);
    } catch (err) {
      setError('Failed to load staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffStatusToggle = async (staffId: string, currentStatus: boolean) => {
    console.log('Toggling staff status:', { staffId, currentStatus });
    try {
      const updatedStaff = { isActive: !currentStatus };
      console.log('Updating staff with:', updatedStaff);
      await adminApi.updateStaff(staffId, updatedStaff);
      console.log('Staff status toggle successful, refreshing staff...');
      fetchStaff();
    } catch (error: any) {
      console.error('Failed to update staff status:', error);
      alert('Failed to update staff status: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredStaff = staff.filter(staffMember => {
    const searchMatch = searchTerm === '' || 
      `${staffMember.user?.firstName} ${staffMember.user?.lastName} ${staffMember.employeeId} ${staffMember.position}`
        .toLowerCase().includes(searchTerm.toLowerCase());
    
    const positionMatch = positionFilter === 'all' || staffMember.position === positionFilter;
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && staffMember.isActive) ||
      (statusFilter === 'inactive' && !staffMember.isActive);

    return searchMatch && positionMatch && statusMatch;
  });

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'nurse': return 'success';
      case 'receptionist': return 'info';
      case 'technician': return 'warning';
      case 'administrator': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) return <Layout userRole="admin"><LoadingPage /></Layout>;

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage hospital staff members and their information
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff by name, employee ID, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Position:</span>
                <Button
                  variant={positionFilter === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPositionFilter('all')}
                >
                  All ({staff.length})
                </Button>
                <Button
                  variant={positionFilter === 'nurse' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPositionFilter('nurse')}
                >
                  Nurse
                </Button>
                <Button
                  variant={positionFilter === 'receptionist' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPositionFilter('receptionist')}
                >
                  Receptionist
                </Button>
                <Button
                  variant={positionFilter === 'technician' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPositionFilter('technician')}
                >
                  Technician
                </Button>
                <Button
                  variant={positionFilter === 'administrator' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPositionFilter('administrator')}
                >
                  Administrator
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Button
                  variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Staff Table */}
        <Card>
          <CardHeader title={`Staff Members (${filteredStaff.length})`} />
          
          {filteredStaff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((staffMember) => (
                    <tr key={staffMember.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {staffMember.user?.firstName} {staffMember.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{staffMember.user?.email}</div>
                            {staffMember.user?.phone && (
                              <div className="text-sm text-gray-500">{staffMember.user?.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {staffMember.employeeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getPositionColor(staffMember.position)}>
                          {staffMember.position}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staffMember.department?.name || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={staffMember.isActive ? 'success' : 'danger'}>
                          {staffMember.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(staffMember.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => alert('Staff editing functionality coming soon. Use User Management to edit user details.')}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={staffMember.isActive ? 'warning' : 'success'}
                            onClick={() => handleStaffStatusToggle(staffMember.id, staffMember.isActive)}
                          >
                            {staffMember.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={User}
              title="No staff members found"
              description="No staff members match the selected filters."
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
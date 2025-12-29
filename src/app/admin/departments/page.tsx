'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Building, Plus, Edit, Trash2, Users, Phone } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { departmentApi } from '@/lib/api';
import { Department } from '@/types';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head: '',
    location: '',
    contactNumber: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentApi.getDepartments();
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        const departmentId = editingDepartment.id || editingDepartment._id;
        if (!departmentId) {
          alert('Invalid department ID');
          return;
        }
        await departmentApi.updateDepartment(departmentId, formData);
      } else {
        await departmentApi.createDepartment(formData);
      }
      fetchDepartments();
      resetForm();
    } catch (error) {
      alert('Failed to save department');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      head: department.head || '',
      location: department.location || '',
      contactNumber: department.contactNumber || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentApi.updateDepartment(departmentId, { isActive: false });
        fetchDepartments();
      } catch (error) {
        alert('Failed to delete department');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      head: '',
      location: '',
      contactNumber: ''
    });
    setEditingDepartment(null);
    setShowAddForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) return <Layout userRole="admin"><LoadingPage /></Layout>;

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage hospital departments and their information
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card>
            <CardHeader 
              title={editingDepartment ? 'Edit Department' : 'Add New Department'}
              action={
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              }
            />
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Head
                  </label>
                  <input
                    type="text"
                    name="head"
                    value={formData.head}
                    onChange={handleChange}
                    placeholder="Dr. John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Building A, Floor 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDepartment ? 'Update Department' : 'Add Department'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.length > 0 ? (
            departments.map((department) => (
              <Card key={department.id}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-8 w-8 text-primary-600" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {department.name}
                        </h3>
                        <Badge variant={department.isActive ? 'success' : 'danger'}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(department)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => {
                        const departmentId = department.id || department._id;
                        if (departmentId) {
                          handleDelete(departmentId);
                        }
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {department.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {department.head && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Head: {department.head}</span>
                      </div>
                    )}
                    
                    {department.location && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{department.location}</span>
                      </div>
                    )}
                    
                    {department.contactNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{department.contactNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Doctors: 5</span>
                      <span>Patients: 23</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon={Building}
                title="No departments found"
                description="Get started by adding your first department."
                actionLabel="Add Department"
                actionHref="#"
                onAction={() => setShowAddForm(true)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Clock, User, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { queueApi } from '@/lib/api';
import { Queue } from '@/types';

export default function StaffQueuePage() {
  const [queueData, setQueueData] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQueueData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      if (!loading) setRefreshing(true);
      const response = await queueApi.getQueue();
      setQueueData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load queue data');
      setQueueData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (queueId: string, newStatus: string) => {
    try {
      const id = queueId || (queueId as any)._id;
      await queueApi.updateQueueStatus(id, newStatus);
      fetchQueueData();
      
      // Trigger dashboard refresh for all dashboards
      localStorage.setItem('dashboardRefresh', Date.now().toString());
    } catch (error) {
      alert('Failed to update queue status');
    }
  };

  const handleRemoveFromQueue = async (queueId: string) => {
    if (confirm('Are you sure you want to remove this patient from the queue?')) {
      try {
        const id = queueId || (queueId as any)._id;
        await queueApi.removeFromQueue(id);
        fetchQueueData();
        
        // Trigger dashboard refresh for all dashboards
        localStorage.setItem('dashboardRefresh', Date.now().toString());
        
        alert('Patient removed from queue successfully');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to remove patient from queue';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'warning';
      case 'in-consultation': return 'info';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return Clock;
      case 'in-consultation': return UserCheck;
      case 'completed': return UserCheck;
      default: return Clock;
    }
  };

  if (loading) return <Layout userRole="staff"><LoadingPage /></Layout>;

  return (
    <Layout userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor and manage patient queue in real-time
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchQueueData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Queue Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Waiting
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {queueData.filter(q => q.status === 'waiting').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Consultation
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {queueData.filter(q => q.status === 'in-consultation').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {queueData.filter(q => q.status === 'completed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Wait Time
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round(queueData.reduce((acc, q) => acc + q.estimatedWaitTime, 0) / queueData.length || 0)} min
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Queue */}
        <Card>
          <CardHeader title="Current Queue" />
          
          {queueData.length > 0 ? (
            <div className="space-y-4">
              {queueData
                .sort((a, b) => a.position - b.position)
                .map((queueItem) => {
                  const StatusIcon = getStatusIcon(queueItem.status);
                  return (
                    <div key={queueItem.id || queueItem._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-medium">
                            {queueItem.position}
                          </div>
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {typeof queueItem.patient === 'object' 
                                ? `${queueItem.patient.user?.firstName} ${queueItem.patient.user?.lastName}`
                                : 'Patient Name'
                              }
                            </h3>
                            <p className="text-sm text-gray-600">
                              Dr. {typeof queueItem.doctor === 'object' 
                                ? `${queueItem.doctor.user?.firstName} ${queueItem.doctor.user?.lastName}`
                                : 'Doctor Name'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(queueItem.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {queueItem.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Checked in: </span>
                          {new Date(queueItem.checkedInAt).toLocaleTimeString()}
                        </div>
                        <div>
                          <span className="font-medium">Est. wait: </span>
                          {queueItem.estimatedWaitTime} minutes
                        </div>
                        <div>
                          <span className="font-medium">Specialization: </span>
                          {typeof queueItem.doctor === 'object' 
                            ? queueItem.doctor.specialization 
                            : 'Specialization'
                          }
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {queueItem.status === 'waiting' && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleStatusUpdate(queueItem.id || queueItem._id, 'in-consultation')}
                          >
                            Start Consultation
                          </Button>
                        )}
                        {queueItem.status === 'in-consultation' && (
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleStatusUpdate(queueItem.id || queueItem._id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleRemoveFromQueue(queueItem.id || queueItem._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Queue is empty"
              description="No patients are currently in the queue."
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
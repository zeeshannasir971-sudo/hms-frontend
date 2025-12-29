'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotificationCard } from '@/components/patient/NotificationCard';
import { useNotifications } from '@/hooks/useNotifications';

export default function PatientNotificationsPage() {
  const [filter, setFilter] = useState('all');
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return notification.type === filter;
  });

  if (loading) return <Layout userRole="patient"><LoadingPage /></Layout>;

  return (
    <Layout userRole="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-600">
              Stay updated with your healthcare activities
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <Bell className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={notifications.every(n => n.isRead)}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'unread', 'read', 'appointment', 'queue', 'system', 'reminder'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(filterOption)}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader 
            title={`Notifications (${filteredNotifications.length})`}
            action={
              <div className="text-sm text-gray-500">
                {notifications.filter(n => !n.isRead).length} unread
              </div>
            }
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div key={notification.id || notification._id} className="relative">
                  <NotificationCard 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                  />
                  
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!notification.isRead && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id || notification._id || '')}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id || notification._id || '')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={
                filter === 'all' 
                  ? "You don't have any notifications yet." 
                  : `No ${filter} notifications found.`
              }
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}
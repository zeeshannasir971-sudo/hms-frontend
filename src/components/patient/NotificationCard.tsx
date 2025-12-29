import React from 'react';
import { Notification } from '@/types';
import { Bell, Calendar, AlertTriangle, Info, Clock } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'queue':
        return Clock;
      case 'alert':
        return AlertTriangle;
      case 'reminder':
        return Bell;
      default:
        return Info;
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id || notification._id || '');
    }
  };

  const Icon = getIcon(notification.type);

  return (
    <div 
      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        notification.isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
      }`}
      onClick={handleClick}
    >
      <Icon className={`h-5 w-5 mt-0.5 ${getIconColor(notification.priority)}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          notification.isRead ? 'text-gray-900' : 'text-blue-900'
        }`}>
          {notification.title}
        </p>
        <p className={`text-sm ${
          notification.isRead ? 'text-gray-600' : 'text-blue-700'
        }`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
        {!notification.isRead && (
          <p className="text-xs text-blue-600 mt-1 font-medium">
            Click to mark as read
          </p>
        )}
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
      )}
    </div>
  );
};
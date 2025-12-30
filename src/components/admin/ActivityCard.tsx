import React from 'react';
import { Badge } from '../ui/Badge';
import { AuditLog } from '@/types';

interface ActivityCardProps {
  activity: AuditLog;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const getActionVariant = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900">
          {typeof activity.userId === 'object' && activity.userId ? 
            `${activity.userId.firstName} ${activity.userId.lastName}` : 
            activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'Unknown User'
          }
        </p>
        <p className="text-sm text-gray-500">
          {activity.action} - {activity.entity}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(activity.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <Badge variant={getActionVariant(activity.actionType)}>
          {activity.actionType}
        </Badge>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemHealthAlertProps {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: string[];
}

export const SystemHealthAlert: React.FC<SystemHealthAlertProps> = ({ 
  status, 
  message, 
  details = [] 
}) => {
  const getAlertStyles = () => {
    switch (status) {
      case 'healthy':
        return {
          container: 'bg-green-50 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      case 'critical':
        return {
          container: 'bg-red-50 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          textColor: 'text-gray-800'
        };
    }
  };

  const styles = getAlertStyles();
  const Icon = styles.icon;

  return (
    <div className={`border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 ${styles.iconColor}`} />
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${styles.textColor}`}>
            System Health: {status.charAt(0).toUpperCase() + status.slice(1)}
          </h3>
          <p className={`text-sm mt-1 ${styles.textColor}`}>
            {message}
          </p>
          {details.length > 0 && (
            <ul className={`text-sm mt-2 space-y-1 ${styles.textColor}`}>
              {details.map((detail, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
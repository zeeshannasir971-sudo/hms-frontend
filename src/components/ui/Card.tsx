import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ title, action }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        {title}
      </h3>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
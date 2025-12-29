import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { LinkButton, Button } from '../ui/Button';
import { Calendar, FileText, Bell, Download, User } from 'lucide-react';

interface QuickActionsProps {
  onDownloadReport: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onDownloadReport }) => {
  return (
    <Card>
      <CardHeader title="Quick Actions" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LinkButton href="/patient/appointments/book">
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
        </LinkButton>
        
        <LinkButton href="/patient/appointments" variant="secondary">
          <Calendar className="h-4 w-4 mr-2" />
          View Appointments
        </LinkButton>
        
        <LinkButton href="/patient/medical-records" variant="secondary">
          <FileText className="h-4 w-4 mr-2" />
          Medical Records
        </LinkButton>
        
        <Button variant="secondary" onClick={onDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        
        <LinkButton href="/patient/notifications" variant="secondary">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </LinkButton>
        
        <LinkButton href="/patient/profile" variant="secondary">
          <User className="h-4 w-4 mr-2" />
          Update Profile
        </LinkButton>
      </div>
    </Card>
  );
};
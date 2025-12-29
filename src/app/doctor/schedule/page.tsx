'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Calendar, Clock, Settings, Save } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { doctorApi } from '@/lib/api';

export default function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '13:00' },
    sunday: { enabled: false, start: '09:00', end: '13:00' }
  });
  
  const [consultationDuration, setConsultationDuration] = useState(30);
  const [breakTime, setBreakTime] = useState({ start: '12:00', end: '13:00' });
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchDoctorSchedule();
  }, []);

  const fetchDoctorSchedule = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = user.roleSpecificId;
      
      if (doctorId) {
        const response = await doctorApi.getDoctorById(doctorId);
        const doctorData = response.data;
        
        if (doctorData.dutyHours) {
          // Update schedule based on doctor's duty hours
          const updatedSchedule = { ...schedule };
          doctorData.dutyHours.days.forEach((day: string) => {
            if (updatedSchedule[day.toLowerCase() as keyof typeof updatedSchedule]) {
              updatedSchedule[day.toLowerCase() as keyof typeof updatedSchedule] = {
                enabled: true,
                start: doctorData.dutyHours.start,
                end: doctorData.dutyHours.end
              };
            }
          });
          setSchedule(updatedSchedule);
        }
        
        setIsAvailable(doctorData.isAvailable || true);
      }
    } catch (error) {
      console.error('Failed to fetch doctor schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = user.roleSpecificId;
      
      if (doctorId) {
        const enabledDays = Object.entries(schedule)
          .filter(([_, daySchedule]) => daySchedule.enabled)
          .map(([day, _]) => day);
        
        const dutyHours = {
          start: schedule.monday.start, // Use Monday as default start time
          end: schedule.monday.end,     // Use Monday as default end time
          days: enabledDays
        };
        
        await doctorApi.updateDoctor(doctorId, {
          dutyHours,
          isAvailable
        });
        
        alert('Schedule saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <Layout userRole="doctor">
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your working hours and availability
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Availability Status */}
        <Card>
          <CardHeader title="Availability Status" />
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Currently available for appointments
              </span>
            </label>
          </div>
        </Card>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader title="Weekly Schedule" />
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day.key} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-24">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={schedule[day.key as keyof typeof schedule].enabled}
                      onChange={(e) => handleScheduleChange(day.key, 'enabled', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {day.label}
                    </span>
                  </label>
                </div>
                
                {schedule[day.key as keyof typeof schedule].enabled && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={schedule[day.key as keyof typeof schedule].start}
                        onChange={(e) => handleScheduleChange(day.key, 'start', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={schedule[day.key as keyof typeof schedule].end}
                        onChange={(e) => handleScheduleChange(day.key, 'end', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Consultation Settings */}
        <Card>
          <CardHeader title="Consultation Settings" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Duration (minutes)
              </label>
              <select
                value={consultationDuration}
                onChange={(e) => setConsultationDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Break Time */}
        <Card>
          <CardHeader title="Break Time" />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Break from:</label>
              <input
                type="time"
                value={breakTime.start}
                onChange={(e) => setBreakTime(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={breakTime.end}
                onChange={(e) => setBreakTime(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Schedule Preview */}
        <Card>
          <CardHeader title="Schedule Preview" />
          <div className="space-y-2">
            {days.map((day) => {
              const daySchedule = schedule[day.key as keyof typeof schedule];
              return (
                <div key={day.key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-700">{day.label}</span>
                  <span className="text-sm text-gray-600">
                    {daySchedule.enabled 
                      ? `${daySchedule.start} - ${daySchedule.end}` 
                      : 'Not available'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      )}
    </Layout>
  );
}
import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Download, Calendar, Pill } from 'lucide-react';

interface MedicalSummary {
  totalVisits: number;
  lastVisit?: Date;
  commonDiagnoses?: string[];
  currentMedications?: Array<{
    medication: string;
    dosage: string;
  }>;
}

interface MedicalSummaryCardProps {
  medicalSummary: MedicalSummary;
  onDownloadReport: () => void;
}

export const MedicalSummaryCard: React.FC<MedicalSummaryCardProps> = ({ 
  medicalSummary, 
  onDownloadReport 
}) => {
  return (
    <Card>
      <CardHeader
        title="Medical Summary"
        action={
          <Button size="sm" onClick={onDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visit Statistics */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h3 className="font-medium text-gray-900">Visit History</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Total Visits:</span> {medicalSummary.totalVisits}
            </p>
            {medicalSummary.lastVisit && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last Visit:</span> {new Date(medicalSummary.lastVisit).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Pill className="h-5 w-5 text-primary-600" />
            <h3 className="font-medium text-gray-900">Current Medications</h3>
          </div>
          {medicalSummary.currentMedications && medicalSummary.currentMedications.length > 0 ? (
            <div className="space-y-2">
              {medicalSummary.currentMedications.slice(0, 3).map((med, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900">{med.medication}</span>
                  <span className="text-gray-600 ml-2">{med.dosage}</span>
                </div>
              ))}
              {medicalSummary.currentMedications.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{medicalSummary.currentMedications.length - 3} more medications
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No current medications</p>
          )}
        </div>

        {/* Common Diagnoses */}
        {medicalSummary.commonDiagnoses && medicalSummary.commonDiagnoses.length > 0 && (
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-primary-600" />
              <h3 className="font-medium text-gray-900">Common Diagnoses</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalSummary.commonDiagnoses.slice(0, 5).map((diagnosis, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {diagnosis}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
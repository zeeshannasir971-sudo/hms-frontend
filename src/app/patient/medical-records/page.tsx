'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { FileText, Download, Calendar, Upload, Plus, X } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { FileUpload } from '@/components/ui/FileUpload';
import { medicalRecordsApi } from '@/lib/api';
import { MedicalRecord } from '@/types';

export default function PatientMedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await medicalRecordsApi.getPatientRecords(user.roleSpecificId);
      setRecords(response.data || []);
    } catch (err) {
      setError('Failed to load medical records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user.roleSpecificId;

      // Create a medical record entry for uploaded files
      const uploadData = {
        patientId: patientId,
        visitDate: new Date().toISOString(),
        chiefComplaint: 'Patient uploaded medical reports',
        historyOfPresentIllness: `Patient uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
        diagnosis: ['Document Upload'],
        treatmentPlan: 'Files uploaded by patient for review',
        attachments: files.map(file => ({
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          uploadDate: new Date().toISOString()
        }))
      };

      // Save the record to backend
      const response = await medicalRecordsApi.createRecord(uploadData);
      
      alert(`${files.length} file(s) uploaded successfully!`);
      setShowUpload(false);
      fetchMedicalRecords(); // Refresh the records
    } catch (err: any) {
      console.error('Failed to upload files:', err);
      alert(err.response?.data?.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadRecord = async (recordId: string) => {
    try {
      const record = records.find(r => r.id === recordId);
      if (record) {
        const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-record-${record.visitDate.toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download record:', err);
    }
  };

  if (loading) return <Layout userRole="patient"><LoadingPage /></Layout>;

  return (
    <Layout userRole="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your complete medical history and records
            </p>
          </div>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Reports
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader title="Medical Records" />
              
              {records.length > 0 ? (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRecord?.id === record.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {new Date(record.visitDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            handleDownloadRecord(record.id);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {record.chiefComplaint}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {record.diagnosis?.slice(0, 2).map((diagnosis, index) => (
                          <Badge key={index} variant="info" size="sm">
                            {diagnosis}
                          </Badge>
                        ))}
                        {record.diagnosis && record.diagnosis.length > 2 && (
                          <Badge variant="secondary" size="sm">
                            +{record.diagnosis.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No medical records"
                  description="Your medical records will appear here after your visits."
                />
              )}
            </Card>
          </div>

          {/* Record Details */}
          <div className="lg:col-span-2">
            {selectedRecord ? (
              <Card>
                <CardHeader 
                  title="Record Details"
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadRecord(selectedRecord.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  }
                />
                
                <div className="space-y-6">
                  {/* Visit Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Visit Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Visit Date</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedRecord.visitDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Chief Complaint</p>
                        <p className="text-sm text-gray-900">{selectedRecord.chiefComplaint}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  {selectedRecord.vitalSigns && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Vital Signs</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedRecord.vitalSigns).map(([key, value]) => (
                          value && (
                            <div key={key}>
                              <p className="text-sm font-medium text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-sm text-gray-900">{value}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Diagnosis</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecord.diagnosis.map((diagnosis, index) => (
                          <Badge key={index} variant="info">
                            {diagnosis}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment Plan */}
                  {selectedRecord.treatmentPlan && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Treatment Plan</h3>
                      <p className="text-sm text-gray-700">{selectedRecord.treatmentPlan}</p>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Prescriptions</h3>
                      <div className="space-y-3">
                        {selectedRecord.prescriptions.map((prescription, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{prescription.medication}</p>
                                <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration: {prescription.duration}</p>
                                {prescription.instructions && (
                                  <p className="text-sm text-gray-600">Instructions: {prescription.instructions}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Orders */}
                  {selectedRecord.labOrders && selectedRecord.labOrders.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Lab Orders</h3>
                      <div className="space-y-2">
                        {selectedRecord.labOrders.map((lab, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-gray-900">{lab.test}</p>
                              <p className="text-sm text-gray-600">{lab.reason}</p>
                            </div>
                            <Badge variant={lab.urgency === 'urgent' ? 'warning' : 'secondary'}>
                              {lab.urgency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedRecord.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                      <p className="text-sm text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Record</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a medical record from the list to view details.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Upload Medical Reports</h3>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your medical reports, lab results, or other medical documents.
                  </p>
                  
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    multiple={true}
                    maxSize={10}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowUpload(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
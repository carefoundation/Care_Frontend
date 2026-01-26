'use client';

import { useState, useEffect, useRef } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Download, Eye, Plus, Award, Loader2, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';
import CertificateTemplate from '@/components/admin/CertificateTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Certificate {
  _id?: string;
  id?: string;
  volunteerName: string;
  volunteerId?: any;
  certificateType?: string;
  type?: string;
  issueDate?: string;
  createdAt?: string;
  hoursCompleted?: number;
  hoursVolunteered?: number;
}

export default function VolunteerCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await api.get<Certificate[]>('/certificates');
      if (Array.isArray(response)) {
        const formatted = response.map((cert: any) => ({
          id: cert._id || cert.id,
          _id: cert._id,
          volunteerName: cert.volunteerId?.name || cert.volunteerName || 'Unknown',
          volunteerId: cert.volunteerId,
          certificateType: cert.type || cert.certificateType || 'Volunteer Certificate',
          issueDate: cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : 'N/A',
          hoursCompleted: cert.hoursVolunteered || cert.hoursCompleted || 0,
        }));
        setCertificates(formatted);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch certificates:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      setGenerating(certificate._id || 'temp');
      setSelectedCertificate(certificate);
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!certificateRef.current) {
        throw new Error('Certificate reference not found');
      }

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${certificate.volunteerName.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      showToast('Certificate downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to generate certificate', 'error');
    } finally {
      setGenerating(null);
      if (!viewModalOpen) {
        setSelectedCertificate(null);
      }
    }
  };

  const handleViewClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCertificate && selectedCertificate._id) {
      try {
        setUpdating(selectedCertificate._id);
        await api.delete(`/certificates/${selectedCertificate._id}`);
        showToast('Certificate deleted successfully!', 'success');
        await fetchCertificates();
        setSelectedCertificate(null);
        setDeleteModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError) {
          showToast(error.message, 'error');
        } else {
          showToast('Failed to delete certificate', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const columns = [
    {
      header: 'Volunteer Name',
      accessor: 'volunteerName' as keyof Certificate,
    },
    {
      header: 'Certificate Type',
      accessor: 'certificateType' as keyof Certificate,
    },
    {
      header: 'Hours Completed',
      accessor: 'hoursCompleted' as keyof Certificate,
      render: (value: any, row: Certificate) => (
        <span className="font-semibold text-[#10b981]">{value || 0} hrs</span>
      ),
    },
    {
      header: 'Issue Date',
      accessor: 'issueDate' as keyof Certificate,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Certificates</h1>
          <p className="text-gray-600">Issue and manage volunteer certificates</p>
        </div>
        <Link href="/admin/volunteer-certificates/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Issue Certificate
          </Button>
        </Link>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={certificates}
        actions={(row) => (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleViewClick(row)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownload(row)}
              disabled={generating === row._id}
            >
              {generating === row._id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
              disabled={updating === row._id}
              title="Delete"
            >
              {updating === row._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCertificate(null);
        }}
        title="Delete Certificate"
        message={`Are you sure you want to delete this certificate for "${selectedCertificate?.volunteerName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        variant="danger"
      />

      {/* View Modal */}
      {viewModalOpen && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Certificate Preview</h3>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center">
               <div className="scale-75 origin-top">
                  <CertificateTemplate certificate={{
                    volunteerName: selectedCertificate.volunteerName,
                    certificateType: selectedCertificate.certificateType || 'Volunteer Certificate',
                    issueDate: selectedCertificate.issueDate || 'N/A',
                    hoursCompleted: selectedCertificate.hoursCompleted,
                    id: selectedCertificate.id || selectedCertificate._id,
                  }} />
               </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handleDownload(selectedCertificate)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Certificate for Generation */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        {selectedCertificate && (
          <CertificateTemplate ref={certificateRef} certificate={{
            volunteerName: selectedCertificate.volunteerName,
            certificateType: selectedCertificate.certificateType || 'Volunteer Certificate',
            issueDate: selectedCertificate.issueDate || 'N/A',
            hoursCompleted: selectedCertificate.hoursCompleted,
            id: selectedCertificate.id || selectedCertificate._id,
          }} />
        )}
      </div>
    </div>
  );
}


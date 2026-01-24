'use client';

import { useState, useEffect, useRef } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Download, Loader2, Search, Trash2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import VolunteerCard from '@/components/admin/VolunteerCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  profileImage?: string;
  state?: string;
  userId?: {
    name: string;
    email: string;
    mobileNumber: string;
    profileImage?: string;
  };
}

export default function VolunteerCardsPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await api.get<Volunteer[]>('/volunteers?status=approved');
      if (Array.isArray(data)) {
        setVolunteers(data);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
      showToast('Failed to fetch volunteers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = async (volunteer: Volunteer) => {
    try {
      setGenerating(volunteer._id);
      setSelectedVolunteer(volunteer);
      
      // Wait for state update and render
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!cardRef.current) {
        throw new Error('Card reference not found');
      }

      // Generate PDF
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4
      
      // Calculate dimensions to fit nicely on A4
      const imgWidth = 280; // A4 width is ~297mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`volunteer_card_${volunteer.name.replace(/\s+/g, '_')}.pdf`);
      
      showToast('Card downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to generate card', 'error');
    } finally {
      setGenerating(null);
      setSelectedVolunteer(null); // Hide card after generation
    }
  };

  const handleDeleteClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedVolunteer && selectedVolunteer._id) {
      try {
        setUpdating(selectedVolunteer._id);
        await api.delete(`/volunteers/${selectedVolunteer._id}`);
        showToast('Volunteer deleted successfully!', 'success');
        await fetchVolunteers();
        setSelectedVolunteer(null);
        setDeleteModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError) {
          showToast(error.message, 'error');
        } else {
          showToast('Failed to delete volunteer', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Volunteer,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Volunteer,
    },
    {
      header: 'Phone',
      accessor: 'phone' as keyof Volunteer,
    },
    {
      header: 'City',
      accessor: 'city' as keyof Volunteer,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Volunteer,
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Cards</h1>
        <p className="text-gray-600">Generate and download ID cards for approved volunteers</p>
      </div>

      <DataTable
        title=""
        columns={columns}
        data={volunteers}
        actions={(row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleDownloadCard(row)}
              disabled={generating === row._id}
              className="bg-[#10b981] hover:bg-[#059669]"
            >
              {generating === row._id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Card
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
          setSelectedVolunteer(null);
        }}
        title="Delete Volunteer"
        message={`Are you sure you want to delete "${selectedVolunteer?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        variant="danger"
      />

      {/* Hidden Card Container for Generation */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        {selectedVolunteer && (
          <VolunteerCard ref={cardRef} volunteer={selectedVolunteer} />
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EditModal from '@/components/admin/EditModal';
import { Eye, UserCheck, Award, Loader2, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Volunteer {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  hoursVolunteered?: number;
  eventsAttended?: number;
  joinDate?: string;
  createdAt?: string;
  city?: string;
  status?: string;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await api.get<Volunteer[]>('/volunteers?status=approved');
      if (Array.isArray(response)) {
        const formatted = response.map((vol: any) => ({
          id: vol._id || vol.id,
          _id: vol._id,
          name: vol.name || 'Unknown',
          email: vol.email || 'N/A',
          phone: vol.phone || 'N/A',
          hoursVolunteered: vol.hoursVolunteered || 0,
          eventsAttended: vol.eventsAttended || 0,
          joinDate: vol.createdAt ? new Date(vol.createdAt).toLocaleDateString() : 'N/A',
          city: vol.city,
          status: vol.status,
        }));
        setVolunteers(formatted);
      } else {
        setVolunteers([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch volunteers:', error);
      }
      setVolunteers([]);
    } finally {
      setLoading(false);
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

  const handleIssueClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIssueModalOpen(true);
  };

  const handleIssueConfirm = async (data: any) => {
    if (selectedVolunteer && selectedVolunteer._id) {
      try {
        setUpdating(selectedVolunteer._id);
        await api.post('/certificates', {
          volunteerId: selectedVolunteer._id,
          title: data.title,
          hours: Number(data.hours),
          description: data.description,
        });
        showToast('Certificate issued successfully!', 'success');
        setIssueModalOpen(false);
        setSelectedVolunteer(null);
      } catch (error) {
        if (error instanceof ApiError) {
          showToast(error.message, 'error');
        } else {
          showToast('Failed to issue certificate', 'error');
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
      header: 'Hours',
      accessor: 'hoursVolunteered' as keyof Volunteer,
      render: (value: number) => (
        <span className="font-semibold text-[#10b981]">{value} hrs</span>
      ),
    },
    {
      header: 'Events',
      accessor: 'eventsAttended' as keyof Volunteer,
    },
    {
      header: 'Join Date',
      accessor: 'joinDate' as keyof Volunteer,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Volunteers</h1>
        <p className="text-gray-600">View all approved volunteers</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={volunteers}
        actions={(row) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleIssueClick(row)}
              disabled={updating === row._id}
            >
              <Award className="h-4 w-4 mr-1" />
              Certificate
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

      <EditModal
        isOpen={issueModalOpen}
        onClose={() => {
          setIssueModalOpen(false);
          setSelectedVolunteer(null);
        }}
        title={`Issue Certificate for ${selectedVolunteer?.name}`}
        initialData={{ title: 'Certificate of Appreciation', hours: 0, description: '' }}
        fields={[
          { key: 'title', label: 'Certificate Title', type: 'text' },
          { key: 'hours', label: 'Hours Completed', type: 'number' },
          { key: 'description', label: 'Description (Optional)', type: 'textarea' },
        ]}
        onSave={handleIssueConfirm}
      />
    </div>
  );
}


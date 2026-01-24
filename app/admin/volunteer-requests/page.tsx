'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { CheckCircle2, XCircle, Eye, Loader2, Trash2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface VolunteerRequest {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  skills?: string;
  interests?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate?: string;
  createdAt?: string;
  city?: string;
  message?: string;
}

export default function VolunteerRequestsPage() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VolunteerRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Fetch all requests (pending, approved, rejected)
      const response = await api.get<VolunteerRequest[]>('/volunteers');
      if (Array.isArray(response)) {
        const formatted = response.map((req: any) => ({
          id: req._id || req.id,
          _id: req._id,
          name: req.name || 'Unknown',
          email: req.email || 'N/A',
          phone: req.phone || 'N/A',
          skills: req.interests || req.skills || 'N/A',
          status: req.status || 'pending',
          submittedDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A',
          city: req.city,
          message: req.message,
        }));
        setRequests(formatted);
      } else {
        setRequests([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch volunteer requests', 'error');
        console.error('Failed to fetch volunteer requests:', error);
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setUpdating(id);
      await api.put(`/volunteers/${id}`, { status: 'approved' });
      showToast('Volunteer approved successfully!', 'success');
      await fetchRequests();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to approve volunteer', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectClick = (request: VolunteerRequest) => {
    setSelectedRequest(request);
    setConfirmModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedRequest && selectedRequest._id) {
      try {
        setUpdating(selectedRequest._id);
        await api.put(`/volunteers/${selectedRequest._id}`, { status: 'rejected' });
        showToast('Volunteer rejected.', 'info');
        await fetchRequests();
        setSelectedRequest(null);
        setConfirmModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to reject volunteer', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleView = (request: VolunteerRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (request: VolunteerRequest) => {
    setSelectedRequest(request);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRequest && selectedRequest._id) {
      try {
        setUpdating(selectedRequest._id);
        await api.delete(`/volunteers/${selectedRequest._id}`);
        showToast('Volunteer deleted successfully!', 'success');
        await fetchRequests();
        setSelectedRequest(null);
        setDeleteModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to delete volunteer', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof VolunteerRequest,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof VolunteerRequest,
    },
    {
      header: 'Phone',
      accessor: 'phone' as keyof VolunteerRequest,
    },
    {
      header: 'Skills',
      accessor: 'skills' as keyof VolunteerRequest,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof VolunteerRequest,
      render: (value: string) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Submitted',
      accessor: 'submittedDate' as keyof VolunteerRequest,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Rqst Data</h1>
        <p className="text-gray-600">Approve or reject volunteer applications</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={requests}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ],
          },
        ]}
        actions={(row) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row)}
              title="View Details"
              disabled={updating === (row._id || row.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {updating === (row._id || row.id) ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <>
                {row.status === 'pending' && (
                  <Button
                    size="sm"
                    className="bg-[#10b981] hover:bg-[#059669]"
                    onClick={() => handleApprove(row._id || row.id || '')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {row.status !== 'rejected' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectClick(row)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
              disabled={updating === (row._id || row.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {/* View Modal */}
      {selectedRequest && (
        <>
          <ViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedRequest(null);
            }}
            title="Volunteer Request Details"
            data={{
              'Name': selectedRequest.name,
              'Email': selectedRequest.email,
              'Phone': selectedRequest.phone,
              'City': selectedRequest.city || 'N/A',
              'Skills/Interests': selectedRequest.skills || 'N/A',
              'Message': selectedRequest.message || 'N/A',
              'Status': selectedRequest.status,
              'Submitted Date': selectedRequest.submittedDate,
            }}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            onClose={() => {
              setConfirmModalOpen(false);
              setSelectedRequest(null);
            }}
            title="Reject Volunteer"
            message={`Are you sure you want to reject "${selectedRequest.name}"? This action cannot be undone.`}
            onConfirm={handleRejectConfirm}
            confirmText="Reject"
            variant="danger"
          />
          <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedRequest(null);
            }}
            title="Delete Volunteer"
            message={`Are you sure you want to delete "${selectedRequest.name}"? This action cannot be undone and all data will be permanently removed.`}
            onConfirm={handleDeleteConfirm}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}


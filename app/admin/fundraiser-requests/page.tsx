'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { CheckCircle2, XCircle, Eye, Loader2, Trash2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface FundraiserRequest {
  _id?: string;
  id?: string;
  title: string;
  organizer: string;
  createdBy?: any;
  goal: number;
  goalAmount?: number;
  status: 'pending' | 'active' | 'rejected' | 'completed' | 'paused' | 'approved';
  submittedDate?: string;
  createdAt?: string;
  category: string;
  description?: string;
  story?: string;
  image?: string;
  images?: string[];
  documents?: string[];
  location?: string;
  endDate?: string;
  startDate?: string;
  currentAmount?: number;
  donors?: number;
}

export default function FundraiserRequestsPage() {
  const [requests, setRequests] = useState<FundraiserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundraiserRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Fetch all campaigns (pending, active, rejected) - don't filter by status
      const response = await api.get<FundraiserRequest[]>('/campaigns');
      if (Array.isArray(response)) {
        const formatted = response.map((req: any) => ({
          id: req._id || req.id,
          _id: req._id,
          title: req.title || 'Untitled',
          organizer: req.createdBy?.name || req.organizer || 'Unknown',
          createdBy: req.createdBy,
          goal: req.goalAmount || req.goal || 0,
          goalAmount: req.goalAmount || req.goal,
          status: req.status || 'pending',
          submittedDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A',
          category: req.category || 'General',
          description: req.description,
          story: req.story,
          image: req.image,
          images: req.images,
          documents: req.documents,
          location: req.location,
          endDate: req.endDate,
          startDate: req.startDate,
          currentAmount: req.currentAmount || 0,
          donors: req.donors || 0,
        }));
        setRequests(formatted);
      } else {
        setRequests([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch fundraiser requests', 'error');
        console.error('Failed to fetch fundraiser requests:', error);
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setUpdating(id);
      await api.put(`/campaigns/${id}`, { status: 'active' });
      showToast('Fundraiser approved successfully!', 'success');
      await fetchRequests();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to approve fundraiser', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectClick = (request: FundraiserRequest) => {
    setSelectedRequest(request);
    setConfirmModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedRequest && (selectedRequest._id || selectedRequest.id)) {
      try {
        const id = selectedRequest._id || selectedRequest.id;
        setUpdating(String(id));
        await api.put(`/campaigns/${id}`, { status: 'rejected' });
        showToast('Fundraiser rejected.', 'info');
        await fetchRequests();
        setSelectedRequest(null);
        setConfirmModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to reject fundraiser', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleDeleteClick = (request: FundraiserRequest) => {
    setSelectedRequest(request);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRequest && (selectedRequest._id || selectedRequest.id)) {
      try {
        const id = selectedRequest._id || selectedRequest.id;
        setUpdating(String(id));
        await api.delete(`/campaigns/${id}`);
        showToast('Fundraiser deleted successfully!', 'success');
        await fetchRequests();
        setSelectedRequest(null);
        setDeleteModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to delete fundraiser', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleView = async (request: FundraiserRequest) => {
    try {
      // Fetch full campaign details to get all fields
      const id = request._id || request.id;
      if (id) {
        const fullData = await api.get<any>(`/campaigns/${id}`);
        setSelectedRequest({
          ...request,
          ...fullData,
          image: fullData.image,
          images: fullData.images,
          documents: fullData.documents,
          story: fullData.story,
          location: fullData.location,
          endDate: fullData.endDate,
          startDate: fullData.startDate,
          currentAmount: fullData.currentAmount,
          donors: fullData.donors,
        });
      } else {
        setSelectedRequest(request);
      }
      setViewModalOpen(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch campaign details', 'error');
        // Still show what we have
        setSelectedRequest(request);
        setViewModalOpen(true);
      }
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof FundraiserRequest,
    },
    {
      header: 'Organizer',
      accessor: 'organizer' as keyof FundraiserRequest,
    },
    {
      header: 'Goal',
      accessor: 'goal' as keyof FundraiserRequest,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Category',
      accessor: 'category' as keyof FundraiserRequest,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof FundraiserRequest,
      render: (value: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
          active: { label: 'Verified', color: 'bg-green-100 text-green-700' },
          approved: { label: 'Verified', color: 'bg-green-100 text-green-700' },
          rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
          completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
          paused: { label: 'Paused', color: 'bg-orange-100 text-orange-700' },
        };
        const status = statusMap[value] || { label: value, color: 'bg-gray-100 text-gray-700' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      header: 'Submitted',
      accessor: 'submittedDate' as keyof FundraiserRequest,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fundraiser Request</h1>
        <p className="text-gray-600">Approve or reject fundraiser requests</p>
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
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'active', label: 'Verified' },
              { value: 'approved', label: 'Verified' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'completed', label: 'Completed' },
              { value: 'paused', label: 'Paused' },
            ],
          },
          {
            key: 'category',
            label: 'Category',
            options: [
              { value: 'Medical', label: 'Medical' },
              { value: 'Education', label: 'Education' },
              { value: 'Emergency', label: 'Emergency' },
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
              disabled={updating === (row._id || String(row.id))}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {updating === (row._id || String(row.id)) ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <>
                {row.status !== 'active' && row.status !== 'approved' && (
                  <Button
                    size="sm"
                    className="bg-[#10b981] hover:bg-[#059669]"
                    onClick={() => handleApprove(row._id || String(row.id) || '')}
                    disabled={updating === (row._id || String(row.id))}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {row.status !== 'rejected' && row.status !== 'completed' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectClick(row)}
                    disabled={updating === (row._id || String(row.id))}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteClick(row)}
                  disabled={updating === (row._id || String(row.id))}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
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
            title="Fundraiser Request Details"
            data={{
              'Title': selectedRequest.title,
              'Organizer': selectedRequest.organizer,
              'Goal Amount': `₹${(selectedRequest.goalAmount || selectedRequest.goal || 0).toLocaleString()}`,
              'Current Amount': `₹${(selectedRequest.currentAmount || 0).toLocaleString()}`,
              'Category': selectedRequest.category,
              'Short Description': selectedRequest.description || 'N/A',
              'Full Story': selectedRequest.story || 'N/A',
              'Location': selectedRequest.location || 'N/A',
              'Start Date': selectedRequest.startDate ? new Date(selectedRequest.startDate).toLocaleDateString() : 'N/A',
              'End Date': selectedRequest.endDate ? new Date(selectedRequest.endDate).toLocaleDateString() : 'N/A',
              'Donors': selectedRequest.donors?.toString() || '0',
              'Status': selectedRequest.status,
              'Submitted Date': selectedRequest.submittedDate,
              ...(selectedRequest.image ? { 'Campaign Image': selectedRequest.image } : {}),
              ...(selectedRequest.images && selectedRequest.images.length > 0 ? 
                selectedRequest.images.reduce((acc: Record<string, any>, img: string, idx: number) => {
                  acc[`Additional Image ${idx + 1}`] = img;
                  return acc;
                }, {}) : {}),
              ...(selectedRequest.documents && selectedRequest.documents.length > 0 ? 
                selectedRequest.documents.reduce((acc: Record<string, any>, doc: string, idx: number) => {
                  acc[`Document ${idx + 1}`] = doc;
                  return acc;
                }, {}) : {}),
            }}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            onClose={() => {
              setConfirmModalOpen(false);
              setSelectedRequest(null);
            }}
            title="Reject Fundraiser"
            message={`Are you sure you want to reject "${selectedRequest.title}"? This action cannot be undone.`}
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
            title="Delete Fundraiser"
            message={`Are you sure you want to delete "${selectedRequest.title}"? This action cannot be undone and all data will be permanently removed.`}
            onConfirm={handleDeleteConfirm}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}


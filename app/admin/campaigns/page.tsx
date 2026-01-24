'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { CheckCircle2, XCircle, Eye, Loader2, Trash2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface Campaign {
  _id?: string;
  id?: string | number;
  title: string;
  organizer: string;
  createdBy?: any;
  category: string;
  currentAmount: number;
  goalAmount: number;
  donors: number;
  status: 'pending' | 'active' | 'rejected' | 'completed' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  description?: string;
  location?: string;
  image?: string;
  images?: string[];
  documents?: string[];
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get<Campaign[]>('/campaigns');
      if (Array.isArray(response)) {
        const formatted = response.map((campaign: any) => ({
          id: campaign._id || campaign.id,
          _id: campaign._id,
          title: campaign.title || 'Untitled',
          organizer: campaign.createdBy?.name || campaign.organizer || 'Unknown',
          createdBy: campaign.createdBy,
          category: campaign.category || 'General',
          currentAmount: campaign.currentAmount || 0,
          goalAmount: campaign.goalAmount || 0,
          donors: campaign.donors || 0,
          status: campaign.status || 'pending',
          createdAt: campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A',
          description: campaign.description,
          location: campaign.location,
          image: campaign.image,
          images: campaign.images,
          documents: campaign.documents,
        }));
        setCampaigns(formatted);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch campaigns', 'error');
        console.error('Failed to fetch campaigns:', error);
      }
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (id: string | number) => {
    try {
      setUpdating(String(id));
      await api.put(`/campaigns/${id}`, { status: 'active' });
      showToast('Campaign approved successfully!', 'success');
      await fetchCampaigns();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to approve campaign', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };
  
  const handleRejectClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setConfirmModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedCampaign && (selectedCampaign._id || selectedCampaign.id)) {
      try {
        const id = selectedCampaign._id || selectedCampaign.id;
        setUpdating(String(id));
        await api.put(`/campaigns/${id}`, { status: 'rejected' });
        showToast('Campaign rejected.', 'info');
        await fetchCampaigns();
        setSelectedCampaign(null);
        setConfirmModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to reject campaign', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewModalOpen(true);
  };
  
  const columns = [
    {
      header: 'Campaign',
      accessor: 'title' as keyof Campaign,
      render: (value: string, row: Campaign) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      header: 'Organizer',
      accessor: 'organizer' as keyof Campaign,
    },
    {
      header: 'Progress',
      accessor: 'currentAmount' as keyof Campaign,
      render: (value: number, row: Campaign) => {
        const percentage = Math.round((row.currentAmount / row.goalAmount) * 100);
        return (
          <div>
            <div className="w-48 bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-[#10b981] h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              ₹{row.currentAmount.toLocaleString()} / ₹{row.goalAmount.toLocaleString()} ({percentage}%)
            </div>
            <div className="text-xs text-gray-500">{row.donors} donors</div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Campaign,
      render: (value: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
          active: { label: 'Active', color: 'bg-green-100 text-green-700' },
          pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
          rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
          completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
          Approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
          Pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
          Rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
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
      header: 'Created',
      accessor: 'createdAt' as keyof Campaign,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns Management</h1>
        <p className="text-gray-600">Manage and approve all campaigns</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={campaigns}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'active', label: 'Active' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'completed', label: 'Completed' },
            ],
          },
          {
            key: 'category',
            label: 'Category',
            options: [
              { value: 'Medical', label: 'Medical' },
              { value: 'Disaster Relief', label: 'Disaster Relief' },
              { value: 'Education', label: 'Education' },
              { value: 'Health', label: 'Health' },
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
            ) : (row.status === 'pending' || row.status === 'Pending') && (
              <>
                <Button
                  size="sm"
                  className="bg-[#10b981] hover:bg-[#059669]"
                  onClick={() => handleApprove(row._id || row.id || '')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRejectClick(row)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
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
          </div>
        )}
      />

      {/* View Modal */}
      {selectedCampaign && (
        <>
          <ViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedCampaign(null);
            }}
            title="Campaign Details"
            data={{
              'Title': selectedCampaign.title,
              'Organizer': selectedCampaign.organizer,
              'Category': selectedCampaign.category,
              'Description': selectedCampaign.description || 'N/A',
              'Location': selectedCampaign.location || 'N/A',
              'Current Amount': `₹${selectedCampaign.currentAmount.toLocaleString()}`,
              'Goal Amount': `₹${selectedCampaign.goalAmount.toLocaleString()}`,
              'Donors': selectedCampaign.donors.toString(),
              'Status': selectedCampaign.status,
              'Created Date': selectedCampaign.createdAt,
              ...(selectedCampaign.image ? { 'Campaign Image': selectedCampaign.image } : {}),
              ...(selectedCampaign.images && selectedCampaign.images.length > 0 ? { 'Additional Images': selectedCampaign.images } : {}),
              ...(selectedCampaign.documents && selectedCampaign.documents.length > 0 ? { 'Documents': selectedCampaign.documents } : {}),
            }}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            onClose={() => {
              setConfirmModalOpen(false);
              setSelectedCampaign(null);
            }}
            title="Reject Campaign"
            message={`Are you sure you want to reject "${selectedCampaign.title}"? This action cannot be undone.`}
            onConfirm={handleRejectConfirm}
            confirmText="Reject"
            variant="danger"
          />
          <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedCampaign(null);
            }}
            title="Delete Campaign"
            message={`Are you sure you want to delete "${selectedCampaign.title}"? This action cannot be undone and all data will be permanently removed.`}
            onConfirm={handleDeleteConfirm}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}


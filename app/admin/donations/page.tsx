'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import { Eye, Loader2, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Donation {
  _id?: string;
  id?: string;
  donorName: string;
  campaignName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  userId?: any;
  campaignId?: any;
  createdAt?: string;
}

export default function DonationsPage() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/donations');
      const formattedData = data.map((donation: any) => ({
        _id: donation._id,
        id: donation._id,
        donorName: donation.userId?.name || `${donation.firstName || ''} ${donation.lastName || ''}`.trim() || donation.email || 'Anonymous',
        campaignName: donation.campaignId?.title || 'General Donation',
        amount: donation.amount || 0,
        status: donation.status || 'completed',
        date: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        paymentMethod: donation.paymentMethod || 'N/A',
        ...donation,
      }));
      setDonations(formattedData);
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to fetch donations', 'error');
      }
    } finally {
      setLoading(false);
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
      header: 'Donor Name',
      accessor: 'donorName' as keyof Donation,
    },
    {
      header: 'Campaign',
      accessor: 'campaignName' as keyof Donation,
    },
    {
      header: 'Amount',
      accessor: 'amount' as keyof Donation,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Donation,
      render: (value: string) => {
        const statusColors = {
          completed: 'bg-green-100 text-green-700',
          pending: 'bg-yellow-100 text-yellow-700',
          failed: 'bg-red-100 text-red-700',
        };
        const statusLabels = {
          completed: 'Success',
          pending: 'Pending',
          failed: 'Failed',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
            {statusLabels[value as keyof typeof statusLabels] || value}
          </span>
        );
      },
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethod' as keyof Donation,
    },
    {
      header: 'Date',
      accessor: 'date' as keyof Donation,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation Data</h1>
        <p className="text-gray-600">View and manage all donations</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={donations}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
            ],
          },
          {
            key: 'paymentMethod',
            label: 'Payment Method',
            options: [
              { value: 'UPI', label: 'UPI' },
              { value: 'Card', label: 'Card' },
              { value: 'Net Banking', label: 'Net Banking' },
            ],
          },
        ]}
        actions={(row) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDonation(row);
                setViewModalOpen(true);
              }}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDonation(row);
                setDeleteModalOpen(true);
              }}
              title="Delete Donation"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {/* View Modal */}
      {selectedDonation && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedDonation(null);
          }}
          title="Donation Details"
          data={{
            'Donor Name': selectedDonation.donorName,
            'Campaign': selectedDonation.campaignName,
            'Amount': `₹${selectedDonation.amount.toLocaleString()}`,
            'Status': selectedDonation.status,
            'Payment Method': selectedDonation.paymentMethod,
            'Date': selectedDonation.date,
          }}
        />
      )}

      {/* Delete Modal */}
      {selectedDonation && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedDonation(null);
          }}
          title="Delete Donation"
          message={`Are you sure you want to delete this donation of ₹${selectedDonation.amount.toLocaleString()}? This action cannot be undone and all data will be permanently removed.`}
          onConfirm={async () => {
            if (selectedDonation && (selectedDonation._id || selectedDonation.id)) {
              try {
                const id = selectedDonation._id || selectedDonation.id;
                setUpdating(String(id));
                await api.delete(`/donations/${id}`);
                showToast('Donation deleted successfully!', 'success');
                await fetchDonations();
                setSelectedDonation(null);
                setDeleteModalOpen(false);
              } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                  window.location.href = '/login';
                } else {
                  showToast('Failed to delete donation', 'error');
                }
              } finally {
                setUpdating(null);
              }
            }
          }}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import { Eye, Pause, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface LiveFundraiser {
  _id?: string;
  id?: string;
  title: string;
  organizer: string;
  createdBy?: any;
  goal: number;
  goalAmount?: number;
  raised: number;
  currentAmount?: number;
  progress: number;
  startDate?: string;
  createdAt?: string;
  endDate?: string;
  status?: string;
}

export default function FundraiserLivePage() {
  const [fundraisers, setFundraisers] = useState<LiveFundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFundraiser, setSelectedFundraiser] = useState<LiveFundraiser | null>(null);

  useEffect(() => {
    fetchLiveFundraisers();
  }, []);

  const fetchLiveFundraisers = async () => {
    try {
      setLoading(true);
      const data = await api.get<LiveFundraiser[]>('/campaigns?status=active');
      if (Array.isArray(data)) {
        const formatted = data.map((fund: any) => {
          const goal = fund.goalAmount || fund.goal || 0;
          const raised = fund.currentAmount || fund.raised || 0;
          const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0;
          return {
            id: fund._id || fund.id,
            _id: fund._id,
            title: fund.title || 'Untitled',
            organizer: fund.createdBy?.name || fund.organizer || 'Unknown',
            createdBy: fund.createdBy,
            goal,
            goalAmount: goal,
            raised,
            currentAmount: raised,
            progress,
            startDate: fund.createdAt ? new Date(fund.createdAt).toLocaleDateString() : 'N/A',
            endDate: fund.endDate ? new Date(fund.endDate).toLocaleDateString() : 'N/A',
            status: fund.status,
          };
        });
        setFundraisers(formatted);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch live fundraisers:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      setUpdating(id);
      await api.put(`/campaigns/${id}`, { status: 'paused' });
      showToast('Fundraiser paused successfully', 'success');
      await fetchLiveFundraisers();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to pause fundraiser', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setUpdating(id);
      await api.put(`/campaigns/${id}`, { status: 'completed' });
      showToast('Fundraiser completed successfully', 'success');
      await fetchLiveFundraisers();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to complete fundraiser', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteClick = (fundraiser: LiveFundraiser) => {
    setSelectedFundraiser(fundraiser);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedFundraiser && (selectedFundraiser._id || selectedFundraiser.id)) {
      try {
        const id = selectedFundraiser._id || selectedFundraiser.id;
        setUpdating(String(id));
        await api.delete(`/campaigns/${id}`);
        showToast('Fundraiser deleted successfully!', 'success');
        await fetchLiveFundraisers();
        setSelectedFundraiser(null);
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

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof LiveFundraiser,
    },
    {
      header: 'Organizer',
      accessor: 'organizer' as keyof LiveFundraiser,
    },
    {
      header: 'Goal',
      accessor: 'goal' as keyof LiveFundraiser,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Raised',
      accessor: 'raised' as keyof LiveFundraiser,
      render: (value: number) => (
        <span className="font-semibold text-[#10b981]">₹{value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Progress',
      accessor: 'progress' as keyof LiveFundraiser,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#10b981] h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      ),
    },
    {
      header: 'End Date',
      accessor: 'endDate' as keyof LiveFundraiser,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fundraiser Live</h1>
        <p className="text-gray-600">View and manage active live fundraisers</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={fundraisers}
        actions={(row) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {updating === (row._id || String(row.id)) ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePause(row._id || String(row.id) || '')}
                  title="Pause"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#10b981] hover:bg-[#059669]" 
                  onClick={() => handleComplete(row._id || String(row.id) || '')}
                  title="Complete"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteClick(row)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      />
      {selectedFundraiser && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedFundraiser(null);
          }}
          title="Delete Fundraiser"
          message={`Are you sure you want to delete "${selectedFundraiser.title}"? This action cannot be undone and all data will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}


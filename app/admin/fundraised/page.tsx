'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface Fundraiser {
  _id?: string;
  id?: string;
  title: string;
  organizer: string;
  createdBy?: any;
  goal: number;
  goalAmount?: number;
  raised: number;
  currentAmount?: number;
  status: 'completed' | 'active';
  completedDate?: string;
  updatedAt?: string;
}

export default function FundraisedPage() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedFundraisers();
  }, []);

  const fetchCompletedFundraisers = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Fundraiser[] }>('/campaigns?status=completed');
      if (response.success && response.data) {
        const formatted = response.data.map((fund: any) => ({
          id: fund._id || fund.id,
          _id: fund._id,
          title: fund.title || 'Untitled',
          organizer: fund.createdBy?.name || fund.organizer || 'Unknown',
          createdBy: fund.createdBy,
          goal: fund.goalAmount || fund.goal || 0,
          goalAmount: fund.goalAmount || fund.goal,
          raised: fund.currentAmount || fund.raised || 0,
          currentAmount: fund.currentAmount || fund.raised,
          status: fund.status || 'completed',
          completedDate: fund.updatedAt ? new Date(fund.updatedAt).toLocaleDateString() : 'N/A',
        }));
        setFundraisers(formatted);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch completed fundraisers:', error);
      }
    } finally {
      setLoading(false);
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
      accessor: 'title' as keyof Fundraiser,
    },
    {
      header: 'Organizer',
      accessor: 'organizer' as keyof Fundraiser,
    },
    {
      header: 'Goal',
      accessor: 'goal' as keyof Fundraiser,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Raised',
      accessor: 'raised' as keyof Fundraiser,
      render: (value: number) => (
        <span className="font-semibold text-[#10b981]">₹{value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Fundraiser,
      render: (value: string) => (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" />
          {value}
        </span>
      ),
    },
    {
      header: 'Completed Date',
      accessor: 'completedDate' as keyof Fundraiser,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fundraised Data</h1>
        <p className="text-gray-600">View all completed fundraisers</p>
      </div>
      <DataTable title="" columns={columns} data={fundraisers} />
    </div>
  );
}


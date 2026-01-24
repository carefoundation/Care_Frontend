'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import { Plus, Eye, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

interface Celebrity {
  _id?: string;
  id?: string;
  name: string;
  profession?: string;
  socialMedia?: string;
  status: 'active' | 'inactive';
}

export default function CelebritiesPage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCelebrities();
  }, []);

  const fetchCelebrities = async () => {
    try {
      setLoading(true);
      const response = await api.get<Celebrity[]>('/celebrities');
      if (Array.isArray(response)) {
        const formatted = response.map((celebrity: any) => ({
          id: celebrity._id || celebrity.id,
          _id: celebrity._id,
          name: celebrity.name || 'Unknown',
          profession: celebrity.profession || 'N/A',
          socialMedia: celebrity.socialMedia || 'N/A',
          status: celebrity.status || 'active',
        }));
        setCelebrities(formatted);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch celebrities:', error);
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
      header: 'Name',
      accessor: 'name' as keyof Celebrity,
    },
    {
      header: 'Profession',
      accessor: 'profession' as keyof Celebrity,
    },
    {
      header: 'Social Media',
      accessor: 'socialMedia' as keyof Celebrity,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Celebrity,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Celebrities</h1>
          <p className="text-gray-600">Manage celebrity profiles</p>
        </div>
        <Link href="/admin/celebrities/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Celebrity
          </Button>
        </Link>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={celebrities}
        actions={(row) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}


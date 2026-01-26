'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Eye, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Celebrity {
  _id?: string;
  id?: string;
  name: string;
  profession?: string;
  socialMedia?: string;
  bio?: string;
  image?: string;
  status: 'active' | 'inactive';
}

export default function CelebritiesPage() {
  const router = useRouter();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCelebrities();
    
    // Refresh when page gains focus (user returns from create page)
    const handleFocus = () => {
      fetchCelebrities();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchCelebrities = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/celebrities');
      
      // Handle both array and object with data property
      let celebritiesData: any[] = [];
      if (Array.isArray(response)) {
        celebritiesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        celebritiesData = response.data;
      }
      
      const formatted = celebritiesData.map((celebrity: any) => ({
        id: celebrity._id || celebrity.id,
        _id: celebrity._id,
        name: celebrity.name || 'Unknown',
        profession: celebrity.profession || 'N/A',
        socialMedia: celebrity.socialLinks?.instagram || celebrity.socialLinks?.youtube || 'N/A',
        bio: celebrity.bio || '',
        image: celebrity.image || '',
        status: celebrity.status || 'active',
      }));
      setCelebrities(formatted);
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

  const handleView = async (celebrity: Celebrity) => {
    try {
      // Fetch full celebrity data for view
      const id = celebrity._id || celebrity.id;
      if (id) {
        const response = await api.get<any>(`/celebrities/${id}`);
        const fullCelebrity = response.data || response;
        setSelectedCelebrity({
          ...celebrity,
          bio: fullCelebrity.bio || '',
          image: fullCelebrity.image || '',
          socialMedia: fullCelebrity.socialLinks?.instagram || fullCelebrity.socialLinks?.youtube || celebrity.socialMedia,
        });
        setViewModalOpen(true);
      } else {
        setSelectedCelebrity(celebrity);
        setViewModalOpen(true);
      }
    } catch (error) {
      // If fetch fails, show with available data
      setSelectedCelebrity(celebrity);
      setViewModalOpen(true);
    }
  };

  const handleEdit = (celebrity: Celebrity) => {
    const id = celebrity._id || celebrity.id;
    if (id) {
      router.push(`/admin/celebrities/edit/${id}`);
    }
  };

  const handleDeleteClick = (celebrity: Celebrity) => {
    setSelectedCelebrity(celebrity);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCelebrity && selectedCelebrity._id) {
      try {
        setDeleting(selectedCelebrity._id);
        await api.delete(`/celebrities/${selectedCelebrity._id}`);
        showToast(`Celebrity "${selectedCelebrity.name}" deleted successfully`, 'success');
        await fetchCelebrities();
        setSelectedCelebrity(null);
        setConfirmModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to delete celebrity', 'error');
        }
      } finally {
        setDeleting(null);
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
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row)}
              title="View Details"
              disabled={deleting === (row._id || String(row.id))}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row)}
              title="Edit"
              disabled={deleting === (row._id || String(row.id))}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
              disabled={deleting === (row._id || String(row.id))}
              title="Delete"
            >
              {deleting === (row._id || String(row.id)) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      />

      {/* View Modal */}
      {selectedCelebrity && (
        <>
          <ViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedCelebrity(null);
            }}
            title="Celebrity Details"
            data={{
              'Name': selectedCelebrity.name,
              'Profession': selectedCelebrity.profession || 'N/A',
              'Social Media': selectedCelebrity.socialMedia || 'N/A',
              'Bio': selectedCelebrity.bio || 'N/A',
              'Status': selectedCelebrity.status,
            }}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            onClose={() => {
              setConfirmModalOpen(false);
              setSelectedCelebrity(null);
            }}
            title="Delete Celebrity"
            message={`Are you sure you want to delete "${selectedCelebrity.name}"? This action cannot be undone.`}
            onConfirm={handleDeleteConfirm}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}


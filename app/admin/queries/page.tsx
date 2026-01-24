'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import { Mail, Eye, Reply, Loader2, Trash2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Query {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'resolved';
  date: string;
  phone?: string;
  replyMessage?: string;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      // Fetch contact form submissions (formType: 'contact' or 'query')
      const response = await api.get<any[]>('/form-submissions?formType=contact');
      if (Array.isArray(response)) {
        const formatted = response.map((q: any) => ({
          id: q._id || q.id,
          _id: q._id,
          name: q.name || 'Anonymous',
          email: q.email || 'N/A',
          subject: q.subject || 'No Subject',
          message: q.message || 'No message',
          status: q.status === 'new' ? 'new' : q.status === 'replied' ? 'replied' : 'resolved',
          date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A',
          phone: q.phone,
          replyMessage: q.replyMessage,
        }));
        setQueries(formatted);
      } else {
        setQueries([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch queries', 'error');
        console.error('Failed to fetch queries:', error);
      }
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (query: Query) => {
    setSelectedQuery(query);
    setViewModalOpen(true);
  };

  const handleReply = async (query: Query) => {
    const replyMessage = prompt(`Reply to ${query.name} (${query.email}):`);
    if (replyMessage && query._id) {
      try {
        setUpdating(query._id);
        await api.post(`/form-submissions/${query._id}/reply`, { replyMessage });
        showToast(`Reply sent to ${query.email}`, 'success');
        await fetchQueries();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to send reply', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const handleDeleteClick = (query: Query) => {
    setSelectedQuery(query);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedQuery && selectedQuery._id) {
      try {
        setUpdating(selectedQuery._id);
        await api.delete(`/form-submissions/${selectedQuery._id}`);
        showToast('Query deleted successfully!', 'success');
        await fetchQueries();
        setSelectedQuery(null);
        setDeleteModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to delete query', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Query,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Query,
    },
    {
      header: 'Subject',
      accessor: 'subject' as keyof Query,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Query,
      render: (value: string) => {
        const statusColors = {
          new: 'bg-blue-100 text-blue-700',
          replied: 'bg-yellow-100 text-yellow-700',
          resolved: 'bg-green-100 text-green-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Date',
      accessor: 'date' as keyof Query,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Query Mail</h1>
        <p className="text-gray-600">Manage contact form submissions</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={queries}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'new', label: 'New' },
              { value: 'replied', label: 'Replied' },
              { value: 'resolved', label: 'Resolved' },
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReply(row)}
                title="Reply"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
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
      {selectedQuery && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedQuery(null);
          }}
          title="Query Details"
          data={{
            'Name': selectedQuery.name,
            'Email': selectedQuery.email,
            'Phone': selectedQuery.phone || 'N/A',
            'Subject': selectedQuery.subject,
            'Message': selectedQuery.message,
            'Status': selectedQuery.status,
            'Date': selectedQuery.date,
            'Reply': selectedQuery.replyMessage || 'No reply yet',
          }}
        />
      )}

      {/* Delete Modal */}
      {selectedQuery && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedQuery(null);
          }}
          title="Delete Query"
          message={`Are you sure you want to delete the query from "${selectedQuery.name}"? This action cannot be undone and all data will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}


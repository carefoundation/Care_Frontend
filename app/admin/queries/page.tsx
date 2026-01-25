'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import { Mail, Eye, Reply, Loader2, Trash2, X } from 'lucide-react';
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
  formType?: string;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  useEffect(() => {
    fetchQueries(true);
    
    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(() => {
      fetchQueries(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchQueries = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      // Fetch both 'query' (Ask a Question) and 'contact' (Contact) form submissions
      const [queryResponse, contactResponse] = await Promise.all([
        api.get<any[]>('/form-submissions?formType=query').catch(() => []),
        api.get<any[]>('/form-submissions?formType=contact').catch(() => [])
      ]);
      
      const allSubmissions = [
        ...(Array.isArray(queryResponse) ? queryResponse : []),
        ...(Array.isArray(contactResponse) ? contactResponse : [])
      ];
      
      if (allSubmissions.length > 0) {
        // Sort by createdAt timestamp (newest first) before formatting
        allSubmissions.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        const formatted = allSubmissions.map((q: any) => ({
          id: q._id || q.id,
          _id: q._id,
          name: q.name || 'Anonymous',
          email: q.email || 'N/A',
          subject: q.subject || 'No Subject',
          message: q.message || 'No message',
          status: q.status === 'new' ? 'new' : q.status === 'replied' ? 'replied' : q.status === 'resolved' ? 'resolved' : 'new',
          date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A',
          phone: q.phone,
          replyMessage: q.replyMessage,
          formType: q.formType || 'contact',
        }));
        setQueries(formatted);
      } else {
        setQueries([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        // Don't show error toast on auto-refresh
        if (showLoading) {
          showToast('Failed to fetch queries', 'error');
        }
        console.error('Failed to fetch queries:', error);
      }
      if (showLoading) {
        setQueries([]);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleView = (query: Query) => {
    setSelectedQuery(query);
    setViewModalOpen(true);
  };

  const handleReplyClick = (query: Query) => {
    setSelectedQuery(query);
    setReplyMessage('');
    setReplyEmail(query.email || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedQuery || !selectedQuery._id || !replyMessage.trim()) {
      showToast('Please enter a reply message', 'error');
      return;
    }

    if (!replyEmail.trim()) {
      showToast('Please enter recipient email address', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(replyEmail.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setUpdating(selectedQuery._id);
      const response = await api.post(`/form-submissions/${selectedQuery._id}/reply`, { 
        replyMessage: replyMessage.trim(),
        toEmail: replyEmail.trim()
      });
      showToast(`Reply sent successfully to ${replyEmail}`, 'success');
      await fetchQueries(false);
      setReplyModalOpen(false);
      setReplyMessage('');
      setReplyEmail('');
      setSelectedQuery(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to send reply', 'error');
      }
    } finally {
      setUpdating(null);
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
      header: 'Form Type',
      accessor: 'formType' as keyof Query,
      render: (value: string) => {
        const typeColors = {
          query: 'bg-purple-100 text-purple-700',
          contact: 'bg-blue-100 text-blue-700',
        };
        const typeLabels = {
          query: 'Ask a Question',
          contact: 'Contact',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[value as keyof typeof typeColors] || 'bg-gray-100 text-gray-700'}`}>
            {typeLabels[value as keyof typeof typeLabels] || value}
          </span>
        );
      },
    },
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
            key: 'formType',
            label: 'Form Type',
            options: [
              { value: 'query', label: 'Ask a Question' },
              { value: 'contact', label: 'Contact' },
            ],
          },
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
                onClick={() => handleReplyClick(row)}
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
            'Form Type': selectedQuery.formType === 'query' ? 'Ask a Question' : selectedQuery.formType === 'contact' ? 'Contact' : selectedQuery.formType || 'N/A',
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

      {/* Reply Modal */}
      {replyModalOpen && selectedQuery && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={(e) => {
              e.stopPropagation();
              if (!updating) {
                setReplyModalOpen(false);
                setReplyMessage('');
                setReplyEmail('');
                setSelectedQuery(null);
              }
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reply to Query</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedQuery.name} ({selectedQuery.email})
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!updating) {
                      setReplyModalOpen(false);
                      setReplyMessage('');
                      setReplyEmail('');
                      setSelectedQuery(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={updating === selectedQuery._id}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Original Message:</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Subject:</span> {selectedQuery.subject}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={replyEmail}
                      onChange={(e) => setReplyEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                      placeholder="Enter recipient email address"
                      disabled={updating === selectedQuery._id}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email will be sent to this address</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    placeholder="Enter your reply message..."
                    disabled={updating === selectedQuery._id}
                  />
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyModalOpen(false);
                      setReplyMessage('');
                      setReplyEmail('');
                      setSelectedQuery(null);
                    }}
                    disabled={updating === selectedQuery._id}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplySubmit();
                    }}
                    disabled={updating === selectedQuery._id || !replyMessage.trim() || !replyEmail.trim()}
                    className="flex-1"
                  >
                    {updating === selectedQuery._id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Reply className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
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


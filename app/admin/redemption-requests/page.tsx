'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Eye, Loader2, CheckCircle2, XCircle, Ticket, Clock, TrendingUp, Wallet } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface RedemptionRequest {
  _id: string;
  id?: string;
  couponId: {
    _id: string;
    couponCode: string;
    amount: number;
    expiryDate: string;
  };
  partnerId: {
    _id: string;
    name: string;
    email: string;
    bankDetails?: {
      accountNumber?: string;
      accountHolderName?: string;
      ifscCode?: string;
      bankName?: string;
      branchName?: string;
    };
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  paidAt?: string;
  paidBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectionReason?: string;
  processedBy?: string;
}

export default function RedemptionRequestsPage() {
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/coupon-claims/all');
      const data = Array.isArray(response) ? response : (response?.data || []);
      if (Array.isArray(data)) {
        const formatted = data.map((req: any) => ({
          _id: req._id,
          id: req._id,
          couponId: {
            _id: req.couponId?._id || req.couponId,
            couponCode: req.couponId?.couponCode || 'N/A',
            amount: req.couponId?.amount || req.amount || 0,
            expiryDate: req.couponId?.expiryDate || '',
          },
          partnerId: {
            _id: req.partnerId?._id || req.partnerId,
            name: req.partnerId?.name || 'Unknown',
            email: req.partnerId?.email || 'N/A',
            bankDetails: req.partnerId?.bankDetails || null,
          },
          amount: req.amount || 0,
          status: req.status || 'pending',
          requestedAt: req.requestedAt || req.createdAt || new Date().toISOString(),
          reviewedAt: req.reviewedAt,
          reviewedBy: req.reviewedBy,
          paidAt: req.paidAt,
          paidBy: req.paidBy,
          rejectionReason: req.rejectionReason,
          processedBy: req.reviewedBy?.name || req.paidBy?.name || '-',
        }));
        setRequests(formatted);
        
        // Calculate stats
        const total = formatted.length;
        const pending = formatted.filter((r: RedemptionRequest) => r.status === 'pending').length;
        const approved = formatted.filter((r: RedemptionRequest) => r.status === 'approved').length;
        const paid = formatted.filter((r: RedemptionRequest) => r.status === 'paid').length;
        const totalAmount = formatted.reduce((sum: number, r: RedemptionRequest) => sum + r.amount, 0);
        const pendingAmount = formatted
          .filter((r: RedemptionRequest) => r.status === 'pending')
          .reduce((sum: number, r: RedemptionRequest) => sum + r.amount, 0);
        
        setStats({ total, pending, approved, paid, totalAmount, pendingAmount });
      } else {
        setRequests([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch redemption requests', 'error');
        console.error('Failed to fetch requests:', error);
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setUpdating(requestId);
      await api.put(`/coupon-claims/${requestId}/approve`);
      showToast('Redemption request approved successfully!', 'success');
      await fetchRequests();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to approve request', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      setUpdating(selectedRequest._id);
      await api.put(`/coupon-claims/${selectedRequest._id}/reject`, { rejectionReason });
      showToast('Redemption request rejected', 'success');
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to reject request', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleMarkAsPaid = async (requestId: string) => {
    try {
      setUpdating(requestId);
      await api.put(`/coupon-claims/${requestId}/mark-paid`);
      showToast('Redemption request marked as paid successfully!', 'success');
      await fetchRequests();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to mark as paid', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleView = (request: RedemptionRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const handleRejectClick = (request: RedemptionRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const columns = [
    {
      header: 'COUPON CODE',
      accessor: 'couponCode' as keyof RedemptionRequest,
      render: (value: any, row: RedemptionRequest) => (
        <span className="font-mono font-semibold text-[#10b981]">
          {row.couponId?.couponCode || 'N/A'}
        </span>
      ),
    },
    {
      header: 'PARTNER',
      accessor: 'partner' as keyof RedemptionRequest,
      render: (value: any, row: RedemptionRequest) => (
        <div>
          <p className="font-medium text-gray-900">{row.partnerId?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{row.partnerId?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'AMOUNT',
      accessor: 'amount' as keyof RedemptionRequest,
      render: (value: number) => (
        <span className="font-semibold text-gray-900">₹{value.toFixed(2)}</span>
      ),
    },
    {
      header: 'STATUS',
      accessor: 'status' as keyof RedemptionRequest,
      render: (value: string) => {
        const statusConfig = {
          pending: { label: 'PENDING', color: 'bg-yellow-100 text-yellow-700' },
          approved: { label: 'APPROVED', color: 'bg-green-100 text-green-700' },
          rejected: { label: 'REJECTED', color: 'bg-red-100 text-red-700' },
          paid: { label: 'PAID', color: 'bg-purple-100 text-purple-700' },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || { label: value, color: 'bg-gray-100 text-gray-700' };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      header: 'REQUESTED DATE',
      accessor: 'requestedAt' as keyof RedemptionRequest,
      render: (value: string) => formatDate(value),
    },
    {
      header: 'PROCESSED BY',
      accessor: 'processedBy' as keyof RedemptionRequest,
      render: (value: any, row: RedemptionRequest) => (
        <span>{row.processedBy || '-'}</span>
      ),
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Redemption Requests</h1>
        <p className="text-gray-600">Manage partner coupon redemption requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ticket className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Table */}
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
              { value: 'paid', label: 'Paid' },
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
              disabled={updating === row._id}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {updating === row._id ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <>
                {row.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-[#10b981] hover:bg-[#059669] text-white"
                      onClick={() => handleApprove(row._id)}
                      disabled={updating === row._id}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectClick(row)}
                      disabled={updating === row._id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {row.status === 'approved' && (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleMarkAsPaid(row._id)}
                    disabled={updating === row._id}
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Mark as Paid
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      />

      {/* View Modal */}
      {selectedRequest && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedRequest(null);
          }}
          title="Redemption Request Details"
          data={{
            'Coupon Code': selectedRequest.couponId?.couponCode || 'N/A',
            'Partner Name': selectedRequest.partnerId?.name || 'Unknown',
            'Partner Email': selectedRequest.partnerId?.email || 'N/A',
            'Amount': `₹${selectedRequest.amount.toFixed(2)}`,
            'Status': selectedRequest.status.toUpperCase(),
            'Requested Date': formatDate(selectedRequest.requestedAt),
            'Reviewed At': selectedRequest.reviewedAt ? formatDate(selectedRequest.reviewedAt) : '-',
            'Reviewed By': selectedRequest.reviewedBy?.name || '-',
            'Paid At': selectedRequest.paidAt ? formatDate(selectedRequest.paidAt) : '-',
            'Paid By': selectedRequest.paidBy?.name || '-',
            'Rejection Reason': selectedRequest.rejectionReason || '-',
            '--- Bank Details ---': '',
            'Account Holder Name': selectedRequest.partnerId?.bankDetails?.accountHolderName || 'N/A',
            'Account Number': selectedRequest.partnerId?.bankDetails?.accountNumber || 'N/A',
            'IFSC Code': selectedRequest.partnerId?.bankDetails?.ifscCode || 'N/A',
            'Bank Name': selectedRequest.partnerId?.bankDetails?.bankName || 'N/A',
            'Branch Name': selectedRequest.partnerId?.bankDetails?.branchName || 'N/A',
          }}
        />
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => {
          setRejectModalOpen(false);
          setRejectionReason('');
          setSelectedRequest(null);
        }} />
      )}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reject Redemption Request</h2>
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason('');
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">Are you sure you want to reject this redemption request?</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason('');
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || updating === selectedRequest._id}
                >
                  {updating === selectedRequest._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reject'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


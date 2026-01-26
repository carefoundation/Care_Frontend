'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { CheckCircle2, XCircle, Loader2, Eye } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface CouponClaim {
  _id: string;
  id?: string;
  couponId: {
    _id: string;
    code?: string;
    couponCode?: string;
    description?: string;
    discountType?: string;
    discountValue?: number;
    amount?: number;
  };
  partnerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: any;
  paidAt?: string;
  paidBy?: any;
  rejectionReason?: string;
  amount?: number;
  createdAt?: string;
}

export default function CouponClaimsPage() {
  const [claims, setClaims] = useState<CouponClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<CouponClaim | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/coupon-claims');
      const claimsData = response?.data || response || [];
      
      if (Array.isArray(claimsData)) {
        const formatted = claimsData.map((claim: any) => ({
          id: claim._id || claim.id,
          _id: claim._id,
          couponId: claim.couponId || {},
          partnerId: claim.partnerId || {},
          status: claim.status || 'pending',
          requestedAt: claim.requestedAt || claim.createdAt,
          reviewedAt: claim.reviewedAt,
          reviewedBy: claim.reviewedBy,
          paidAt: claim.paidAt,
          paidBy: claim.paidBy,
          rejectionReason: claim.rejectionReason,
          amount: claim.amount,
          createdAt: claim.createdAt || claim.requestedAt,
        }));
        setClaims(formatted);
      } else {
        setClaims([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch coupon claims', 'error');
        console.error('Failed to fetch claims:', error);
      }
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId: string) => {
    try {
      setUpdating(claimId);
      await api.put(`/coupon-claims/${claimId}/approve`);
      showToast('Coupon claim approved successfully!', 'success');
      await fetchClaims();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to approve claim', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectClick = (claim: CouponClaim) => {
    setSelectedClaim(claim);
    setRejectReason('');
    setConfirmModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedClaim || !rejectReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      setUpdating(selectedClaim._id);
      await api.put(`/coupon-claims/${selectedClaim._id}/reject`, { rejectionReason: rejectReason });
      showToast('Coupon claim rejected', 'success');
      await fetchClaims();
      setConfirmModalOpen(false);
      setSelectedClaim(null);
      setRejectReason('');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to reject claim', 'error');
        setConfirmModalOpen(false);
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleView = (claim: CouponClaim) => {
    setSelectedClaim(claim);
    setViewModalOpen(true);
  };

  const columns = [
    {
      header: 'Coupon Code',
      accessor: 'couponId' as keyof CouponClaim,
      render: (value: any) => (
        <span className="font-mono font-semibold text-[#10b981]">
          {value?.code || value?.couponCode || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Partner Name',
      accessor: 'partnerId' as keyof CouponClaim,
      render: (value: any) => value?.name || 'N/A',
    },
    {
      header: 'Partner Email',
      accessor: 'partnerId' as keyof CouponClaim,
      render: (value: any) => value?.email || 'N/A',
    },
    {
      header: 'Amount',
      accessor: 'amount' as keyof CouponClaim,
      render: (value: number, row: CouponClaim) => {
        const amount = value || row.couponId?.amount || row.couponId?.discountValue || 0;
        return `₹${amount}`;
      },
    },
    {
      header: 'Status',
      accessor: 'status' as keyof CouponClaim,
      render: (value: string) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-700',
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
          paid: 'bg-blue-100 text-blue-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Claimed At',
      accessor: 'requestedAt' as keyof CouponClaim,
      render: (value: string, row: CouponClaim) => {
        const date = value || row.createdAt;
        if (!date) return 'N/A';
        const dateObj = new Date(date);
        return (
          <div>
            <div className="text-sm">{dateObj.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{dateObj.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      header: 'Reviewed At',
      accessor: 'reviewedAt' as keyof CouponClaim,
      render: (value: string) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return (
          <div>
            <div className="text-sm">{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      header: 'Paid At',
      accessor: 'paidAt' as keyof CouponClaim,
      render: (value: string) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return (
          <div>
            <div className="text-sm">{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claims Coupon</h1>
          <p className="text-gray-600">View and manage all coupon claims</p>
        </div>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={claims}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'paid', label: 'Paid' },
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
            {row.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(row._id)}
                  disabled={updating === (row._id || row.id)}
                  className="text-green-600 hover:text-green-700"
                  title="Approve"
                >
                  {updating === (row._id || row.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRejectClick(row)}
                  disabled={updating === (row._id || row.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Reject"
                >
                  {updating === (row._id || row.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      />

      {/* View Modal */}
      {selectedClaim && (
        <>
          <ViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedClaim(null);
            }}
            title="Coupon Claim Details"
            data={{
              'Coupon Code': selectedClaim.couponId?.code || selectedClaim.couponId?.couponCode || 'N/A',
              'Description': selectedClaim.couponId?.description || 'N/A',
              'Amount': `₹${selectedClaim.amount || selectedClaim.couponId?.amount || selectedClaim.couponId?.discountValue || 0}`,
              'Partner Name': selectedClaim.partnerId?.name || 'N/A',
              'Partner Email': selectedClaim.partnerId?.email || 'N/A',
              'Status': selectedClaim.status,
              'Claimed At': selectedClaim.requestedAt ? `${new Date(selectedClaim.requestedAt).toLocaleDateString()} ${new Date(selectedClaim.requestedAt).toLocaleTimeString()}` : 'N/A',
              'Reviewed At': selectedClaim.reviewedAt ? `${new Date(selectedClaim.reviewedAt).toLocaleDateString()} ${new Date(selectedClaim.reviewedAt).toLocaleTimeString()}` : 'N/A',
              'Paid At': selectedClaim.paidAt ? `${new Date(selectedClaim.paidAt).toLocaleDateString()} ${new Date(selectedClaim.paidAt).toLocaleTimeString()}` : 'N/A',
              'Rejection Reason': selectedClaim.rejectionReason || 'N/A',
            }}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            onClose={() => {
              setConfirmModalOpen(false);
              setSelectedClaim(null);
              setRejectReason('');
            }}
            title="Reject Coupon Claim"
            message={
              <div className="space-y-4">
                <p>Are you sure you want to reject this coupon claim?</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </div>
            }
            onConfirm={handleRejectConfirm}
            confirmText="Reject"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}

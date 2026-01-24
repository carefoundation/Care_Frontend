'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Ticket, CheckCircle2, XCircle, Clock, Loader2, Eye } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface CouponClaim {
  _id: string;
  couponId: {
    _id: string;
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
  };
  partnerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: any;
  rejectionReason?: string;
}

export default function CouponClaimsPage() {
  const [claims, setClaims] = useState<CouponClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<CouponClaim | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get<CouponClaim[]>('/coupon-claims/pending');
      if (Array.isArray(response)) {
        setClaims(response);
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

  const handleReject = async (claimId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setUpdating(claimId);
      await api.put(`/coupon-claims/${claimId}/reject`, { rejectionReason: reason });
      showToast('Coupon claim rejected', 'success');
      await fetchClaims();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to reject claim', 'error');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleView = (claim: CouponClaim) => {
    setSelectedClaim(claim);
    setViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coupon Claim Requests</h1>
        <p className="text-gray-600">Review and approve/reject partner coupon claims</p>
      </div>

      {claims.length === 0 ? (
        <Card className="p-8 text-center">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pending coupon claims</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {claims.map((claim) => (
            <Card key={claim._id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#10b981] p-2 rounded-lg">
                      <Ticket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {claim.couponId?.code || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Requested by: {claim.partnerId?.name} ({claim.partnerId?.email})
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Coupon Details</p>
                      <p className="font-medium text-gray-900">
                        {claim.couponId?.description || 'No description'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Discount: {claim.couponId?.discountType === 'percentage' 
                          ? `${claim.couponId?.discountValue}%` 
                          : `₹${claim.couponId?.discountValue}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Requested On</p>
                      <p className="font-medium text-gray-900">
                        {new Date(claim.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(claim)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(claim._id)}
                    disabled={updating === claim._id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updating === claim._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(claim._id)}
                    disabled={updating === claim._id}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {updating === claim._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Coupon Claim Details</h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Coupon Code</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.couponId?.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{selectedClaim.couponId?.description || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="text-gray-900">
                    {selectedClaim.couponId?.discountType === 'percentage' 
                      ? `${selectedClaim.couponId?.discountValue}%` 
                      : `₹${selectedClaim.couponId?.discountValue}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Partner Name</p>
                  <p className="text-gray-900">{selectedClaim.partnerId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Partner Email</p>
                  <p className="text-gray-900">{selectedClaim.partnerId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested At</p>
                  <p className="text-gray-900">{new Date(selectedClaim.requestedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    selectedClaim.status === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : selectedClaim.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedClaim.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedClaim._id);
                    setViewModalOpen(false);
                  }}
                  disabled={updating === selectedClaim._id}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleReject(selectedClaim._id);
                    setViewModalOpen(false);
                  }}
                  disabled={updating === selectedClaim._id}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

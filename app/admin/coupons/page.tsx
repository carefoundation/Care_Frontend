'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  couponCode?: string;
  value: number;
  discountValue?: number;
  type: 'percentage' | 'fixed';
  status: 'active' | 'redeemed' | 'expired' | 'used' | 'inactive';
  issuedTo?: string | any;
  userId?: any;
  issuedDate?: string;
  createdAt?: string;
  expiryDate?: string;
  validUntil?: string;
  couponType?: 'regular' | 'donation';
  redeemedBy?: any;
  redeemedAt?: string;
  claims?: any[];
  partnerId?: any;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/coupons');
      const couponData = response?.data || response || [];
      
      if (Array.isArray(couponData)) {
        const formatted = couponData.map((coupon: any) => ({
          id: coupon._id || coupon.id,
          _id: coupon._id,
          code: coupon.code || coupon.couponCode || 'N/A',
          couponCode: coupon.couponCode || coupon.code,
          value: coupon.discountValue || coupon.value || 0,
          discountValue: coupon.discountValue || coupon.value,
          type: coupon.type || coupon.discountType || 'fixed',
          status: coupon.status || 'active',
          issuedTo: coupon.userId?.name || coupon.issuedTo?.name || coupon.issuedTo || 'N/A',
          userId: coupon.userId || coupon.issuedTo,
          issuedDate: coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : 'N/A',
          expiryDate: coupon.expiryDate || coupon.validUntil ? new Date(coupon.expiryDate || coupon.validUntil).toLocaleDateString() : 'N/A',
          createdAt: coupon.createdAt,
          couponType: coupon.couponType || 'regular',
          redeemedBy: coupon.redeemedBy,
          redeemedAt: coupon.redeemedAt,
          claims: coupon.claims || [],
          partnerId: coupon.partnerId,
        }));
        setCoupons(formatted);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to fetch coupons', 'error');
        console.error('Failed to fetch coupons:', error);
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCoupon && selectedCoupon._id) {
      try {
        setUpdating(selectedCoupon._id);
        await api.delete(`/coupons/${selectedCoupon._id}`);
        showToast(`Coupon ${selectedCoupon.code} deleted successfully`, 'success');
        await fetchCoupons();
        setSelectedCoupon(null);
        setConfirmModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to delete coupon', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  const columns = [
    {
      header: 'Coupon Code',
      accessor: 'code' as keyof Coupon,
      render: (value: string) => (
        <span className="font-mono font-semibold text-[#10b981]">{value}</span>
      ),
    },
    {
      header: 'Value',
      accessor: 'value' as keyof Coupon,
      render: (value: number, row: Coupon) => 
        row.type === 'percentage' ? `${value}%` : `₹${value}`,
    },
    {
      header: 'Type',
      accessor: 'type' as keyof Coupon,
      render: (value: string, row: Coupon) => (
        <div>
          <span className="capitalize">{value}</span>
          {row.couponType === 'donation' && (
            <span className="ml-2 text-xs text-gray-500">(Donation)</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Coupon,
      render: (value: string) => {
        const statusColors = {
          active: 'bg-green-100 text-green-700',
          redeemed: 'bg-blue-100 text-blue-700',
          expired: 'bg-red-100 text-red-700',
          used: 'bg-blue-100 text-blue-700',
          inactive: 'bg-gray-100 text-gray-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
            {value === 'used' ? 'redeemed' : value}
          </span>
        );
      },
    },
    {
      header: 'Issued To',
      accessor: 'issuedTo' as keyof Coupon,
      render: (value: any, row: Coupon) => {
        if (typeof value === 'object' && value?.name) {
          return value.name;
        }
        return value || 'N/A';
      },
    },
    {
      header: 'Claimed By',
      accessor: 'redeemedBy' as keyof Coupon,
      render: (value: any, row: Coupon) => {
        if (row.redeemedBy) {
          const claimedBy = typeof row.redeemedBy === 'object' ? row.redeemedBy?.name : row.redeemedBy;
          return claimedBy || 'N/A';
        }
        if (row.claims && row.claims.length > 0) {
          const claim = row.claims[0];
          const partner = claim.partnerId;
          return partner?.name || partner?.email || 'N/A';
        }
        return 'Not Claimed';
      },
    },
    {
      header: 'Created At',
      accessor: 'createdAt' as keyof Coupon,
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
      header: 'Claimed At',
      accessor: 'redeemedAt' as keyof Coupon,
      render: (value: string, row: Coupon) => {
        if (row.redeemedAt) {
          const date = new Date(row.redeemedAt);
          return (
            <div>
              <div className="text-sm">{date.toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
            </div>
          );
        }
        if (row.claims && row.claims.length > 0) {
          const claim = row.claims[0];
          if (claim.requestedAt) {
            const date = new Date(claim.requestedAt);
            return (
              <div>
                <div className="text-sm">{date.toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
              </div>
            );
          }
        }
        return 'N/A';
      },
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate' as keyof Coupon,
      render: (value: string) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coupon Data</h1>
          <p className="text-gray-600">View and manage all coupons</p>
        </div>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={coupons}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'redeemed', label: 'Redeemed' },
              { value: 'expired', label: 'Expired' },
            ],
          },
          {
            key: 'type',
            label: 'Type',
            options: [
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed' },
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
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDeleteClick(row)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      />

      {/* View Modal */}
      {selectedCoupon && (
        <>
          <ViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedCoupon(null);
            }}
            title="Coupon Details"
            data={{
              'Coupon Code': selectedCoupon.code,
              'Value': selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : `₹${selectedCoupon.value}`,
              'Type': selectedCoupon.type,
              'Coupon Type': selectedCoupon.couponType === 'donation' ? 'Donation Coupon' : 'Regular Coupon',
              'Status': selectedCoupon.status === 'used' ? 'redeemed' : selectedCoupon.status,
              'Issued To': typeof selectedCoupon.issuedTo === 'object' ? selectedCoupon.issuedTo?.name : selectedCoupon.issuedTo,
              'Created At': selectedCoupon.createdAt ? `${new Date(selectedCoupon.createdAt).toLocaleDateString()} ${new Date(selectedCoupon.createdAt).toLocaleTimeString()}` : 'N/A',
              'Claimed By': selectedCoupon.redeemedBy ? (typeof selectedCoupon.redeemedBy === 'object' ? selectedCoupon.redeemedBy?.name : selectedCoupon.redeemedBy) : (selectedCoupon.claims && selectedCoupon.claims.length > 0 ? (selectedCoupon.claims[0].partnerId?.name || selectedCoupon.claims[0].partnerId?.email || 'N/A') : 'Not Claimed'),
              'Claimed At': selectedCoupon.redeemedAt ? `${new Date(selectedCoupon.redeemedAt).toLocaleDateString()} ${new Date(selectedCoupon.redeemedAt).toLocaleTimeString()}` : (selectedCoupon.claims && selectedCoupon.claims.length > 0 && selectedCoupon.claims[0].requestedAt ? `${new Date(selectedCoupon.claims[0].requestedAt).toLocaleDateString()} ${new Date(selectedCoupon.claims[0].requestedAt).toLocaleTimeString()}` : 'N/A'),
              'Expiry Date': selectedCoupon.expiryDate ? new Date(selectedCoupon.expiryDate).toLocaleDateString() : 'N/A',
              'Total Claims': selectedCoupon.claims ? selectedCoupon.claims.length.toString() : '0',
            }}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            onClose={() => {
              setConfirmModalOpen(false);
              setSelectedCoupon(null);
            }}
            title="Delete Coupon"
            message={`Are you sure you want to delete coupon ${selectedCoupon.code}? This action cannot be undone.`}
            onConfirm={handleDeleteConfirm}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}


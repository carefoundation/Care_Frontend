'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Eye, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';

interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  value: number;
  discountValue?: number;
  type: 'percentage' | 'fixed';
  status: 'active' | 'redeemed' | 'expired';
  issuedTo?: string;
  userId?: any;
  issuedDate?: string;
  createdAt?: string;
  expiryDate?: string;
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
      const response = await api.get<Coupon[]>('/coupons');
      if (Array.isArray(response)) {
        const formatted = response.map((coupon: any) => ({
          id: coupon._id || coupon.id,
          _id: coupon._id,
          code: coupon.code || 'N/A',
          value: coupon.discountValue || coupon.value || 0,
          discountValue: coupon.discountValue || coupon.value,
          type: coupon.type || 'fixed',
          status: coupon.status || 'active',
          issuedTo: coupon.userId?.name || coupon.issuedTo || 'N/A',
          userId: coupon.userId,
          issuedDate: coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : 'N/A',
          expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'N/A',
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
      render: (value: string) => (
        <span className="capitalize">{value}</span>
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
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Issued To',
      accessor: 'issuedTo' as keyof Coupon,
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate' as keyof Coupon,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coupon Data</h1>
          <p className="text-gray-600">View and manage all coupons</p>
        </div>
        <Link href="/admin/coupons/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
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
              'Status': selectedCoupon.status,
              'Issued To': selectedCoupon.issuedTo,
              'Issued Date': selectedCoupon.issuedDate,
              'Expiry Date': selectedCoupon.expiryDate,
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


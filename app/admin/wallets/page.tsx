'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import { Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface VendorWallet {
  _id?: string;
  id?: string;
  vendorName?: string;
  userId?: any;
  vendorType?: string;
  balance: number;
  totalEarnings?: number;
  pendingSettlement?: number;
  lastSettlement?: string;
  updatedAt?: string;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<VendorWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await api.get<VendorWallet[]>('/wallets');
      if (Array.isArray(response)) {
        const formatted = response.map((wallet: any) => ({
          id: wallet._id || wallet.id,
          _id: wallet._id,
          vendorName: wallet.userId?.name || wallet.vendorName || 'Unknown',
          userId: wallet.userId,
          vendorType: wallet.vendorType || 'Partner',
          balance: wallet.balance || 0,
          totalEarnings: wallet.totalEarnings || 0,
          pendingSettlement: wallet.pendingSettlement || 0,
          lastSettlement: wallet.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString() : 'N/A',
        }));
        setWallets(formatted);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch wallets:', error);
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
      header: 'Vendor Name',
      accessor: 'vendorName' as keyof VendorWallet,
    },
    {
      header: 'Vendor Type',
      accessor: 'vendorType' as keyof VendorWallet,
    },
    {
      header: 'Balance',
      accessor: 'balance' as keyof VendorWallet,
      render: (value: number) => (
        <span className="font-semibold text-[#10b981]">₹{value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Total Earnings',
      accessor: 'totalEarnings' as keyof VendorWallet,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Pending Settlement',
      accessor: 'pendingSettlement' as keyof VendorWallet,
      render: (value: number) => (
        <span className="text-orange-600 font-medium">₹{value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Last Settlement',
      accessor: 'lastSettlement' as keyof VendorWallet,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Wallets</h1>
        <p className="text-gray-600">Manage vendor wallet balances and settlements</p>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={wallets}
        actions={(row) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Settle
            </Button>
            <Button variant="ghost" size="sm">
              <Wallet className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}


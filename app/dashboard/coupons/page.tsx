'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Ticket, Plus, Search, Filter, Copy, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface Coupon {
  id: string;
  _id?: string;
  code: string;
  value: number;
  discountValue?: number;
  type: 'percentage' | 'fixed';
  status: 'active' | 'redeemed' | 'expired';
  issuedTo?: string;
  issuedDate: string;
  expiryDate: string;
}

export default function MyCouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const fetchMyCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/coupons');
      if (Array.isArray(data)) {
        const now = new Date();
        const formatted = data.map((coupon: any) => {
          const expiryDate = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
          let status: 'active' | 'redeemed' | 'expired' = 'active';
          if (coupon.status === 'redeemed' || coupon.isRedeemed) {
            status = 'redeemed';
          } else if (expiryDate && expiryDate < now) {
            status = 'expired';
          }
          
          return {
            id: coupon._id || coupon.id,
            _id: coupon._id,
            code: coupon.code || 'N/A',
            value: coupon.discountValue || coupon.value || 0,
            discountValue: coupon.discountValue || coupon.value,
            type: coupon.type || 'fixed',
            status: status,
            issuedTo: coupon.userId?.name || coupon.issuedTo,
            issuedDate: coupon.createdAt ? new Date(coupon.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
        });
        setCoupons(formatted);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch coupons:', error.message);
      } else {
        console.error('Failed to fetch coupons');
      }
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCoupons = coupons.filter((c) => c.status === 'active').length;
  const redeemedCoupons = coupons.filter((c) => c.status === 'redeemed').length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Coupons</h1>
          <p className="text-gray-600">View and manage your coupons</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Issue Coupon
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Active Coupons</p>
              <p className="text-3xl font-bold">{activeCoupons}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Ticket className="h-8 w-8" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Redeemed</p>
              <p className="text-3xl font-bold text-gray-900">{redeemedCoupons}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Coupons</p>
              <p className="text-3xl font-bold text-gray-900">{coupons.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Ticket className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No coupons found</p>
            </Card>
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Coupon Code</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold font-mono text-[#10b981]">{coupon.code}</p>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      coupon.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : coupon.status === 'redeemed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {coupon.status}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Value</span>
                    <span className="text-lg font-bold text-gray-900">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{coupon.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expires</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {coupon.status === 'active' && (
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


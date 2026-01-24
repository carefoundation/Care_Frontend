'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { Target, Search, Filter, Eye, Edit, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

interface Campaign {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  currentAmount: number;
  goalAmount: number;
  goal?: number;
  donors: number;
  status: 'active' | 'pending' | 'completed' | 'rejected';
  createdAt?: string;
}

export default function MyCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get<Campaign[]>('/campaigns/me');
      if (Array.isArray(response)) {
        const formatted = response.map((campaign: any) => ({
          id: campaign._id || campaign.id,
          _id: campaign._id,
          title: campaign.title || 'Untitled',
          category: campaign.category || 'General',
          currentAmount: campaign.currentAmount || 0,
          goalAmount: campaign.goalAmount || campaign.goal || 0,
          donors: campaign.donors || 0,
          status: campaign.status || 'pending',
          createdAt: campaign.createdAt ? new Date(campaign.createdAt).toISOString().split('T')[0] : 'N/A',
        }));
        setCampaigns(formatted);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch campaigns:', error);
      }
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRaised = campaigns
    .filter((c) => c.status === 'active' || c.status === 'completed')
    .reduce((sum, c) => sum + c.currentAmount, 0);

  const totalGoal = campaigns
    .filter((c) => c.status === 'active' || c.status === 'completed')
    .reduce((sum, c) => sum + c.goalAmount, 0);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Campaigns</h1>
        <p className="text-gray-600">Manage your fundraising campaigns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Raised</p>
              <p className="text-3xl font-bold">₹{totalRaised.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-10 w-10 opacity-80" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">
                {campaigns.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="h-8 w-8 text-[#10b981]" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Donors</p>
              <p className="text-3xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.donors, 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
              placeholder="Search campaigns..."
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No campaigns found</p>
            <Link href="/create-fundraiser">
              <Button>Create Your First Campaign</Button>
            </Link>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => {
            const percentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
            return (
              <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{campaign.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : campaign.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : campaign.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{campaign.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'pending' && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <ProgressBar
                      current={campaign.currentAmount}
                      goal={campaign.goalAmount}
                      showLabel={true}
                    />
                    <div className="flex justify-between items-center mt-4 text-sm">
                      <div>
                        <span className="text-gray-600">Raised: </span>
                        <span className="font-semibold text-gray-900">₹{campaign.currentAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Goal: </span>
                        <span className="font-semibold text-gray-900">₹{campaign.goalAmount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Donors: </span>
                        <span className="font-semibold text-gray-900">{campaign.donors}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}


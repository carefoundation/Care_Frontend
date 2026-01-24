'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Search, Filter, Plus, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CampaignCard from '@/components/campaigns/CampaignCard';
import { api, ApiError } from '@/lib/api';

export default function UrgentCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgentCampaigns, setUrgentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrgentCampaigns();
  }, []);

  const fetchUrgentCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/campaigns?isUrgent=true&status=active');
      if (Array.isArray(data)) {
        const formatted = data.map((campaign: any) => {
          const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
          const daysLeft = endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
          return {
            id: campaign._id || campaign.id,
            title: campaign.title,
            image: campaign.image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80',
            category: campaign.category,
            currentAmount: campaign.currentAmount || 0,
            goalAmount: campaign.goalAmount || 0,
            donors: campaign.donors || 0,
            daysLeft: daysLeft > 0 ? daysLeft : 0,
            location: campaign.location || 'India',
          };
        });
        setUrgentCampaigns(formatted);
      } else {
        setUrgentCampaigns([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch urgent campaigns:', error.message);
      } else {
        console.error('Failed to fetch urgent campaigns');
      }
      setUrgentCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = urgentCampaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Urgent Campaigns</h1>
            <p className="text-gray-600">Manage and view all urgent campaigns</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] transition-all"
            />
          </div>
        </div>

        {/* Urgent Campaigns List */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Urgent Campaigns Found</h3>
            <p className="text-gray-600 mb-6">There are no urgent campaigns at the moment</p>
          </Card>
        )}
      </div>
    </div>
  );
}


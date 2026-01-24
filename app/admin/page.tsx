'use client';

import { useEffect, useState } from 'react';
import { Users, Target, DollarSign, ArrowUp, HeartHandshake, Ticket, Building2, Stethoscope, CheckCircle2, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    totalDonations: 0,
    volunteersCount: 0,
    foodPartners: 0,
    healthPartners: 0,
    couponsGenerated: 0,
    completedCampaigns: 0,
  });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.get<{ stats: typeof stats; recentDonations: any[]; recentCampaigns: any[] }>('/dashboard/admin');
        
        if (data) {
          if (data.stats) {
            setStats({
              totalUsers: data.stats.totalUsers || 0,
              activeCampaigns: data.stats.activeCampaigns || 0,
              totalDonations: data.stats.totalDonations || 0,
              volunteersCount: data.stats.volunteersCount || 0,
              foodPartners: data.stats.foodPartners || 0,
              healthPartners: data.stats.healthPartners || 0,
              couponsGenerated: data.stats.couponsGenerated || 0,
              completedCampaigns: data.stats.completedCampaigns || 0,
            });
          }
          if (data.recentDonations) {
            setRecentDonations(data.recentDonations);
          }
          if (data.recentCampaigns) {
            setRecentCampaigns(data.recentCampaigns);
          }
        }
      } catch (error) {
        if (error instanceof ApiError) {
          // Handle 401 - redirect to login if unauthorized
          if (error.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('userToken');
              window.location.href = '/admin/login';
            }
            return;
          }
          showToast(`Failed to load dashboard: ${error.message}`, 'error');
        } else {
          showToast('Failed to load dashboard statistics', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toLocaleString(),
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Donations',
      value: formatCurrency(stats.totalDonations),
      icon: DollarSign,
      color: 'text-[#10b981]',
      bg: 'bg-[#ecfdf5]',
      gradient: 'from-[#10b981] to-[#059669]',
    },
    {
      title: 'Volunteers Count',
      value: stats.volunteersCount.toLocaleString(),
      icon: HeartHandshake,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Food Partners',
      value: stats.foodPartners.toLocaleString(),
      icon: Building2,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Health Partners',
      value: stats.healthPartners.toLocaleString(),
      icon: Stethoscope,
      color: 'text-red-600',
      bg: 'bg-red-50',
      gradient: 'from-red-500 to-red-600',
    },
    {
      title: 'Coupons Generated',
      value: stats.couponsGenerated.toLocaleString(),
      icon: Ticket,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Completed Campaigns',
      value: stats.completedCampaigns.toLocaleString(),
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
  ];
  
  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const formatActivity = () => {
    const activities: any[] = [];
    
    // Add recent donations
    recentDonations.slice(0, 3).forEach((donation: any) => {
      activities.push({
        action: 'New donation received',
        amount: `₹${(donation.amount || 0).toLocaleString()}`,
        time: formatTimeAgo(donation.createdAt || new Date()),
      });
    });
    
    // Add recent campaigns
    recentCampaigns.slice(0, 2).forEach((campaign: any) => {
      activities.push({
        action: campaign.status === 'active' ? 'Campaign approved' : 'Campaign created',
        campaign: campaign.title || 'Untitled',
        time: formatTimeAgo(campaign.createdAt || new Date()),
      });
    });
    
    return activities.sort((a, b) => {
      const timeA = a.time.includes('minutes') ? 0 : a.time.includes('hours') ? 1 : 2;
      const timeB = b.time.includes('minutes') ? 0 : b.time.includes('hours') ? 1 : 2;
      return timeA - timeB;
    }).slice(0, 5);
  };
  
  if (loading && stats.totalUsers === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/admin/fundraiser-requests">
            <Button variant="outline" className="w-full">Approve Fundraisers</Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" className="w-full">View Reports</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full">Manage Users</Button>
          </Link>
          <Link href="/admin/partner-requests">
            <Button variant="outline" className="w-full">Approve Partners</Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {formatActivity().length > 0 ? (
            formatActivity().map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-2 h-2 bg-[#10b981] rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span>
                  {activity.amount && (
                    <span className="text-[#10b981] font-semibold ml-1">{activity.amount}</span>
                  )}
                  {activity.campaign && (
                    <span className="text-gray-600 ml-1">- {activity.campaign}</span>
                  )}
                  {activity.user && (
                    <span className="text-gray-600 ml-1">- {activity.user}</span>
                  )}
                  {activity.partner && (
                    <span className="text-gray-600 ml-1">- {activity.partner}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}






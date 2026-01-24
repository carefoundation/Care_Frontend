'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Target, Users, Calendar, MapPin, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    totalRaised: 0,
    livesImpacted: 0,
    active: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch all campaigns as projects
      const data = await api.get<any[]>('/campaigns');
      if (Array.isArray(data)) {
        const formatted = data.map((campaign: any) => {
          const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
          const isCompleted = campaign.status === 'completed' || (endDate && endDate < new Date());
          const year = campaign.createdAt ? new Date(campaign.createdAt).getFullYear() : new Date().getFullYear();
          
          return {
            id: campaign._id || campaign.id,
            title: campaign.title || 'Untitled Project',
            image: campaign.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            category: campaign.category || 'General',
            location: campaign.location || 'India',
            date: year.toString(),
            status: isCompleted ? 'completed' : 'ongoing',
            description: campaign.description || campaign.story || 'Project description',
            raised: campaign.currentAmount || 0,
            goal: campaign.goalAmount || 0,
            beneficiaries: campaign.beneficiaries || campaign.donors || 0,
          };
        });
        setProjects(formatted);
        
        // Calculate stats
        const completed = formatted.filter(p => p.status === 'completed').length;
        const active = formatted.filter(p => p.status === 'ongoing').length;
        const totalRaised = formatted.reduce((sum, p) => sum + p.raised, 0);
        const livesImpacted = formatted.reduce((sum, p) => sum + p.beneficiaries, 0);
        
        setStats({
          completed,
          totalRaised,
          livesImpacted,
          active,
        });
      } else {
        setProjects([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch projects:', error.message);
      } else {
        console.error('Failed to fetch projects');
      }
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Target className="h-16 w-16 text-[#10b981] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our ongoing and completed projects that are making a real difference in communities across India.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const progress = project.goal > 0 ? (project.raised / project.goal) * 100 : 0;
            
            return (
              <Card key={project.id} hover className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {project.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 inline mr-1" />
                          Ongoing
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#10b981] bg-[#ecfdf5] px-2 py-1 rounded">
                      {project.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Raised</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(project.raised)} / {formatCurrency(project.goal)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#10b981] h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      {project.beneficiaries > 0 ? `${project.beneficiaries}+` : '0'} beneficiaries
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {project.date}
                    </div>
                  </div>
                  
                  <Link href={`/campaigns/${project.id}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No projects available yet</p>
            <p className="text-gray-400">Check back soon for project listings</p>
          </div>
        )}

        {/* Summary Stats */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Project Impact Summary</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">{stats.completed}+</div>
              <div className="text-green-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{formatCurrency(stats.totalRaised)}+</div>
              <div className="text-green-100">Total Funds Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{stats.livesImpacted > 0 ? `${(stats.livesImpacted / 1000).toFixed(0)}K+` : '0'}</div>
              <div className="text-green-100">Lives Impacted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{stats.active}+</div>
              <div className="text-green-100">Active Projects</div>
            </div>
          </div>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}


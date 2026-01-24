'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Users, Target, CheckCircle, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';

export default function ProjectStoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ livesImpacted: 0, projectsCompleted: 0, fundsRaised: 0, donors: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
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
            location: campaign.location || 'India',
            date: year.toString(),
            status: isCompleted ? 'completed' : 'ongoing',
            description: campaign.description || campaign.story || 'Project description',
            impact: {
              beneficiaries: campaign.beneficiaries || campaign.donors || 0,
              raised: campaign.currentAmount || 0,
              goal: campaign.goalAmount || 0,
            },
          };
        });
        setProjects(formatted);
        
        const completed = formatted.filter(p => p.status === 'completed').length;
        const totalRaised = formatted.reduce((sum, p) => sum + (p.impact.raised || 0), 0);
        const livesImpacted = formatted.reduce((sum, p) => sum + (p.impact.beneficiaries || 0), 0);
        const totalDonors = formatted.reduce((sum, p) => sum + (p.impact.goal || 0), 0);
        
        setStats({
          livesImpacted,
          projectsCompleted: completed,
          fundsRaised: totalRaised,
          donors: totalDonors,
        });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Project Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the real impact of your contributions through our project stories. Each story represents lives changed and communities transformed.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-12">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-full min-h-[300px]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Completed
                        </>
                      ) : (
                        'Ongoing'
                      )}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h2>
                  
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {project.date}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#10b981] mb-1">{project.impact.beneficiaries || 0}</div>
                      <div className="text-xs text-gray-600">Beneficiaries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#10b981] mb-1">₹{(project.impact.raised || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Raised</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#10b981] mb-1">₹{(project.impact.goal || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Goal</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Impact Summary */}
        <Card className="mt-16 p-8 bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Overall Impact</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">{stats.livesImpacted.toLocaleString()}+</div>
              <div className="text-green-100">Lives Impacted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{stats.projectsCompleted}+</div>
              <div className="text-green-100">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">₹{(stats.fundsRaised / 10000000).toFixed(1)}Cr+</div>
              <div className="text-green-100">Funds Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{stats.donors.toLocaleString()}+</div>
              <div className="text-green-100">Donors</div>
            </div>
          </div>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}


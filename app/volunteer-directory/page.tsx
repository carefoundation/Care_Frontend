'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, MapPin, Award, Users, Filter, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';

export default function VolunteerDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      // Only fetch approved volunteers who have certificates
      const data = await api.get<any[]>('/volunteers?status=approved&hasCertificate=true');
      if (Array.isArray(data)) {
        const formatted = data.map((volunteer: any) => ({
          id: volunteer._id || volunteer.id,
          name: volunteer.name || 'Anonymous',
          image: volunteer.profileImage || volunteer.userId?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          location: volunteer.location || volunteer.city || 'India',
          skills: volunteer.skills || [],
          cardNumber: volunteer.cardNumber || 'N/A',
          validUntil: volunteer.validUntil || volunteer.expiryDate || 'N/A',
          rating: volunteer.rating || 5.0,
        }));
        setVolunteers(formatted);
      } else {
        setVolunteers([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch volunteers:', error.message);
      } else {
        console.error('Failed to fetch volunteers');
      }
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  const locations = ['all', ...new Set(volunteers.map(v => v.location.split(',')[0]).filter(Boolean))];

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = selectedLocation === 'all' || volunteer.location.includes(selectedLocation);
    return matchesSearch && matchesLocation;
  });

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
        <div className="text-center mb-12">
          <Users className="h-16 w-16 text-[#10b981] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Volunteer Directory</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our amazing volunteers who are making a difference in communities across India.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <Users className="h-10 w-10 text-[#10b981] mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">{volunteers.length}</div>
            <div className="text-gray-600">Active Volunteers</div>
          </Card>
          <Card className="p-6 text-center">
            <Award className="h-10 w-10 text-[#10b981] mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {volunteers.length}
            </div>
            <div className="text-gray-600">Approved Volunteers</div>
          </Card>
          <Card className="p-6 text-center">
            <MapPin className="h-10 w-10 text-[#10b981] mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">{locations.length - 1}</div>
            <div className="text-gray-600">Cities</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search volunteers by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent appearance-none bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Volunteers Grid */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredVolunteers.length}</span> volunteers
          </p>
        </div>

        {filteredVolunteers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <Card key={volunteer.id} hover className="overflow-hidden text-center">
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={volunteer.image}
                    alt={volunteer.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{volunteer.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="h-3 w-3" />
                    {volunteer.location}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Card: </span>
                      <span className="font-semibold text-gray-900">{volunteer.cardNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Valid until: </span>
                      <span className="font-semibold text-gray-900">{volunteer.validUntil}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {volunteer.skills.slice(0, 2).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#ecfdf5] text-[#10b981] text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {volunteer.skills.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{volunteer.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No volunteers found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}


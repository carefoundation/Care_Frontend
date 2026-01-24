'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/events');
      if (Array.isArray(data)) {
        const now = new Date();
        const upcoming: any[] = [];
        const past: any[] = [];

        data.forEach((event: any) => {
          const eventDate = event.startDateTime ? new Date(event.startDateTime) : (event.startDate ? new Date(event.startDate) : null);
          const formatted = {
            id: event._id || event.id,
            title: event.title || 'Untitled Event',
            image: event.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
            date: event.startDate || (event.startDateTime ? new Date(event.startDateTime).toISOString().split('T')[0] : ''),
            time: event.startDateTime 
              ? `${new Date(event.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${event.endDateTime ? new Date(event.endDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}`
              : '',
            location: event.location || 'India',
            address: event.address || event.location || 'N/A',
            attendees: event.attendees || 0,
            category: event.category || 'General',
            description: event.description || 'Join us for this event',
          };

          if (eventDate && eventDate >= now) {
            upcoming.push(formatted);
          } else {
            past.push(formatted);
          }
        });

        setUpcomingEvents(upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setPastEvents(past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        setUpcomingEvents([]);
        setPastEvents([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch events:', error.message);
      } else {
        console.error('Failed to fetch events');
      }
      setUpcomingEvents([]);
      setPastEvents([]);
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
        <div className="text-center mb-12">
          <Calendar className="h-16 w-16 text-[#10b981] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us at our upcoming events and be part of the change. Together we can make a difference.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
              <Card key={event.id} hover className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#10b981] text-white text-xs font-semibold rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-[#10b981]" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-[#10b981]" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-[#10b981]" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-[#10b981]" />
                      {event.attendees} expected attendees
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">{event.address}</p>
                    <Button variant="outline" className="w-full">
                      Register for Event
                      <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </Button>
                  </div>
                </div>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No upcoming events scheduled</p>
            </div>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    {event.category}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {event.attendees} attendees
                  </div>
                </div>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No past events available</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}


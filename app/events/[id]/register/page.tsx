'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

export default function EventRegisterPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    city: '',
    age: '',
    gender: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      setIsLoggedIn(!!token && token.trim() !== '');
      
      // If not logged in, redirect to login
      if (!token || token.trim() === '') {
        localStorage.setItem('pendingEventRegistration', eventId);
        localStorage.setItem('redirectAfterLogin', `/events/${eventId}/register`);
        showToast('Please login to register for events', 'info');
        router.push('/login');
        return;
      }
    }
    
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, router]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/events/${eventId}`);
      setEvent(data);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          showToast('Event not found', 'error');
          router.push('/events');
        } else {
          showToast(error.message || 'Failed to fetch event', 'error');
        }
      } else {
        showToast('Failed to fetch event', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;

    // Validate form
    if (!registrationForm.fullName || !registrationForm.email || !registrationForm.mobileNumber || !registrationForm.city || !registrationForm.age || !registrationForm.gender) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationForm.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    // Validate age
    const age = parseInt(registrationForm.age);
    if (isNaN(age) || age < 1 || age > 150) {
      showToast('Please enter a valid age', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/event-registrations/register', {
        eventId: event._id || event.id,
        fullName: registrationForm.fullName,
        email: registrationForm.email,
        mobileNumber: registrationForm.mobileNumber,
        city: registrationForm.city,
        age: age,
        gender: registrationForm.gender,
      });

      setRegistrationSuccess(true);
      showToast("You're registered 🎉", 'success');
      
      // Refresh event to update attendee count
      await fetchEvent();
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message || 'Registration failed. Please try again.', 'error');
      } else {
        showToast('Registration failed. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    // Convert 24-hour format (HH:MM) to 12-hour format (HH:MM AM/PM)
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Button onClick={() => router.push('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">You're registered 🎉</h1>
              <p className="text-xl text-gray-600 mb-8">Thank you for registering for {event.title}!</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">Event Details:</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#10b981] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Date</p>
                      <p className="text-gray-600">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                  {(event.time || event.endTime) && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[#10b981] mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">Time</p>
                        <div className="flex flex-col gap-1">
                          {event.time && (
                            <p className="text-gray-600 font-medium">
                              Start: <span className="text-[#10b981] font-semibold">{formatTime(event.time)}</span>
                            </p>
                          )}
                          {event.endTime && (
                            <p className="text-gray-600 font-medium">
                              End: <span className="text-[#10b981] font-semibold">{formatTime(event.endTime)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#10b981] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                      {event.address && (
                        <p className="text-sm text-gray-500 mt-1">{event.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${eventId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event
                </Button>
                <Button
                  onClick={() => router.push('/events')}
                  className="bg-[#10b981] hover:bg-[#059669]"
                >
                  View All Events
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push(`/events/${eventId}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Info Card */}
            <Card className="p-6">
              {event.image && (
                <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#10b981] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">{formatDate(event.startDate)}</p>
                  </div>
                </div>
                  {(event.time || event.endTime) && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-[#10b981] mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">Time</p>
                        <div className="flex flex-col gap-1">
                          {event.time && (
                            <p className="text-gray-600 font-medium">
                              Start: <span className="text-[#10b981] font-semibold">{formatTime(event.time)}</span>
                            </p>
                          )}
                          {event.endTime && (
                            <p className="text-gray-600 font-medium">
                              End: <span className="text-[#10b981] font-semibold">{formatTime(event.endTime)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#10b981] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                    {event.address && (
                      <p className="text-xs text-gray-500 mt-1">{event.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-[#10b981] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Attendees</p>
                    <p className="text-gray-600">
                      {event.attendees || 0} registered
                      {event.expectedAttendees > 0 && ` / ${event.expectedAttendees} expected`}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Registration Form */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Register for Event</h2>
              
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationForm.fullName}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={registrationForm.mobileNumber}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, mobileNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    placeholder="+91 9876543210"
                    maxLength={15}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="150"
                    value={registrationForm.age}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    placeholder="Enter your age"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={registrationForm.gender}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationForm.city}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    placeholder="Enter your city"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/events/${eventId}`)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#10b981] hover:bg-[#059669]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Register
                        <CheckCircle className="ml-2 h-4 w-4 inline" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


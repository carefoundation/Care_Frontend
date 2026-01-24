'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Award, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
}

export default function CreateCertificatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  
  const [formData, setFormData] = useState({
    volunteerId: '',
    title: 'Certificate of Appreciation',
    hours: 0,
    description: '',
  });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>('/volunteers?status=approved');
      if (data && data.data) {
        setVolunteers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
      showToast('Failed to fetch volunteers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.volunteerId) {
      showToast('Please select a volunteer', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/certificates', {
        volunteerId: formData.volunteerId,
        title: formData.title,
        hours: Number(formData.hours),
        description: formData.description,
      });
      showToast('Certificate issued successfully!', 'success');
      router.push('/admin/volunteer-certificates');
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to issue certificate', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:pl-2 transition-all"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Certificates
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Certificate</h1>
        <p className="text-gray-600">Create and issue a new certificate to a volunteer</p>
      </div>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="volunteerId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Volunteer *
            </label>
            <select
              id="volunteerId"
              name="volunteerId"
              value={formData.volunteerId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent bg-white"
            >
              <option value="">Select a volunteer...</option>
              {volunteers.map((vol) => (
                <option key={vol._id} value={vol._id}>
                  {vol.name} ({vol.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="e.g. Certificate of Appreciation"
            />
          </div>

          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
              Hours Completed
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description / Message
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="Enter certificate description or message..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#10b981] hover:bg-[#059669]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Issuing...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Issue Certificate
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

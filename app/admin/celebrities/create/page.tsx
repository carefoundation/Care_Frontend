'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Star, Upload, Loader2, ArrowLeft, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

export default function CreateCelebrityPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    bio: '',
    imageUrl: '',
    instagram: '',
    youtube: '',
  });
  const [youtubePreview, setYoutubePreview] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      const userRole = localStorage.getItem('userRole');
      setIsLoggedIn(!!token);
      setIsAdmin(userRole === 'admin');
      
      if (!token) {
        localStorage.setItem('redirectAfterLogin', '/admin/celebrities/create');
        router.push('/login');
        return;
      }
    }
  }, [router]);

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0`;
      }
    }
    
    // If it's already an embed URL, just add autoplay
    if (url.includes('youtube.com/embed/')) {
      const videoId = url.split('/embed/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
      }
    }
    
    return null;
  };

  // Update YouTube preview when URL changes
  useEffect(() => {
    if (formData.youtube) {
      const embedUrl = getYouTubeEmbedUrl(formData.youtube);
      setYoutubePreview(embedUrl);
    } else {
      setYoutubePreview(null);
    }
  }, [formData.youtube]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const celebrityData = {
        name: formData.name,
        profession: formData.designation || null,
        bio: formData.bio || null,
        image: formData.imageUrl || null,
        socialLinks: {
          instagram: formData.instagram || null,
          youtube: formData.youtube || null,
        },
      };

      await api.post('/celebrities', celebrityData);
      
      if (isAdmin) {
        showToast('Celebrity created successfully!', 'success');
        // Reset form
        setFormData({
          name: '',
          designation: '',
          bio: '',
          imageUrl: '',
          instagram: '',
          youtube: '',
        });
        setYoutubePreview(null);
        // Redirect to celebrities list
        setTimeout(() => {
          router.push('/admin/celebrities');
        }, 1500);
      } else {
        showToast('Admin will contact you within 24 hours.', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        let errorMsg = 'Failed to create celebrity. Please try again.';
        if (error instanceof ApiError) {
          errorMsg = error.message;
          if (error.message.includes('Cannot connect to server') || error.message.includes('ERR_CONNECTION_REFUSED')) {
            errorMsg = 'Backend server is not running. Please start the server on port 5000.';
          }
        }
        showToast(errorMsg, 'error');
        console.error('Celebrity creation error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/celebrities')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Celebrities
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Celebrity</h1>
        <p className="text-gray-600">Create a new celebrity profile</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="Enter celebrity name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="e.g., Actor, Singer, Influencer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="Enter celebrity biography"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-4">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="https://instagram.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube
            </label>
            <input
              type="url"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
            />
            {youtubePreview && (
              <div className="mt-4">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={youtubePreview}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Video will auto-play when saved</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="bg-[#10b981] hover:bg-[#059669]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Create Celebrity
                </>
              )}
            </Button>
            <Button variant="outline" type="button" onClick={() => router.push('/admin/celebrities')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


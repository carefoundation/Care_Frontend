'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Star, Upload, Loader2, ArrowLeft, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

export default function EditCelebrityPage() {
  const router = useRouter();
  const params = useParams();
  const celebrityId = params?.id as string;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
        localStorage.setItem('redirectAfterLogin', `/admin/celebrities/edit/${celebrityId}`);
        router.push('/login');
        return;
      }
    }
  }, [router, celebrityId]);

  useEffect(() => {
    if (celebrityId && isLoggedIn) {
      fetchCelebrity();
    }
  }, [celebrityId, isLoggedIn]);

  const fetchCelebrity = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>(`/celebrities/${celebrityId}`);
      const celebrity = response.data || response;
      
      setFormData({
        name: celebrity.name || '',
        designation: celebrity.profession || '',
        bio: celebrity.bio || '',
        imageUrl: celebrity.image || '',
        instagram: celebrity.socialLinks?.instagram || '',
        youtube: celebrity.socialLinks?.youtube || '',
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to load celebrity data', 'error');
        router.push('/admin/celebrities');
      }
    } finally {
      setLoading(false);
    }
  };

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

      await api.put(`/celebrities/${celebrityId}`, celebrityData);
      
      showToast('Celebrity updated successfully!', 'success');
      setTimeout(() => {
        router.push('/admin/celebrities');
      }, 1500);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        let errorMsg = 'Failed to update celebrity. Please try again.';
        if (error instanceof ApiError) {
          errorMsg = error.message;
        }
        showToast(errorMsg, 'error');
        console.error('Celebrity update error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn || loading) {
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
          variant="outline"
          onClick={() => router.push('/admin/celebrities')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Celebrities
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Celebrity</h1>
        <p className="text-gray-600">Update celebrity profile</p>
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
                  Updating...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Update Celebrity
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


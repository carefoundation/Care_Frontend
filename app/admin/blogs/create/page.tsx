'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BookOpen, Upload, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

const categories = [
  'Tech',
  'Business',
  'AI',
  'News',
  'Health',
  'Education',
  'Lifestyle',
  'Finance',
  'Travel',
  'Food',
  'Sports',
  'Entertainment',
  'Other'
];

export default function CreateBlogPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    tags: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    focusKeywords: '',
    ogImage: '',
    scheduledDate: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      const userRole = localStorage.getItem('userRole');
      setIsLoggedIn(!!token);
      setIsAdmin(userRole === 'admin');
      
      if (!token) {
        localStorage.setItem('redirectAfterLogin', '/admin/blogs/create');
        router.push('/login');
        return;
      }
    }
  }, [router]);

  // Auto-generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Update slug when title changes
  useEffect(() => {
    if (formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.excerpt) {
        showToast('Please fill in all required fields', 'error');
        setIsSubmitting(false);
        return;
      }

      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      // Convert focus keywords string to array
      const focusKeywordsArray = formData.focusKeywords
        ? formData.focusKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0)
        : [];

      const blogData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || null,
        content: formData.excerpt || null, // Use excerpt as content since content field is removed
        image: formData.image || null,
        category: formData.category || null,
        tags: tagsArray,
        status: formData.status,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        focusKeywords: focusKeywordsArray,
        ogImage: formData.ogImage || null,
        publishedAt: formData.status === 'published' 
          ? (formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : new Date().toISOString())
          : null,
      };

      await api.post('/blogs', blogData);
      
      showToast('Blog created successfully!', 'success');
      
      // Reset form
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: '',
        category: '',
        tags: '',
        status: 'draft',
        metaTitle: '',
        metaDescription: '',
        focusKeywords: '',
        ogImage: '',
        scheduledDate: '',
      });
      setImagePreview(null);
      setOgImagePreview(null);
      
      // Redirect to blogs list
      setTimeout(() => {
        router.push('/admin/blogs');
      }, 1500);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        let errorMsg = 'Failed to create blog. Please try again.';
        if (error instanceof ApiError) {
          errorMsg = error.message;
          if (error.message.includes('Cannot connect to server') || error.message.includes('ERR_CONNECTION_REFUSED')) {
            errorMsg = 'Backend server is not running. Please start the server on port 5000.';
          }
        }
        showToast(errorMsg, 'error');
        console.error('Blog creation error:', error);
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
          onClick={() => router.push('/admin/blogs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Blog</h1>
        <p className="text-gray-600">Add a new blog post</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Blog Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Basic Blog Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug / URL <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Auto-generated from title)</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent bg-gray-50"
                placeholder="blog-url-slug"
              />
              <p className="text-xs text-gray-500 mt-1">URL: /blogs/{formData.slug || 'your-slug'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description / Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                maxLength={200}
                value={formData.excerpt}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setFormData({ ...formData, excerpt: e.target.value });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="Brief description of the blog (shown in listings)"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Category & Tags */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Category & Tags (SEO + Organization)</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated keywords)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="technology, web development, tutorial"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent appearance-none bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {formData.status === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                />
              </div>
            )}
          </div>
        </Card>

        {/* SEO Fields */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. SEO Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="SEO description for search engines"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.focusKeywords}
                onChange={(e) => setFormData({ ...formData, focusKeywords: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-gray-500 mt-1">Main keywords for SEO optimization</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OG Image URL (for social sharing)
              </label>
              <input
                type="url"
                value={formData.ogImage}
                onChange={(e) => {
                  setFormData({ ...formData, ogImage: e.target.value });
                  setOgImagePreview(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                placeholder="https://example.com/og-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
              {ogImagePreview && (
                <div className="mt-4">
                  <img
                    src={ogImagePreview}
                    alt="OG Preview"
                    className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="bg-[#10b981] hover:bg-[#059669]">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Create Blog
              </>
            )}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.push('/admin/blogs')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}


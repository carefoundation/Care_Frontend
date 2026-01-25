'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, User, Tag, Loader2, ArrowLeft, Eye, Share2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';

interface Blog {
  _id: string;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  image?: string;
  author?: {
    name?: string;
    email?: string;
  };
  category?: string;
  tags?: string[];
  views?: number;
  status: string;
  createdAt: string;
  publishedAt?: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>(`/blogs/${blogId}`);
      
      // Handle both direct object and object with data property
      const blogData = response?.data || response;
      
      if (blogData && blogData.status === 'published') {
        setBlog(blogData);
      } else {
        // Blog not found or not published
        setBlog(null);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch blog:', error.message);
      } else {
        console.error('Failed to fetch blog:', error);
      }
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const shareBlog = () => {
    if (typeof window !== 'undefined' && blog) {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.content.substring(0, 100),
          url: url,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Blog Not Found</h3>
            <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist or is not published.</p>
            <Link href="/blogs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/blogs">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>

        {/* Blog Image and Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Blog Image */}
          {blog.image && (
            <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                unoptimized
              />
              {blog.category && (
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-[#10b981] text-white text-sm font-semibold rounded-full">
                    {blog.category}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Blog Content */}
          <Card className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            {/* Blog Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              {blog.author?.name && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{blog.author.name}</span>
                </div>
              )}
              {blog.createdAt && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(blog.createdAt)}</span>
                </div>
              )}
              {blog.views !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{blog.views} views</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Blog Content */}
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Share this blog</h3>
                  <p className="text-sm text-gray-600">Help spread the word!</p>
                </div>
                <Button onClick={shareBlog}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}


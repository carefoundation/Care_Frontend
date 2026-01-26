'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import ViewModal from '@/components/admin/ViewModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Eye, Edit, Trash2, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Blog {
  _id?: string;
  id?: string;
  title: string;
  author?: string;
  createdBy?: any;
  category?: string;
  publishedDate?: string;
  createdAt?: string;
  status: 'published' | 'draft';
  content?: string;
  excerpt?: string;
  image?: string;
  tags?: string;
}

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/blogs');
      
      // Handle both array and object with data property
      let blogsData: any[] = [];
      if (Array.isArray(response)) {
        blogsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        blogsData = response.data;
      }
      
      const formatted = blogsData.map((blog: any) => {
        // Handle author - could be object, string, or undefined
        let authorName = 'Admin';
        if (blog.author) {
          if (typeof blog.author === 'string') {
            authorName = blog.author;
          } else if (blog.author.name) {
            authorName = blog.author.name;
          } else if (blog.author.email) {
            authorName = blog.author.email;
          }
        } else if (blog.createdBy) {
          if (typeof blog.createdBy === 'string') {
            authorName = blog.createdBy;
          } else if (blog.createdBy.name) {
            authorName = blog.createdBy.name;
          } else if (blog.createdBy.email) {
            authorName = blog.createdBy.email;
          }
        }
        
        return {
          id: blog._id || blog.id,
          _id: blog._id,
          title: blog.title || 'Untitled',
          author: authorName,
          category: blog.category || 'General',
          publishedDate: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A',
          status: blog.status || 'draft',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          image: blog.image || '',
          tags: blog.tags || '',
        };
      });
      setBlogs(formatted);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch blogs:', error);
      }
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (blog: Blog) => {
    try {
      // Fetch full blog data for view
      const id = blog._id || blog.id;
      if (id) {
        const response = await api.get<any>(`/blogs/${id}`);
        const fullBlog = response.data || response;
        setSelectedBlog({
          ...blog,
          content: fullBlog.content || blog.content || '',
          excerpt: fullBlog.excerpt || blog.excerpt || '',
          image: fullBlog.image || blog.image || '',
          tags: fullBlog.tags || blog.tags || '',
        });
        setViewModalOpen(true);
      } else {
        setSelectedBlog(blog);
        setViewModalOpen(true);
      }
    } catch (error) {
      // If fetch fails, show with available data
      setSelectedBlog(blog);
      setViewModalOpen(true);
    }
  };

  const handleEdit = (blog: Blog) => {
    const id = blog._id || blog.id;
    if (id) {
      router.push(`/admin/blogs/edit/${id}`);
    }
  };

  const handleDeleteClick = (blog: Blog) => {
    setSelectedBlog(blog);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBlog && (selectedBlog._id || selectedBlog.id)) {
      try {
        const id = selectedBlog._id || selectedBlog.id;
        setUpdating(String(id));
        await api.delete(`/blogs/${id}`);
        showToast('Blog deleted successfully!', 'success');
        await fetchBlogs();
        setSelectedBlog(null);
        setDeleteModalOpen(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = '/login';
        } else {
          showToast('Failed to delete blog', 'error');
        }
      } finally {
        setUpdating(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof Blog,
    },
    {
      header: 'Author',
      accessor: 'author' as keyof Blog,
    },
    {
      header: 'Category',
      accessor: 'category' as keyof Blog,
    },
    {
      header: 'Published Date',
      accessor: 'publishedDate' as keyof Blog,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Blog,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blogs</h1>
          <p className="text-gray-600">Create, edit, and delete blog posts</p>
        </div>
        <Link href="/admin/blogs/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Blog
          </Button>
        </Link>
      </div>
      <DataTable
        title=""
        columns={columns}
        data={blogs}
        actions={(row) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row)}
              title="View Details"
              disabled={updating === (row._id || String(row.id))}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row)}
              title="Edit"
              disabled={updating === (row._id || String(row.id))}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
              disabled={updating === (row._id || String(row.id))}
              title="Delete"
            >
              {updating === (row._id || String(row.id)) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      />

      {/* View Modal */}
      {selectedBlog && (
        <>
          <ViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedBlog(null);
            }}
            title="Blog Details"
            data={{
              'Title': selectedBlog.title,
              'Author': selectedBlog.author || 'N/A',
              'Category': selectedBlog.category || 'N/A',
              'Status': selectedBlog.status,
              'Published Date': selectedBlog.publishedDate || 'N/A',
              'Excerpt': selectedBlog.excerpt || 'N/A',
              'Tags': selectedBlog.tags || 'N/A',
              'Content': selectedBlog.content ? (selectedBlog.content.length > 200 ? selectedBlog.content.substring(0, 200) + '...' : selectedBlog.content) : 'N/A',
            }}
          />
          <ConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedBlog(null);
            }}
            title="Delete Blog"
            message={`Are you sure you want to delete "${selectedBlog.title}"? This action cannot be undone and all data will be permanently removed.`}
            onConfirm={handleDeleteConfirm}
            confirmText="Delete"
            variant="danger"
          />
        </>
      )}
    </div>
  );
}


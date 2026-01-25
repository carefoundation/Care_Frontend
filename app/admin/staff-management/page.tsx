'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Users, Edit, Loader2, Save, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Staff {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  permissions?: string[];
  isActive: boolean;
}

const availablePermissions = [
  { value: 'manage_campaigns', label: 'Manage Campaigns' },
  { value: 'manage_events', label: 'Manage Events' },
  { value: 'manage_blogs', label: 'Manage Blogs' },
  { value: 'manage_celebrities', label: 'Manage Celebrities' },
  { value: 'manage_partners', label: 'Manage Partners' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'manage_donations', label: 'Manage Donations' },
  { value: 'manage_volunteers', label: 'Manage Volunteers' },
  { value: 'manage_fundraisers', label: 'Manage Fundraisers' },
  { value: 'view_reports', label: 'View Reports' },
  { value: 'manage_products', label: 'Manage Products' },
  { value: 'manage_coupons', label: 'Manage Coupons' },
  { value: 'manage_queries', label: 'Manage Queries' },
  { value: 'manage_form_submissions', label: 'Manage Form Submissions' },
];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/users');
      
      // Handle both array and object with data property
      let usersData: any[] = [];
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      // Filter only staff users
      const staffUsers = usersData.filter((user: any) => user.role === 'staff');
      
      const formatted = staffUsers.map((user: any) => ({
        id: user._id || user.id,
        _id: user._id,
        name: user.name || 'Unknown',
        email: user.email || 'N/A',
        mobileNumber: user.mobileNumber || 'N/A',
        role: user.role || 'staff',
        permissions: user.permissions || [],
        isActive: user.isActive !== undefined ? user.isActive : true,
      }));
      setStaff(formatted);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch staff:', error);
        showToast('Failed to fetch staff members', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setSelectedPermissions(staffMember.permissions || []);
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!editingStaff || !editingStaff._id) return;

    try {
      setSaving(true);
      const response = await api.put(`/users/${editingStaff._id}`, {
        permissions: selectedPermissions,
      });
      
      // Update localStorage if this is the current user
      if (typeof window !== 'undefined') {
        const currentUserId = localStorage.getItem('userId');
        const currentUserEmail = localStorage.getItem('userEmail');
        // Check by ID or email
        if (currentUserId === editingStaff._id || currentUserEmail === editingStaff.email) {
          localStorage.setItem('userPermissions', JSON.stringify(selectedPermissions));
          // Dispatch custom event to update sidebar immediately
          window.dispatchEvent(new Event('permissionsUpdated'));
          // Also trigger storage event for cross-tab updates
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'userPermissions',
            newValue: JSON.stringify(selectedPermissions),
          }));
        }
      }
      
      // Show message to staff if they need to refresh
      showToast('Permissions updated successfully! Staff member may need to refresh their page to see changes.', 'success');
      
      showToast('Permissions updated successfully!', 'success');
      setEditingStaff(null);
      setSelectedPermissions([]);
      await fetchStaff();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        showToast('Failed to update permissions', 'error');
        console.error('Failed to update permissions:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStaff(null);
    setSelectedPermissions([]);
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
      header: 'Name',
      accessor: 'name' as keyof Staff,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Staff,
    },
    {
      header: 'Mobile',
      accessor: 'mobileNumber' as keyof Staff,
    },
    {
      header: 'Permissions',
      accessor: 'permissions' as keyof Staff,
      render: (value: string[]) => (
        <span className="text-sm text-gray-600">
          {value && value.length > 0 ? `${value.length} permission(s)` : 'No permissions'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive' as keyof Staff,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
        <p className="text-gray-600">Manage staff members and assign permissions</p>
      </div>

      {editingStaff && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Permissions: {editingStaff.name}
            </h2>
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Select the permissions you want to assign to this staff member:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePermissions.map((permission) => (
                  <label
                    key={permission.value}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.value)}
                      onChange={() => handlePermissionToggle(permission.value)}
                      className="w-4 h-4 text-[#10b981] border-gray-300 rounded focus:ring-[#10b981]"
                    />
                    <span className="text-sm text-gray-700">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSavePermissions}
                disabled={saving}
                className="bg-[#10b981] hover:bg-[#059669]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Permissions
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <DataTable
        title=""
        columns={columns}
        data={staff}
        actions={(row) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(row)}
              title="Edit Permissions"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      {staff.length === 0 && (
        <Card className="p-12 text-center mt-6">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Members</h3>
          <p className="text-gray-600">No staff members found. Staff members need to register with role "staff".</p>
        </Card>
      )}
    </div>
  );
}


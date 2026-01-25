'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/app/admin/dashboard/page'), { ssr: false });

export default function StaffDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Ensure user is staff
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      if (role !== 'staff' && role !== 'admin') {
        router.push('/login');
        return;
      }
      // Admin can also access staff dashboard
      if (role === 'admin') {
        // Allow admin to view staff dashboard
      }
    }
  }, [router]);

  return <AdminDashboard />;
}


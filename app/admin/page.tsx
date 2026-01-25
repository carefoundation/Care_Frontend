'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to role-based dashboard
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return null;
}

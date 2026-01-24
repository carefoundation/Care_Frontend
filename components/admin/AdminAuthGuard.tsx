'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkAdminSession } from '@/lib/auth';

// Routes that don't require authentication (public partner forms)
const PUBLIC_ROUTES = [
  '/admin/create-doctor',
  '/admin/create-hospital',
  '/admin/create-restaurant',
  '/admin/create-medicine',
  '/admin/create-pathology',
];

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if current route is a public route
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
    
    if (isPublicRoute) {
      // Allow access to public routes without authentication
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      // For other admin routes, require authentication
      if (checkAdminSession()) {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    }
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#10b981] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}


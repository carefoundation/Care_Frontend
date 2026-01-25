'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  DollarSign,
  Target,
  Ticket,
  User,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  Wallet,
  Award,
  TrendingUp,
  Users,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSidebar } from '@/contexts/SidebarContext';
import AnimatedHamburger from '@/components/ui/AnimatedHamburger';

const getMenuItems = (dashboardUrl: string) => [
  { href: dashboardUrl, label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/my-donations', label: 'My Donations', icon: Heart },
  { href: '/dashboard/my-campaigns', label: 'My Campaigns', icon: Target },
  { href: '/dashboard/coupons', label: 'My Coupons', icon: Ticket },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
];

const volunteerItems = [
  { href: '/dashboard/volunteer-card', label: 'Volunteer Card', icon: Award },
  { href: '/dashboard/volunteer-certificates', label: 'Certificates', icon: FileText },
  { href: '/dashboard/volunteer-events', label: 'Events', icon: Calendar },
];

const vendorItems = [
  { href: '/dashboard/wallet', label: 'My Wallet', icon: Wallet },
  { href: '/dashboard/coupons', label: 'Coupons', icon: Ticket },
];

const fundraiserItems = [
  { href: '/dashboard/fundraisers', label: 'My Fundraisers', icon: TrendingUp },
  { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: DollarSign },
  { href: '/dashboard/coupons', label: 'Issue Coupons', icon: Ticket },
];

type UserRole = 'donor' | 'beneficiary' | 'volunteer' | 'vendor' | 'fundraiser';

export default function ClientSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // TODO: Get user role from auth context
  const getUserRole = (): UserRole => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole') as UserRole | null;
      return role || 'donor';
    }
    return 'donor';
  };
  
  const userRole = getUserRole();
  
  // Get dashboard URL based on role
  const getDashboardUrl = () => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      if (role === 'admin') return '/admin/dashboard';
      if (role === 'staff') return '/staff/dashboard';
      return '/donor/dashboard';
    }
    return '/donor/dashboard';
  };
  
  const dashboardUrl = getDashboardUrl();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-[100]">
        <AnimatedHamburger 
          isOpen={isMobileOpen} 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          variant="dark"
          className="p-2.5 bg-[#10b981] text-white rounded-lg shadow-xl hover:bg-[#059669] transition-colors w-12 h-12 flex items-center justify-center"
        />
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out shadow-lg',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <Link href={dashboardUrl} className="flex items-center transition-opacity duration-300">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <Image
                      src="/Logo.png"
                      alt="Care Foundation Trust Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
              )}
              {isCollapsed && (
                <div className="relative w-12 h-12 mx-auto transition-all duration-300">
                  <Image
                    src="/Logo.png"
                    alt="Care Foundation Trust Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
              <div className="lg:block hidden">
                <AnimatedHamburger
                  isOpen={isCollapsed}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hover:bg-gray-100 rounded-lg p-1"
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Main Menu */}
            <div className="space-y-1">
              {getMenuItems(dashboardUrl).map((item) => {
                let isActive = false;
                if (item.href === dashboardUrl || item.href.includes('/dashboard')) {
                  isActive = pathname === item.href || pathname?.startsWith(item.href);
                } else {
                  isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-[#10b981] text-white shadow-md'
                        : 'text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981]'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'h-5 w-5 flex-shrink-0',
                        isActive && 'scale-110'
                      )}
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Role-based Menu Items */}
            {userRole === 'volunteer' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {!isCollapsed && (
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">Volunteer</p>
                )}
                <div className="space-y-1">
                  {volunteerItems.map((item) => {
                    const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                          isActive
                            ? 'bg-[#10b981] text-white shadow-md'
                            : 'text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981]'
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {userRole === 'vendor' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {!isCollapsed && (
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">Vendor</p>
                )}
                <div className="space-y-1">
                  {vendorItems.map((item) => {
                    const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                          isActive
                            ? 'bg-[#10b981] text-white shadow-md'
                            : 'text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981]'
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {userRole === 'fundraiser' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {!isCollapsed && (
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">Fundraiser</p>
                )}
                <div className="space-y-1">
                  {fundraiserItems.map((item) => {
                    const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                          isActive
                            ? 'bg-[#10b981] text-white shadow-md'
                            : 'text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981]'
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // Clear all user-related localStorage items
                  localStorage.removeItem('userToken');
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userId');
                  localStorage.removeItem('redirectAfterLogin');
                  // Redirect to home page
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all w-full"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}


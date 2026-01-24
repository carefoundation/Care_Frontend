'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  DollarSign,
  Settings,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
  Ticket,
  Wallet,
  HeartHandshake,
  UserCheck,
  Building2,
  Stethoscope,
  UtensilsCrossed,
  Microscope,
  Pill,
  ClipboardList,
  Mail,
  Calendar,
  Package,
  BookOpen,
  Star,
  Home,
  User,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSidebar } from '@/contexts/SidebarContext';
import AnimatedHamburger from '@/components/ui/AnimatedHamburger';

// Main Section
const mainSection = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

// Backend Content Section
const donationSection = [
  { href: '/admin/donations', label: 'Donation Data', icon: DollarSign },
];

const couponSection = [
  { href: '/admin/coupons', label: 'Coupon Data', icon: Ticket },
  { href: '/admin/coupon-claims', label: 'Coupon Claims', icon: Ticket },
  { href: '/admin/wallets', label: 'Vendor Wallets', icon: Wallet },
];

const crowdfundingSection = [
  { href: '/admin/fundraised', label: 'Fundraised Data', icon: HeartHandshake },
  { href: '/admin/fundraiser-requests', label: 'Fundraiser Request', icon: FileText },
  { href: '/admin/fundraiser-live', label: 'Fundraiser Live', icon: Target },
  { href: '/admin/create-fundraiser', label: 'Upload FundRaiser', icon: Target },
];

const volunteerSection = [
  { href: '/admin/volunteer-requests', label: 'Volunteer Rqst Data', icon: ClipboardList },
  { href: '/admin/volunteers', label: 'Our Volunteers', icon: UserCheck },
  { href: '/admin/volunteer-cards', label: 'Volunteer Cards', icon: UserCheck },
  { href: '/admin/volunteer-certificates', label: 'Volunteer Certificates', icon: FileText },
];

const partnerSection = [
  { href: '/admin/partner-requests', label: 'Partner Request', icon: ClipboardList },
  { href: '/admin/create-doctor', label: 'Add Dr. Partner', icon: Stethoscope },
  { href: '/admin/create-hospital', label: 'Add Hospital Partner', icon: Building2 },
  { href: '/admin/create-restaurant', label: 'Add Food Partner', icon: UtensilsCrossed },
  { href: '/admin/create-pathology', label: 'Add Pathology Partner', icon: Microscope },
  { href: '/admin/create-medicine', label: 'Add Medicine Partner', icon: Pill },
  { href: '/admin/partners', label: 'Our Partners', icon: Building2 },
];

const usersSection = [
  { href: '/admin/users', label: 'Registered Users', icon: Users },
];

const formSection = [
  { href: '/admin/form-submissions', label: 'All Form Submissions', icon: ClipboardList },
];

const querySection = [
  { href: '/admin/queries', label: 'Query Mail', icon: Mail },
];

const eventsSection = [
  { href: '/admin/create-event', label: 'Upload Events', icon: Calendar },
  { href: '/admin/events', label: 'Our Events', icon: Calendar },
];

const productsSection = [
  { href: '/admin/products', label: 'Product Management', icon: Package },
];

const contentSection = [
  { href: '/admin/blogs', label: 'Blogs', icon: BookOpen },
  { href: '/admin/celebrities', label: 'Celebrities', icon: Star },
];

const frontSideSection = [
  { href: '/', label: 'Front Side', icon: Home },
];

const profileSection = [
  { href: '/admin/profile', label: 'Your Profile', icon: User },
  { href: '/logout', label: 'Log Out', icon: LogOut },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-[100]">
        <AnimatedHamburger 
          isOpen={isMobileOpen} 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 bg-black text-white rounded-lg shadow-xl hover:bg-gray-900 transition-colors w-12 h-12 flex items-center justify-center"
          variant="dark"
        />
      </div>
      
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-black text-white z-40 transition-all duration-300 ease-in-out shadow-xl',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <h1 className="text-xl font-bold text-white transition-opacity duration-300">Admin Panel</h1>
              )}
              <div className="lg:block hidden">
                <AnimatedHamburger
                  isOpen={isCollapsed}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hover:bg-gray-800 rounded-lg p-1"
                  variant="dark"
                />
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Main Section */}
            <div>
              {!isCollapsed && <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">Main</p>}
              <div className="space-y-1">
                {mainSection.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
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
                        <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Backend Content Section */}
            {!isCollapsed && <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4 mt-4">Backend Content</p>}
            
            {/* Donation Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Donation</p>}
              <div className="space-y-1">
                {donationSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Coupon Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Coupon</p>}
              <div className="space-y-1">
                {couponSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Crowdfunding Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Crowdfunding</p>}
              <div className="space-y-1">
                {crowdfundingSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Volunteer Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Volunteer</p>}
              <div className="space-y-1">
                {volunteerSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Partner Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Partner</p>}
              <div className="space-y-1">
                {partnerSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Users Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Users</p>}
              <div className="space-y-1">
                {usersSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Form Submissions */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Form Submissions</p>}
              <div className="space-y-1">
                {formSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Website Queries */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Website Queries</p>}
              <div className="space-y-1">
                {querySection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Events Section */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Events</p>}
              <div className="space-y-1">
                {eventsSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Products */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Products</p>}
              <div className="space-y-1">
                {productsSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Content Management */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Content Management</p>}
              <div className="space-y-1">
                {contentSection.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Front Side */}
            <div>
              {!isCollapsed && <p className="text-xs text-gray-400 mb-1 px-4">Front Side</p>}
              <div className="space-y-1">
                {frontSideSection.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                        isActive
                          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
          
          {/* Profile Section */}
          <div className="p-4 border-t border-gray-800 space-y-1">
            {profileSection.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/profile' && pathname?.startsWith(item.href + '/') && pathname.split('/').length === item.href.split('/').length + 1);
              if (item.href === '/logout') {
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setIsMobileOpen(false);
                      // Handle logout
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminEmail');
                        window.location.href = '/admin/login';
                      }
                    }}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 w-full text-left',
                      'text-gray-300 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/50'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
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


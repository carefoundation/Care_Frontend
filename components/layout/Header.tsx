'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Heart, Menu, X, User, LogIn, LogOut, ChevronDown, Info, Target, Users, Award, FileText, TrendingUp, PlusCircle, FolderOpen, UtensilsCrossed, Stethoscope, Handshake, UserPlus, Calendar, LayoutDashboard, Star, BookOpen } from 'lucide-react';
import AnimatedHamburger from '../ui/AnimatedHamburger';
import Button from '../ui/Button';
import { checkAdminSession, clearAdminSession } from '@/lib/auth';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [moreDropdownLeft, setMoreDropdownLeft] = useState(0);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const campaignsDropdownRef = useRef<HTMLDivElement>(null);
  const joinUsDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
    checkAuthStatus();
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
      const adminLoggedIn = checkAdminSession();
      const userToken = localStorage.getItem('userToken');
      // Check if token exists and is not empty
      const userLoggedIn = !!userToken && userToken.trim() !== '';
      
      setIsAdmin(adminLoggedIn);
      setIsLoggedIn(adminLoggedIn || userLoggedIn);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (isAdmin) {
        clearAdminSession();
      }
      // Clear all user-related localStorage items
      localStorage.removeItem('userToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('redirectAfterLogin');
      
      setIsLoggedIn(false);
      setIsAdmin(false);
      
      // Redirect to home page
      router.push('/');
    }
  };

  useEffect(() => {
    const updateMoreDropdownPosition = () => {
      if (moreButtonRef.current) {
        const rect = moreButtonRef.current.getBoundingClientRect();
        setMoreDropdownLeft(rect.left);
      }
    };

    if (openDropdown === 'more') {
      updateMoreDropdownPosition();
      window.addEventListener('resize', updateMoreDropdownPosition);
      window.addEventListener('scroll', updateMoreDropdownPosition);
    }

    return () => {
      window.removeEventListener('resize', updateMoreDropdownPosition);
      window.removeEventListener('scroll', updateMoreDropdownPosition);
    };
  }, [openDropdown]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        aboutDropdownRef.current &&
        !aboutDropdownRef.current.contains(target) &&
        campaignsDropdownRef.current &&
        !campaignsDropdownRef.current.contains(target) &&
        joinUsDropdownRef.current &&
        !joinUsDropdownRef.current.contains(target) &&
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const aboutDropdownItems = [
    { href: '/create-fundraiser', label: 'Start a Fundraiser', icon: PlusCircle },
    { href: '/fundraised', label: 'Fundraised', icon: TrendingUp },
    { href: '/fundraiser', label: 'Fundraiser', icon: FolderOpen },
  ];

  const campaignsDropdownItems = [
    { href: '/partners/food', label: 'Food Partners', icon: UtensilsCrossed },
    { href: '/partners/health', label: 'Health Partners', icon: Stethoscope },
  ];

  const joinUsDropdownItems = [
    { href: '/become-partner', label: 'Become A Partner', icon: Handshake },
    { href: '/volunteer', label: 'Become A Volunteer', icon: UserPlus },
    { href: '/volunteer-directory', label: 'Volunteer Directory', icon: Users },
  ];

  const moreDropdownItems = [
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/celebrities', label: 'Celebrities', icon: Star },
    { href: '/blogs', label: 'Blogs', icon: BookOpen },
    { href: '/founder', label: 'Founder', icon: User },
  ];

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 relative ${
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
      suppressHydrationWarning
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group" onClick={closeMenu}>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <Image
                src="/Logo.png"
                alt="Care Foundation Trust Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Home Link */}
            <Link
              href="/"
              className="text-gray-700 hover:text-[#10b981] font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b981] group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Crowd Funding Dropdown */}
            <div className="relative" ref={aboutDropdownRef}>
              <button
                onClick={() => toggleDropdown('about')}
                className="text-gray-700 hover:text-[#10b981] font-medium transition-colors relative group flex items-center gap-1"
                suppressHydrationWarning
              >
                Crowd Funding
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'about' ? 'rotate-180' : ''
                  }`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b981] group-hover:w-full transition-all duration-300"></span>
              </button>
              {openDropdown === 'about' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out opacity-100 translate-y-0">
                  {aboutDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Partners Dropdown */}
            <div className="relative" ref={campaignsDropdownRef}>
              <button
                onClick={() => toggleDropdown('campaigns')}
                className="text-gray-700 hover:text-[#10b981] font-medium transition-colors relative group flex items-center gap-1"
                suppressHydrationWarning
              >
                Partners
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'campaigns' ? 'rotate-180' : ''
                  }`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b981] group-hover:w-full transition-all duration-300"></span>
              </button>
              {openDropdown === 'campaigns' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out opacity-100 translate-y-0">
                  {campaignsDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Join Us Dropdown */}
            <div className="relative" ref={joinUsDropdownRef}>
              <button
                onClick={() => toggleDropdown('joinUs')}
                className="text-gray-700 hover:text-[#10b981] font-medium transition-colors relative group flex items-center gap-1"
                suppressHydrationWarning
              >
                Join Us
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'joinUs' ? 'rotate-180' : ''
                  }`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b981] group-hover:w-full transition-all duration-300"></span>
              </button>
              {openDropdown === 'joinUs' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out opacity-100 translate-y-0">
                  {joinUsDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* More Dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                ref={moreButtonRef}
                onClick={() => toggleDropdown('more')}
                className="text-gray-700 hover:text-[#10b981] font-medium transition-colors relative group flex items-center gap-1"
                suppressHydrationWarning
              >
                More
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'more' ? 'rotate-180' : ''
                  }`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b981] group-hover:w-full transition-all duration-300"></span>
              </button>
              {openDropdown === 'more' && (
                <div 
                  className="fixed w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out opacity-100"
                  style={{ 
                    top: '80px',
                    left: `${moreDropdownLeft}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {moreDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other Links */}
            {navLinks.filter(link => link.href !== '/').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#10b981] font-medium transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b981] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href={isAdmin ? '/admin' : '/dashboard'}>
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : pathname?.startsWith('/admin') ? null : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <AnimatedHamburger
              isOpen={isMenuOpen}
              onClick={toggleMenu}
              variant="green"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-gray-200">
            <Link
              href="/"
              onClick={closeMenu}
              className="block px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors font-medium"
            >
              Home
            </Link>

            {/* Mobile Crowd Funding Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('about-mobile')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors font-medium"
                suppressHydrationWarning
              >
                <span>Crowd Funding</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'about-mobile' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openDropdown === 'about-mobile' && (
                <div className="pl-4 mt-1 space-y-1">
                  {aboutDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Partners Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('campaigns-mobile')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors font-medium"
                suppressHydrationWarning
              >
                <span>Partners</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'campaigns-mobile' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openDropdown === 'campaigns-mobile' && (
                <div className="pl-4 mt-1 space-y-1">
                  {campaignsDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Join Us Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('joinUs-mobile')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors font-medium"
                suppressHydrationWarning
              >
                <span>Join Us</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'joinUs-mobile' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openDropdown === 'joinUs-mobile' && (
                <div className="pl-4 mt-1 space-y-1">
                  {joinUsDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile More Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('more-mobile')}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors font-medium"
                suppressHydrationWarning
              >
                <span>More</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === 'more-mobile' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openDropdown === 'more-mobile' && (
                <div className="pl-4 mt-1 space-y-1">
                  {moreDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other Mobile Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block px-4 py-3 text-gray-700 hover:bg-[#ecfdf5] hover:text-[#10b981] rounded-lg transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-2 px-4">
              {isLoggedIn ? (
                <>
                  <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-center" onClick={() => { handleLogout(); closeMenu(); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : pathname?.startsWith('/admin') ? null : (
                <>
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-center">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full justify-center">
                      <User className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}


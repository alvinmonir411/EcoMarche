"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Container from '../ui/Container';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

type NavbarUser = {
  name?: string;
  role?: string;
};

const readStoredUser = (): NavbarUser | null => {
  if (typeof window === 'undefined') return null;
  const savedUser = localStorage.getItem('user');
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as NavbarUser;
  } catch (e) {
    console.error("Failed to parse user", e);
    return null;
  }
};

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, successMessage: cartSuccess, error: cartError, openCart } = useCart();
  const { wishlist, successMessage: wishlistSuccess } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const checkUser = () => {
    setUser(readStoredUser());
  };

  useEffect(() => {
    setIsMounted(true);
    checkUser();
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', checkUser);
    window.addEventListener('authChange', checkUser);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('authChange', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Women', href: '/shop?category=women-dress' },
    { name: 'Men', href: '/shop?category=men-clothing' },
    { name: 'About', href: '/about' },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="hidden lg:block bg-primary py-2 text-center text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.2em]">
        <Container className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex gap-4">
            <span className="hidden sm:inline">Free Delivery on orders over ৳120</span>
            <span className="hidden sm:inline">30 Days Return</span>
          </div>
          <div>support@ecomarche.com</div>
          <div className="hidden sm:flex gap-4 items-center">
            <span className="cursor-pointer hover:opacity-80 transition-opacity">English</span>
            <div className="flex gap-2">
              {/* Social placeholders */}
              <div className="w-3 h-3 border border-white/50 rounded-full"></div>
              <div className="w-3 h-3 border border-white/50 rounded-full"></div>
            </div>
          </div>
        </Container>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {cartSuccess && (
          <div className="bg-primary text-white px-6 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300 pointer-events-auto flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-bold">{cartSuccess}</span>
          </div>
        )}
        {wishlistSuccess && (
          <div className="bg-primary/90 text-white px-6 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300 pointer-events-auto flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-bold">{wishlistSuccess}</span>
          </div>
        )}
        {cartError && (
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl animate-in slide-in-from-right duration-300 pointer-events-auto flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            <span className="text-sm font-bold">{cartError}</span>
          </div>
        )}
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-1' : 'bg-white py-2 lg:py-4 border-b border-gray-50'
        }`}>
        <Container>
          <div className="flex justify-between items-center gap-3 h-14 lg:h-20">
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex min-w-0 items-center group">
                <div className="relative w-32 h-10 lg:w-40 lg:h-12 flex items-center shrink-0">
                  <img src="/logo.png" alt="fastLain" className="object-contain w-full h-full group-hover:scale-105 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Desktop Links - Centered */}
            <div className="hidden lg:flex flex-1 justify-center items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-secondary hover:text-primary font-bold text-xs uppercase tracking-widest transition-all relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {link.name}
                </Link>
              ))}

            </div>

            {/* Actions */}
            <div className="hidden lg:flex flex-1 justify-end items-center space-x-8">
              <div className="relative">
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                {showSearch && (
                  <form onSubmit={handleSearch} className="absolute right-0 top-full mt-4 w-64 bg-white shadow-xl rounded-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      autoFocus
                      className="w-full bg-accent/20 border-transparent focus:border-primary focus:ring-primary rounded-lg px-4 py-2 outline-none transition-all text-sm"
                    />
                  </form>
                )}
              </div>
              <Link href="/wishlist" className="text-secondary hover:text-primary transition-colors relative group">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-in zoom-in border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button onClick={openCart} className="text-secondary hover:text-primary transition-colors relative group">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-in zoom-in border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>

              <div className="h-6 w-[1px] bg-gray-100"></div>

              {isMounted && user ? (
                <div className="flex items-center gap-6">
                  <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-[11px] font-bold text-secondary hover:text-primary transition-all flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-[12px] uppercase text-secondary">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    {user.name || 'User'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-[11px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-all">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex shrink-0 items-center gap-2 min-[360px]:gap-3">
              <button onClick={openCart} className="text-secondary relative p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-black">{totalItems}</span>}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-secondary focus:outline-none p-2 bg-gray-50 rounded-xl"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden pb-12 pt-6 animate-in slide-in-from-top-10 duration-500 ease-out border-t border-gray-50">
              <div className="flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-secondary hover:text-primary font-bold text-2xl tracking-tighter"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-8 border-t border-gray-100 flex flex-col gap-6">
                  {isMounted && user ? (
                    <>
                      <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="text-secondary font-bold flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-sm uppercase text-secondary">
                            {user.name ? user.name.charAt(0) : 'U'}
                          </div>
                          {user.name || 'My Account'}
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                      <button onClick={handleLogout} className="text-left text-red-500 font-bold uppercase text-xs tracking-widest">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setIsOpen(false)} className="w-full bg-secondary text-white py-5 rounded-2xl font-bold text-center text-sm shadow-xl shadow-secondary/20">
                      Sign In to Account
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </nav>
      <MobileBottomNav
        isMenuOpen={isOpen}
        onMenuToggle={() => setIsOpen((open) => !open)}
        pathname={pathname}
        totalItems={totalItems}
        accountHref={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'}
      />
    </>
  );
};

type MobileBottomNavProps = {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  pathname: string;
  totalItems: number;
  accountHref: string;
};

function MobileBottomNav({ isMenuOpen, onMenuToggle, pathname, totalItems, accountHref }: MobileBottomNavProps) {
  const itemClass = (active: boolean) =>
    `flex w-1/5 min-w-0 flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-normal transition-colors ${active ? 'text-white' : 'text-white/60'
    }`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] overflow-hidden border-t border-white/10 bg-primary px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(0,0,0,0.18)] lg:hidden">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between overflow-hidden">
        <Link href="/" className={itemClass(pathname === '/')}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 11.5L12 4l9 7.5M5 10v10h14V10" /></svg>
          Home
        </Link>
        <button type="button" onClick={onMenuToggle} className={itemClass(isMenuOpen)} aria-label="Open menu">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} /></svg>
          Menu
        </button>
        <Link href="/cart" className={`${itemClass(pathname === '/cart')} relative`}>
          <span className="relative">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black leading-none text-primary">
                {totalItems}
              </span>
            )}
          </span>
          Cart
        </Link>
        <Link href="/shop" className={itemClass(pathname === '/shop')}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Search
        </Link>
        <Link href={accountHref} className={itemClass(pathname === '/dashboard' || pathname === '/login' || pathname === '/admin')}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0" /></svg>
          Account
        </Link>
      </div>
    </div>
  );
}

export default Navbar;

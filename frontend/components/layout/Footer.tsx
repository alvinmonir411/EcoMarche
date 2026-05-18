import React from 'react';
import Link from 'next/link';
import Container from '../ui/Container';

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-white pb-10 pt-14 text-secondary">
      <Container className="max-w-[1320px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-lg font-black">E</div>
              <span className="text-xl font-black text-secondary tracking-tighter">FastLain</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              FastLain is a premium fashion marketplace for everyday dresses, curated essentials, and responsibly made wardrobe staples.
            </p>
            <div className="space-y-2 text-sm text-muted">
              <p>Rampura, Dhaka, Bangladesh</p>
              <p>support@fastlain.com</p>
              <p>+880 9642 292922</p>
            </div>
            <div className="flex gap-3">
               {/* Instagram */}
               <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center text-secondary hover:bg-secondary hover:text-white hover:border-secondary transition-all cursor-pointer" aria-label="Instagram">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"/>
                   <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2"/>
                   <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/>
                 </svg>
               </a>
               {/* X / Twitter */}
               <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center text-secondary hover:bg-secondary hover:text-white hover:border-secondary transition-all cursor-pointer" aria-label="X (Twitter)">
                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                 </svg>
               </a>
               {/* Facebook */}
               <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center text-secondary hover:bg-secondary hover:text-white hover:border-secondary transition-all cursor-pointer" aria-label="Facebook">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeWidth="2"/>
                 </svg>
               </a>
               {/* Pinterest */}
               <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center text-secondary hover:bg-secondary hover:text-white hover:border-secondary transition-all cursor-pointer" aria-label="Pinterest">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path d="M8 22a9 9 0 0 1-1.91-8.27c.41-1.74 1.4-4.8 1.4-4.8s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1 0 1.49.75 1.49 1.66 0 1-.64 2.52-.97 3.92-.28 1.18.59 2.15 1.75 2.15 2.1 0 3.72-2.22 3.72-5.42 0-2.84-2.04-4.82-4.96-4.82-3.38 0-5.36 2.54-5.36 5.15 0 1 .39 2.12.87 2.7.1.11.11.21.08.32-.1.38-.3.1.37-.12-.41-.5-1-1.74-1-2.8C2 6.54 4.54 3 9.4 3 13.27 3 16.3 5.76 16.3 9.38c0 3.73-2.35 6.74-5.62 6.74-1.1 0-2.13-.57-2.48-1.24l-.68 2.6c-.25.96-.91 2.16-1.36 2.89C7.03 21.32 7.51 22 8 22z" strokeWidth="1.8"/>
                 </svg>
               </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Shop By</h3>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=women-dress" className="hover:text-primary transition-colors">Women Dress</Link></li>
              <li><Link href="/shop?category=men-clothing" className="hover:text-primary transition-colors">Men Clothing</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
              <li><Link href="/shop?category=winter-wear" className="hover:text-primary transition-colors">Winter Wear</Link></li>
            </ul>
          </div>

          {/* Experience */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Information</h3>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="/shop?category=saree" className="hover:text-primary transition-colors">Saree</Link></li>
              <li><Link href="/shop?category=kurti" className="hover:text-primary transition-colors">Kurti</Link></li>
              <li><Link href="/shop?category=t-shirt" className="hover:text-primary transition-colors">T-Shirt</Link></li>
              <li><Link href="/shop?category=kids-dress" className="hover:text-primary transition-colors">Kids Dress</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Support</h3>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Policy</h3>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">Return Policy</Link></li>
              <li><Link href="/cancellation" className="hover:text-primary transition-colors">Cancellation</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-8 md:flex-row">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest">
            © 2026 FastLain. Naturally Yours.
          </div>
          <div className="flex gap-8">
             <div className="h-6 w-10 bg-gray-50 rounded flex items-center justify-center opacity-50"><span className="text-[8px] font-bold">VISA</span></div>
             <div className="h-6 w-10 bg-gray-50 rounded flex items-center justify-center opacity-50"><span className="text-[8px] font-bold">CARD</span></div>
             <div className="h-6 w-10 bg-gray-50 rounded flex items-center justify-center opacity-50"><span className="text-[8px] font-bold">PAY</span></div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export { Footer };
export default Footer;

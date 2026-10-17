'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

// Sign Up Toggle Component
function SignUpToggle() {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="relative inline-flex">
      {isSignUp ? (
        <Link
          href="/auth?mode=signup"
          className="bg-brand-primary hover:bg-brand-accent border-4 border-brand-cream rounded-full pl-3 pr-6 py-2 flex items-center gap-2 transition-all shadow-md"
        >
          <div className="w-4 h-4 rounded-full bg-brand-cream" />
          <span className="font-acme text-white text-sm uppercase tracking-wide">SIGN UP</span>
        </Link>
      ) : (
        <Link
          href="/anonymous"
          className="bg-brand-primary hover:bg-brand-accent border-4 border-brand-cream rounded-full pl-6 pr-3 py-2 flex items-center gap-2 transition-all shadow-md"
        >
          <span className="font-acme text-white text-sm uppercase tracking-wide">GUEST</span>
          <div className="w-4 h-4 rounded-full bg-brand-cream" />
        </Link>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-cream hover:text-white text-xs z-10"
        aria-label="Toggle between Sign Up and Guest"
      >
        ⇄
      </button>
    </div>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const showGlass = isScrolled || isMenuOpen;
  const glassStyle = showGlass
    ? {
        backgroundColor: 'rgba(255, 248, 239, 0.55)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(255, 255, 255, 0.45)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
      }
    : {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: '1px solid transparent',
        boxShadow: 'none',
      };

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        threshold: 1,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-24" aria-hidden="true" />
      <nav className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-3xl transition-all duration-300"
            style={glassStyle}
          />
          <div className="relative z-10 flex items-center justify-between h-20">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <Image
              src="images/heal-logo.png"
              alt="HEAL Logo"
              width={80}
              height={80}
              className="h-30 w-30 object-contain transition-all duration-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] group-hover:scale-115 group-hover:rotate-3 group-hover:drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
              priority
            />
            {/* <span className="font-acme text-3xl font-bold text-brand-primary group-hover:text-brand-dark transition-all duration-300 group-hover:tracking-wider">
              HEAL
            </span> */}
          </Link>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-6 xl:space-x-8 mx-8">
            <Link
              href="/"
              className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 text-sm uppercase tracking-wide relative group/nav hover:scale-110 hover:tracking-wider"
            >
              HOME
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-dark group-hover/nav:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 text-sm uppercase tracking-wide relative group/nav hover:scale-110 hover:tracking-wider"
            >
              ABOUT HEAL
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-dark group-hover/nav:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/services"
              className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 text-sm uppercase tracking-wide relative group/nav hover:scale-110 hover:tracking-wider"
            >
              SERVICES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-dark group-hover/nav:w-full transition-all duration-300"></span>
            </Link>
            {/* <Link
              href="/#resources"
              className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 text-sm uppercase tracking-wide relative group/nav hover:scale-110 hover:tracking-wider"
            >
              RESOURCES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-dark group-hover/nav:w-full transition-all duration-300"></span>
            </Link> */}
            <Link
              href="/report"
              className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 text-sm uppercase tracking-wide relative group/nav hover:scale-110 hover:tracking-wider"
            >
              REPORT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-dark group-hover/nav:w-full transition-all duration-300"></span>
            </Link>

            {/* Sign Up / Guest Toggle Switch */}
            <SignUpToggle />
          </div>

          {/* Right Side Buttons */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            <Link
              href="/contact"
              className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 text-sm uppercase tracking-wide relative group/nav hover:scale-110 hover:tracking-wider"
            >
              CONTACT US
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-dark group-hover/nav:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/donate"
              className="font-acme bg-brand-primary hover:bg-brand-accent text-white py-2.5 px-6 rounded-full transition-all duration-300 text-sm uppercase tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 hover:-translate-y-0.5"
            >
              DONATE
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-brand-primary rounded-lg hover:bg-brand-light/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div
              className="relative z-10 lg:hidden border-t border-white/30 py-4"
              style={{
                backgroundColor: 'rgba(255, 248, 239, 0.7)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
              }}
            >
              <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 px-4 py-2 text-sm uppercase tracking-wide hover:bg-brand-light/50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/about"
                className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 px-4 py-2 text-sm uppercase tracking-wide hover:bg-brand-light/50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT HEAL
              </Link>
              <Link
                href="/#services"
                className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 px-4 py-2 text-sm uppercase tracking-wide hover:bg-brand-light/50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                SERVICES
              </Link>
              <Link
                href="/#resources"
                className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 px-4 py-2 text-sm uppercase tracking-wide hover:bg-brand-light/50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                RESOURCES
              </Link>
              <Link
                href="/#report"
                className="font-acme text-brand-primary hover:text-brand-dark transition-all duration-300 px-4 py-2 text-sm uppercase tracking-wide hover:bg-brand-light/50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                REPORT
              </Link>

              {/* Mobile Auth buttons */}
              <div className="px-4 pt-3 space-y-3 border-t border-brand-light mt-2">
                <Link
                  href="/auth?mode=signup"
                  className="font-acme block text-center bg-brand-primary hover:bg-brand-accent text-white py-3 px-6 rounded-full shadow-md text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SIGN UP
                </Link>
                <Link
                  href="/chat"
                  className="font-acme block text-center text-brand-teal hover:text-brand-primary px-4 py-3 rounded-lg hover:bg-brand-light/50 transition-all duration-300 text-sm uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  GUEST
                </Link>
                <Link
                  href="/#contact"
                  className="font-acme block text-center text-brand-primary hover:text-brand-dark px-4 py-3 text-sm uppercase tracking-wide transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CONTACT US
                </Link>
                <Link
                  href="/donate"
                  className="font-acme block text-center bg-brand-primary hover:bg-brand-accent text-white py-3 px-6 rounded-full shadow-md text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105 z-20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  DONATE
                </Link>
              </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

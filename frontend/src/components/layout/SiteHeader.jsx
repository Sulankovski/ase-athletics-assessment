import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink, LogOut, Menu } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';

const COMPANY_URL = 'https://aseathletics.com';

const navBtn =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-white/95 hover:bg-white/15 transition-colors border border-transparent hover:border-white/20';

const mobileNavItem =
  'block w-full text-right py-2.5 px-3 text-sm font-medium text-white/95 hover:bg-white/15 border border-transparent hover:border-white/20 rounded-md transition-colors';

export default function SiteHeader() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
  };

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isLanding = pathname === '/';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <header className="header-bar sticky top-0 z-50 text-white antialiased relative">
      <div className="container-custom flex h-16 tablet:h-[4.25rem] items-center justify-between gap-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 tablet:gap-3 text-white hover:text-white/90 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-9 w-9 tablet:h-10 tablet:w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25 text-white font-bold text-sm tablet:text-base backdrop-blur-sm">
            ASE
          </span>
          <div className="min-w-0">
            <p className="text-sm tablet:text-base font-semibold leading-tight truncate text-white">
              ASE Athletics
            </p>
            <p className="text-xs text-primary-100/90 hidden tablet:block truncate">
              Football player analytics
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/15 border border-white/20 transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="site-header-mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu className="h-5 w-5 shrink-0" aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>

          <nav
            className="hidden lg:flex items-center gap-2 tablet:gap-3 text-sm font-medium"
            aria-label="Primary"
          >
            {isLanding && (
              <a
                href={COMPANY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${navBtn} shrink-0`}
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden desktop:inline">Company site</span>
                <span className="desktop:hidden">Company</span>
              </a>
            )}

            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className={navBtn}>
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                <span>Log out</span>
              </button>
            ) : (
              <>
                {!isAuthRoute && (
                  <>
                    <Link to="/login" className={navBtn}>
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center rounded-md bg-white text-primary-900 px-4 py-2 text-sm font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Sign up
                    </Link>
                  </>
                )}
                {isAuthRoute && (
                  <Link to="/" className={navBtn}>
                    Home
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="site-header-mobile-nav"
          className="lg:hidden absolute left-0 right-0 top-full z-50 border-t border-primary-900/30 shadow-lg bg-gradient-to-r from-primary-800 to-primary-900"
        >
          <div className="container-custom flex flex-col items-end gap-1 py-3 pb-4">
            {isLanding && (
              <a
                href={COMPANY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={mobileNavItem}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex items-center justify-end gap-1.5 w-full">
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  Company
                </span>
              </a>
            )}

            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className={mobileNavItem}>
                <span className="inline-flex items-center justify-end gap-1.5 w-full">
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                  Log out
                </span>
              </button>
            ) : (
              <>
                {!isAuthRoute && (
                  <>
                    <Link to="/login" className={mobileNavItem} onClick={() => setMobileOpen(false)}>
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="mt-1 inline-flex w-auto items-center justify-end rounded-md bg-white text-primary-900 px-4 py-2.5 text-sm font-semibold hover:bg-primary-50 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
                {isAuthRoute && (
                  <Link to="/" className={mobileNavItem} onClick={() => setMobileOpen(false)}>
                    Home
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink, LogOut } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';

const COMPANY_URL = 'https://aseathletics.com';

const navBtn =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-white/95 hover:bg-white/15 transition-colors border border-transparent hover:border-white/20';

export default function SiteHeader() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isLanding = pathname === '/';

  return (
    <header className="header-bar sticky top-0 z-50 text-white antialiased">
      <div className="container-custom flex h-16 tablet:h-[4.25rem] items-center justify-between gap-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 tablet:gap-3 text-white hover:text-white/90 transition-colors"
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

        <nav
          className="flex items-center gap-2 tablet:gap-3 text-sm font-medium"
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
                    className="inline-flex items-center justify-center rounded-md bg-white text-primary-900 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary-50 transition-colors"
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
    </header>
  );
}

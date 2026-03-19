import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink, LogOut } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';

const COMPANY_URL = 'https://aseathletics.com';

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
    <header className="header-bar sticky top-0 z-50 bg-white/90 backdrop-blur-md border-neutral-gray200">
      <div className="container-custom flex h-16 tablet:h-[4.25rem] items-center justify-between gap-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 tablet:gap-3 text-neutral-gray900 hover:text-primary-700 transition-colors"
        >
          <span className="flex h-9 w-9 tablet:h-10 tablet:w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm tablet:text-base">
            ASE
          </span>
          <div className="min-w-0">
            <p className="text-sm tablet:text-base font-semibold leading-tight truncate">
              ASE Athletics
            </p>
            <p className="text-xs text-neutral-gray500 hidden tablet:block truncate">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-neutral-gray600 hover:text-primary-700 hover:bg-primary-50 transition-colors shrink-0"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden desktop:inline">Company site</span>
              <span className="desktop:hidden">Company</span>
            </a>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-neutral-gray700 hover:bg-neutral-gray100 transition-colors border border-transparent hover:border-neutral-gray200"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              <span>Log out</span>
            </button>
          ) : (
            <>
              {!isAuthRoute && (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-neutral-gray700 hover:bg-neutral-gray100 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link to="/signup" className="btn-primary py-2 px-4 text-sm shadow-sm">
                    Sign up
                  </Link>
                </>
              )}
              {isAuthRoute && (
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-neutral-gray700 hover:bg-neutral-gray100 transition-colors"
                >
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

import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/slices/authSlice';
import PageLayout from '@/components/layout/PageLayout';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    if (!email || !password) return;
    dispatch(login({ email, password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        form.reset();
      }
    });
  };

  return (
    <PageLayout mainClassName="flex flex-col hero-gradient section-y">
      <div className="container-custom flex flex-1 flex-col desktop:flex-row desktop:items-stretch desktop:gap-10 large:gap-12">
        <div className="w-full max-w-xl mx-auto text-center desktop:mx-0 desktop:max-w-xl desktop:flex-1 desktop:text-left shrink-0 mb-8 tablet:mb-10 desktop:mb-0 desktop:pr-4 flex flex-col justify-center">
          <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">
            Welcome back
          </p>
          <h2 className="mt-3 text-2xl tablet:text-3xl large:text-4xl font-extrabold text-neutral-gray900 leading-tight">
            Sign in to your football player analytics workspace
          </h2>
          <p className="mt-4 text-neutral-gray600 text-sm tablet:text-base large:text-lg">
            Access player metrics, performance history, and scouting-ready reports - tools built
            around football data and ASE Athletics&apos; approach to talent development.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center w-full min-w-0">
          <div className="card card-top-accent w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-semibold text-neutral-gray900">Log in</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div
                  className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-100"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-gray700 mb-1" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-neutral-gray700 mb-1"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            <p className="mt-4 text-sm text-neutral-gray600">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-primary-700 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

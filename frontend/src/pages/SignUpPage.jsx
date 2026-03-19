import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '@/store/slices/authSlice';
import PageLayout from '@/components/layout/PageLayout';

export default function SignUpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value;
    const password = form.password.value;
    if (!name || !email || !password) return;
    dispatch(register({ name, email, password })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        form.reset();
        navigate('/login');
      }
    });
  };

  return (
    <PageLayout mainClassName="flex flex-col hero-gradient section-y">
      <div className="container-custom flex flex-1 flex-col desktop:flex-row desktop:items-stretch desktop:gap-10 large:gap-12">
        <div className="w-full max-w-xl mx-auto text-center desktop:mx-0 desktop:max-w-xl desktop:flex-1 desktop:text-left shrink-0 mb-8 tablet:mb-10 desktop:mb-0 desktop:pr-4 flex flex-col justify-center">
          <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Join ASE</p>
          <h2 className="mt-3 text-2xl tablet:text-3xl large:text-4xl font-extrabold text-neutral-gray900 leading-tight">
            Join the football player analytics platform
          </h2>
          <p className="mt-4 text-neutral-gray600 text-sm tablet:text-base large:text-lg">
            Create a profile to explore player stats, comparisons, and insights - built for football
            and aligned with ASE Athletics&apos; mission to connect talent with opportunity.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center w-full min-w-0">
          <div className="card w-full max-w-md shadow-lg border-neutral-gray200/80">
            <h2 className="text-2xl font-semibold text-neutral-gray900">Sign up</h2>
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
                <label className="block text-sm font-medium text-neutral-gray700 mb-1" htmlFor="su-name">
                  Name
                </label>
                <input
                  id="su-name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-gray700 mb-1" htmlFor="su-email">
                  Email
                </label>
                <input
                  id="su-email"
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
                  htmlFor="su-password"
                >
                  Password
                </label>
                <input
                  id="su-password"
                  name="password"
                  type="password"
                  required
                  minLength={7}
                  className="input"
                  placeholder="Min 7 chars, 1 letter + 1 number"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>
            <p className="mt-4 text-sm text-neutral-gray600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-700 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

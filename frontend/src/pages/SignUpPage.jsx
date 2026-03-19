import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '@/store/slices/authSlice';

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-semibold text-neutral-gray900">Sign Up</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
              Name
            </label>
            <input
              name="name"
              type="text"
              required
              className="input w-full"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="input w-full"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={7}
              className="input w-full"
              placeholder="Min 7 chars, 1 letter + 1 number"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-gray600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
      <Link to="/" className="mt-6 text-sm text-neutral-gray500 hover:text-neutral-gray700">
        ← Back
      </Link>
    </div>
  );
}

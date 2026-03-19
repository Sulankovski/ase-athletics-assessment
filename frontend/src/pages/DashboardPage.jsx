import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-neutral-gray900">
          Welcome, {user?.name || user?.email || 'User'}!
        </h2>
        <p className="mt-2 text-neutral-gray600">{user?.email}</p>
        <p className="mt-4 text-sm text-neutral-gray500">
          You are logged in. This is your dashboard.
        </p>
        <button onClick={handleLogout} className="btn-secondary mt-6 w-full">
          Log Out
        </button>
      </div>
      <Link to="/" className="mt-6 text-sm text-neutral-gray500 hover:text-neutral-gray700">
        ← Home
      </Link>
    </div>
  );
}

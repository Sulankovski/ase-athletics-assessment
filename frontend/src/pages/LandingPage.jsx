import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function LandingPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-neutral-gray900 text-center">
        GODDACK ANALITICA UI
      </h1>
      <p className="mt-2 text-neutral-gray600 text-center">ASE Athletics</p>
      <div className="mt-8 flex gap-4">
        <Link to="/login" className="btn-primary">
          Log In
        </Link>
        <Link to="/signup" className="btn-secondary">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

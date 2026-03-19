import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart3, GraduationCap, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function LandingPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const pillars = [
    {
      title: 'ASE Athletics Academia',
      body: 'Certificate and executive programs that strengthen academic credentials and sports leadership — from law and management to analytics.',
      icon: GraduationCap,
    },
    {
      title: 'Analytics suite',
      body: 'Dashboards, performance insight, and talent identification tools that support ethical, data-driven decisions for scouts and clubs.',
      icon: BarChart3,
    },
    {
      title: 'Talent placement',
      body: 'Development, mentorship, and pathways connecting athletes with clubs, academies, and universities worldwide.',
      icon: Users,
    },
  ];

  return (
    <PageLayout mainClassName="flex flex-col">
      <section className="hero-gradient flex-1">
        <div className="container-custom section-y flex flex-col large:flex-row large:items-center large:gap-12 desktop:gap-16">
          <div className="flex-1 text-center large:text-left">
            <p className="text-sm tablet:text-base font-semibold uppercase tracking-wide text-primary-700">
              Football player analytics
            </p>
            <h1 className="mt-3 tablet:mt-4 max-w-3xl mx-auto large:mx-0">
              Analytics built for football players
            </h1>
            <p className="mt-4 tablet:mt-6 text-base tablet:text-lg desktop:text-xl text-neutral-gray600 max-w-2xl mx-auto large:mx-0">
              Track performance, compare profiles, and surface insight that helps players, coaches, and
              scouts make smarter decisions - part of the ASE Athletics ecosystem. Learn more at{' '}
              <a
                href="https://aseathletics.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 font-medium hover:underline"
              >
                ASE Athletics
              </a>
              .
            </p>
            <div className="mt-8 tablet:mt-10 flex flex-col mobile:flex-row gap-3 tablet:gap-4 justify-center large:justify-start">
              <Link to="/login" className="btn-primary text-center px-8">
                Log in
              </Link>
              <Link to="/signup" className="btn-secondary text-center px-8">
                Create account
              </Link>
            </div>
          </div>
          <div className="mt-10 large:mt-0 flex-1 w-full max-w-lg mx-auto large:max-w-none">
            <div className="card shadow-lg border-primary-100/60 bg-white/80 backdrop-blur-sm">
              <p className="text-sm font-semibold text-neutral-gray800">Football analytics hub</p>
              <p className="mt-2 text-sm tablet:text-base text-neutral-gray600">
                A dedicated analytics experience for football players - stats, trends, and reporting
                in one place.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-gray600">
                <li className="flex gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  Player-first dashboards and insights for the pitch
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-neutral-gray200">
        <div className="container-custom section-y">
          <h2 className="text-center max-w-3xl mx-auto">What we focus on</h2>
          <p className="text-center mt-3 max-w-2xl mx-auto text-neutral-gray600">
            Three pillars that mirror how ASE Athletics combines academia, analytics, and placement
            for athletes and organizations.
          </p>
          <div className="mt-10 tablet:mt-12 grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6 tablet:gap-8">
            {pillars.map(({ title, body, icon: Icon }) => (
              <div
                key={title}
                className="card flex flex-col h-full p-6 tablet:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Icon className="h-5 w-5 tablet:h-6 tablet:w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg tablet:text-xl">{title}</h3>
                <p className="mt-2 text-sm tablet:text-base flex-1">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/**
 * Global chrome for all routes: header + main + footer.
 * Use `mainClassName` for layout variants (hero, auth centering, app shell).
 */
export default function PageLayout({ children, mainClassName = '' }) {
  return (
    <div className="min-h-screen flex flex-col font-primary bg-neutral-gray50 text-neutral-gray900 antialiased">
      <SiteHeader />
      <main className={`flex-1 w-full ${mainClassName}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}

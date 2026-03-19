import { ExternalLink } from 'lucide-react';

const COMPANY_URL = 'https://aseathletics.com';

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-gray200 bg-white mt-auto">
      <div className="container-custom py-6 tablet:py-8 flex flex-col tablet:flex-row gap-4 tablet:gap-8 items-start tablet:items-center justify-between text-sm text-neutral-gray600">
        <div className="max-w-xl">
          <p className="font-semibold text-neutral-gray800">ASE Athletics</p>
          <p className="mt-1 text-neutral-gray600 leading-relaxed">
            This site focuses on{' '}
            <span className="font-medium text-neutral-gray800">football player analytics</span> —
            performance insight alongside ASE Athletics&apos; broader work in education, data, and
            international placement.
          </p>
        </div>
        <a
          href={COMPANY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 shrink-0 font-medium text-primary-700 hover:text-primary-800"
        >
          Visit aseathletics.com
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
      <div className="border-t border-neutral-gray100 py-3 tablet:py-4 text-center text-xs text-neutral-gray500">
        © {new Date().getFullYear()} ASE Athletics. Football analytics platform demo.
      </div>
    </footer>
  );
}

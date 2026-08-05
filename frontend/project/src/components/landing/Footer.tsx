import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';
import { BrandMark } from '../BrandMark';

const columns = [
  {
    title: 'Platform',
    links: ['Dashboard', 'Accounting', 'Sales & POS', 'Inventory', 'HR & Payroll', 'AI Engine'],
  },
  {
    title: 'Solutions',
    links: ['Retail', 'Wholesale', 'Pharmacy', 'F&B', 'Logistics', 'Multi-branch'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API reference', 'VAT guide', 'Onboarding', 'Blog', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Partners', 'Contact', 'Security', 'Status'],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/40 pb-10 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <a href="#top" className="flex items-center gap-2.5">
              <BrandMark className="h-9 w-9 rounded-xl" />
              <span className="font-display text-lg font-bold text-ink-900">
                Share<span className="text-brand-600">.</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              A good desserts for, a good coffee — and the cloud system running
              the till behind it. Accounting, POS, Inventory, HR and CRM in one
              place.
            </p>

            <div className="mt-5 space-y-2 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600" /> hello@sharecafe.om
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-600" /> +968 2200 0000
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" /> Al Saada, Salalah, Oman
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-xl glass text-ink-600 transition-colors hover:text-brand-700"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {columns.map((c) => (
              <div key={c.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-800">
                  {c.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/40 pt-6 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Share Cafe. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-ink-500">
            <a href="#" className="hover:text-brand-700">Privacy</a>
            <a href="#" className="hover:text-brand-700">Terms</a>
            <a href="#" className="hover:text-brand-700">VAT compliance</a>
            <a href="#" className="hover:text-brand-700">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

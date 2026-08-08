import { LifeBuoy, Building2, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import { GlassCard, GlassButton, Badge } from '../../ui';

const COMPANY = 'FutureInnvo SPC';
const ADDRESS = 'Al Shadaa City Mall, Salalah, Oman';
const WHATSAPP_DISPLAY = '+968 9137 5560';
const WHATSAPP_LINK = 'https://wa.me/96891375560';
const MAPS_LINK = `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`;

export function HelpPage() {
  return (
    <div className="space-y-5">
      <GlassCard variant="strong" sheen className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
            <LifeBuoy className="h-7 w-7" />
          </span>
          <div>
            <Badge tone="brand" className="mb-2">Support</Badge>
            <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">Need a hand? We're here to help.</h2>
            <p className="mt-1 text-sm text-ink-500">
              Reach the Share Cafe system provider directly for setup help, bug reports or account issues.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard sheen hover className="p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
            <Building2 className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">Provided by</h3>
          <p className="mt-1 text-lg font-semibold text-ink-900">{COMPANY}</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-ink-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
            <span>{ADDRESS}</span>
          </p>
          <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
            Get directions <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </GlassCard>

        <GlassCard sheen hover className="p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-glow">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">Chat with us on WhatsApp</h3>
          <p className="mt-1 text-lg font-semibold text-ink-900">{WHATSAPP_DISPLAY}</p>
          <p className="mt-1 text-sm text-ink-500">Fastest way to reach support — message us anytime.</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="mt-4 block">
            <GlassButton variant="primary" size="md" className="w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </GlassButton>
          </a>
        </GlassCard>
      </div>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-ink-500">
          Share Cafe ERP is built and maintained by <span className="font-semibold text-ink-700">{COMPANY}</span>.
          For anything not covered here — feature requests, training or technical issues — WhatsApp is the quickest way to reach us.
        </p>
      </GlassCard>
    </div>
  );
}

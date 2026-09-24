import type { PaymentMethodMode } from '../types';

export function WalletButtons({
  selectedMethod,
  onSelect,
}: {
  selectedMethod: PaymentMethodMode;
  onSelect: (method: PaymentMethodMode) => void;
}) {
  return (
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onSelect('bkash')}
        class={[
          'group relative rounded-xl border bg-white px-4 py-3 text-left transition hover:bg-slate-50 hover:shadow-sm active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          selectedMethod === 'bkash' ? 'border-fuchsia-300' : 'border-slate-200 hover:border-slate-300',
        ].join(' ')}
      >
        <span class="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#E2136E]" aria-hidden="true" />
        <span class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-full bg-fuchsia-50 ring-1 ring-black/5" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#E2136E" />
              <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="white" font-family="Arial">
                b
              </text>
            </svg>
          </span>
          <span class="min-w-0">
            <span class="block truncate text-[15px] font-semibold leading-5 text-slate-900">bKash</span>
            <span class="block truncate text-[12px] leading-4 text-slate-500">Pay with mobile wallet</span>
          </span>
          <span class="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition group-hover:bg-slate-200">
            Instant
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelect('nagad')}
        class={[
          'group relative rounded-xl border bg-white px-4 py-3 text-left transition hover:bg-slate-50 hover:shadow-sm active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          selectedMethod === 'nagad' ? 'border-amber-300' : 'border-slate-200 hover:border-slate-300',
        ].join(' ')}
      >
        <span class="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#F6921E]" aria-hidden="true" />
        <span class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-full bg-amber-50 ring-1 ring-black/5" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#F6921E" />
              <text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="white" font-family="Arial">
                N
              </text>
            </svg>
          </span>
          <span class="min-w-0">
            <span class="block truncate text-[15px] font-semibold leading-5 text-slate-900">Nagad</span>
            <span class="block truncate text-[12px] leading-4 text-slate-500">Pay with mobile wallet</span>
          </span>
          <span class="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition group-hover:bg-slate-200">
            Secure
          </span>
        </span>
      </button>
    </div>
  );
}

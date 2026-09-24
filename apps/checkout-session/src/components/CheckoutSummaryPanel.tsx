import type { CheckoutSession } from '../types';

interface CheckoutSummaryPanelProps {
  session: CheckoutSession;
}

export function CheckoutSummaryPanel({ session }: CheckoutSummaryPanelProps) {
  const displayAmount = `${session.currency} ${Number(session.amount).toFixed(2)}`;

  return (
    <div className="md:w-[480px] bg-[#2d2f3a] text-white p-8 md:p-12 md:min-h-screen flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-xs font-bold">
          Pa
        </div>
        <span className="text-[11px] font-semibold tracking-wide uppercase bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded">
          Test Mode
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-300 mb-1">{session.description || 'Checkout'}</p>
        <h2 className="text-[42px] font-semibold leading-tight mb-2">{displayAmount}</h2>
        <p className="text-sm text-gray-400">Session {session.id.slice(0, 8)}...</p>
      </div>
    </div>
  );
}

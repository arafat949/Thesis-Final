interface PaymentEntryFormProps {
  isLoading: boolean;
  isSubmitting: boolean;
  hidden: boolean;
  onPay: () => void;
}

export function PaymentEntryForm({ isLoading, isSubmitting, hidden, onPay }: PaymentEntryFormProps) {
  return (
    <div className={hidden ? 'hidden' : ''}>
      <div className="relative mb-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <span className="text-gray-500 text-sm">Loading payment fields...</span>
          </div>
        )}
        <div id="payment-fields-container" className="h-[360px]" />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name on card</label>
        <input
          type="text"
          defaultValue="Suaeb Ahmed"
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Country or region</label>
        <div className="relative">
          <select
            defaultValue="Bangladesh"
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-shadow"
          >
            <option>Bangladesh</option>
            <option>Singapore</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>India</option>
            <option>Malaysia</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-md mb-8 cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">Securely save my information for 1-click checkout</p>
          <p className="text-xs text-gray-500 mt-0.5">Pay faster on Revolv3 merchants and everywhere Link is accepted.</p>
        </div>
      </label>

      <button
        onClick={onPay}
        disabled={isSubmitting}
        className="w-full bg-[#556cd6] hover:bg-[#4758b5] disabled:bg-[#97a4e4] text-white rounded-md py-3 text-sm font-semibold transition-colors"
      >
        {isSubmitting ? 'Processing...' : 'Pay'}
      </button>
    </div>
  );
}

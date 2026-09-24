interface VerificationCodePanelProps {
  verificationCode: string;
  isCharging: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
}

export function VerificationCodePanel({
  verificationCode,
  isCharging,
  onChange,
  onConfirm,
}: VerificationCodePanelProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full p-5 border-2 border-blue-200 bg-blue-50/50 rounded-lg animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#556cd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-800">Verification Required</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          A verification code has been sent to your registered device. Enter it below to confirm the payment.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter code (e.g. 123456)"
            maxLength={8}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
            autoFocus
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={onConfirm}
            disabled={isCharging || !verificationCode.trim()}
            className="flex-1 bg-[#556cd6] hover:bg-[#4758b5] disabled:bg-[#97a4e4] text-white rounded-md py-2.5 text-sm font-semibold transition-colors"
          >
            {isCharging ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

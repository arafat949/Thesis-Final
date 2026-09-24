import type { ReactNode } from 'react';
import type { PaymentReceipt } from '../types';

interface PaymentSuccessCardProps {
  receipt: PaymentReceipt;
}

function ReceiptRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export function PaymentSuccessCard({ receipt }: PaymentSuccessCardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute -inset-1 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
      <p className="text-gray-500 text-sm mb-8">Thank you for your order!</p>

      <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 mb-8">
        <ReceiptRow
          label="Transaction ID"
          value={
            <span className="font-mono text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
              {receipt.id?.slice(0, 18)}...
            </span>
          }
        />
        <ReceiptRow
          label="Amount"
          value={
            <span className="font-semibold text-gray-900">
              {receipt.currency} {receipt.amount.toFixed(2)}
            </span>
          }
        />
        <ReceiptRow
          label="Status"
          value={
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {receipt.status}
            </span>
          }
        />
        {receipt.gateway && (
          <ReceiptRow label="Gateway" value={<span className="capitalize">{receipt.gateway}</span>} />
        )}
        {receipt.transactionRef && (
          <ReceiptRow label="Reference" value={<span className="font-mono text-xs">{receipt.transactionRef}</span>} />
        )}
        {receipt.description && <ReceiptRow label="Description" value={receipt.description} />}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => window.close()}
          className="flex-1 bg-[#556cd6] hover:bg-[#4758b5] text-white rounded-md py-2.5 text-sm font-semibold transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md py-2.5 text-sm font-medium transition-colors"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}

import { FieldType } from '@amaderPay/web-sdk';
import { CardBrandStrip } from './components/CardBrandStrip';
import { FieldInput } from './components/FieldInput';
import { PaymentDivider } from './components/PaymentDivider';
import { SecurityCodeIcon } from './components/SecurityCodeIcon';
import { WalletButtons } from './components/WalletButtons';
import { useHostedFields } from './hooks/useHostedFields';
import type { WalletAccountType } from './types';

export function App() {
  const {
    paymentMethod,
    setSelectedPaymentMethod,
    values,
    errors,
    walletValues,
    walletErrors,
    cardNumberPlaceholder,
    handleInput,
    handleBlur,
    handleFocus,
    handleWalletInput,
    handleWalletBlur,
    handleWalletFocus,
    handleWalletAccountTypeChange,
  } = useHostedFields();

  return (
    <div class="flex flex-col gap-3 text-slate-900">
      <WalletButtons selectedMethod={paymentMethod} onSelect={setSelectedPaymentMethod} />

      {paymentMethod === 'card' ? (
        <>
          <PaymentDivider />

          <FieldInput
            id="card-number"
            name={FieldType.CardNumber}
            pattern="[0-9\\s]{13,19}"
            autoComplete="cc-number"
            maxLength={19}
            placeholder={cardNumberPlaceholder}
            errorId="error-cardNumber"
            errorMessage={errors[FieldType.CardNumber]}
            value={values[FieldType.CardNumber]}
            trailingAdornment={<CardBrandStrip />}
            onInput={(value) => handleInput(FieldType.CardNumber, value)}
            onBlur={() => handleBlur(FieldType.CardNumber)}
            onFocus={() => handleFocus(FieldType.CardNumber)}
          />

          <FieldInput
            id="expiration-date"
            name={FieldType.ExpirationDate}
            pattern="\\d\\d/\\d\\d"
            autoComplete="cc-exp"
            maxLength={7}
            placeholder="Expiration date"
            errorId="error-expirationDate"
            errorMessage={errors[FieldType.ExpirationDate]}
            value={values[FieldType.ExpirationDate]}
            onInput={(value) => handleInput(FieldType.ExpirationDate, value)}
            onBlur={() => handleBlur(FieldType.ExpirationDate)}
            onFocus={() => handleFocus(FieldType.ExpirationDate)}
          />

          <FieldInput
            id="cvv"
            name={FieldType.Cvv}
            pattern="\\d{3,4}"
            autoComplete="cc-csc"
            maxLength={4}
            placeholder="Security code"
            errorId="error-cvv"
            errorMessage={errors[FieldType.Cvv]}
            value={values[FieldType.Cvv]}
            trailingAdornment={
              <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                <SecurityCodeIcon />
              </div>
            }
            onInput={(value) => handleInput(FieldType.Cvv, value)}
            onBlur={() => handleBlur(FieldType.Cvv)}
            onFocus={() => handleFocus(FieldType.Cvv)}
          />
        </>
      ) : (
        <>
          <div class="flex items-center justify-between">
            <div class="text-[13px] font-medium text-slate-700">
              {paymentMethod === 'bkash' ? 'bKash details' : 'Nagad details'}
            </div>
            <button
              type="button"
              class="text-[13px] font-medium text-slate-600 underline-offset-2 hover:underline"
              onClick={() => setSelectedPaymentMethod('card')}
            >
              Use card instead
            </button>
          </div>

          <FieldInput
            id="wallet-mobile"
            name="MobileNumber"
            pattern="\\d{11,15}"
            autoComplete="tel"
            maxLength={15}
            placeholder="Mobile number"
            errorId="error-mobileNumber"
            errorMessage={walletErrors.mobileNumber}
            value={walletValues.mobileNumber}
            onInput={(value) => handleWalletInput('mobileNumber', value)}
            onBlur={() => handleWalletBlur('mobileNumber')}
            onFocus={handleWalletFocus}
          />

          <FieldInput
            id="wallet-pin"
            name="PinCode"
            pattern="\\d{4,6}"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="PIN code"
            errorId="error-pinCode"
            errorMessage={walletErrors.pinCode}
            value={walletValues.pinCode}
            onInput={(value) => handleWalletInput('pinCode', value)}
            onBlur={() => handleWalletBlur('pinCode')}
            onFocus={handleWalletFocus}
          />

          <div class="space-y-1">
            <div class="relative">
              <select
                id="wallet-account-type"
                name="AccountType"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-[15px] text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200"
                value={walletValues.accountType}
                onChange={(event) => handleWalletAccountTypeChange(event.currentTarget.value as WalletAccountType)}
                onBlur={() => handleWalletBlur('accountType')}
                onFocus={handleWalletFocus}
              >
                <option value="personal">Personal</option>
                <option value="merchant">Merchant</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
            <div id="error-accountType" aria-live="polite" class="min-h-[18px] text-[13px] text-red-600">
              {walletErrors.accountType}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

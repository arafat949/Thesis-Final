import { Toaster } from 'react-hot-toast';
import { OrderSummary } from './components/OrderSummary';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentForm } from './components/PaymentForm';
import { VerificationPanel } from './components/VerificationPanel';
import { CheckoutFooter } from './components/CheckoutFooter';
import { useCheckoutPayment } from './hooks/useCheckoutPayment';

const ORDER = {
  productName: 'Egg x 36, dozen 3',
  amount: 299.0,
  orderLabel: 'development local - Order 1129',
};

function App() {
  const {
    isLoading,
    isSubmitting,
    showVerification,
    verificationCode,
    setVerificationCode,
    isCharging,
    paymentSuccess,
    chargeResult,
    createPaymentIntent,
    confirmPayment,
    resetPayment,
  } = useCheckoutPayment();

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '14px', borderRadius: '8px' },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            },
          },
        }}
      />

      <OrderSummary {...ORDER} />

      <div className="flex-1 bg-white flex flex-col">
        <div className="max-w-[480px] w-full flex flex-col justify-center mx-auto px-6 py-4 flex-1">
          {paymentSuccess && chargeResult && (
            <PaymentSuccess
              chargeResult={chargeResult}
              onNewPayment={resetPayment}
            />
          )}

          <PaymentForm
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            disabled={showVerification}
            onPay={createPaymentIntent}
            showVerification={showVerification}
            paymentSuccess={paymentSuccess}
          />

          {showVerification && !paymentSuccess && (
            <VerificationPanel
              verificationCode={verificationCode}
              isCharging={isCharging}
              onCodeChange={setVerificationCode}
              onConfirm={confirmPayment}
            />
          )}
        </div>

        <CheckoutFooter />
      </div>
    </div>
  );
}

export default App;
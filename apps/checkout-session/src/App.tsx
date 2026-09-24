import { useEffect, useRef, useState } from 'react';
import { init } from '@amaderPay/web-sdk';
import toast, { Toaster } from 'react-hot-toast';
import { CheckoutFooter } from './components/CheckoutFooter';
import { CheckoutStatusScreen } from './components/CheckoutStatusScreen';
import { CheckoutSummaryPanel } from './components/CheckoutSummaryPanel';
import { PaymentEntryForm } from './components/PaymentEntryForm';
import { PaymentSuccessCard } from './components/PaymentSuccessCard';
import { VerificationCodePanel } from './components/VerificationCodePanel';
import type { CheckoutSession, PaymentIntentResult, PaymentReceipt } from './types';

const API_BASE = 'http://localhost:4400';

interface HostedFieldsApi {
  create(options: { selector: string }): Promise<void>;
  PaymentIntent(
    amount: { currency: string; value: number },
    description?: string,
    mccCode?: string
  ): Promise<PaymentIntentResult>;
  PaymentConfirm(clientSecret: string, verificationCode?: string): Promise<{
    id: string;
    status: string;
    message?: string;
    gateway?: string;
    transactionRef?: string;
  }>;
}

function App() {
    const isInitialized = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hostedFields, setHostedFields] = useState<HostedFieldsApi | null>(null);

    // Session state
    const [session, setSession] = useState<CheckoutSession | null>(null);
    const [sessionError, setSessionError] = useState<string | null>(null);

    // Two-step payment state
    const [intentResult, setIntentResult] = useState<PaymentIntentResult | null>(null);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isCharging, setIsCharging] = useState(false);

    // Success state
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

    // Fetch checkout session from URL param
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session');
      if (!sessionId) {
        setSessionError('No checkout session specified. This page should be opened from a checkout link.');
        setIsLoading(false);
        return;
      }
      fetch(`${API_BASE}/v1/checkout/sessions/${encodeURIComponent(sessionId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setSessionError(data.error);
          } else if (data.status === 'expired') {
            setSessionError('This checkout session has expired.');
          } else if (data.status === 'completed') {
            setSessionError('This checkout session has already been completed.');
          } else {
            setSession(data);
          }
        })
        .catch(() => setSessionError('Failed to load checkout session.'));
    }, []);
  
    useEffect(() => {
      if (isInitialized.current || !session) return;
      isInitialized.current = true;
      const setupHostedFields = async () => {
        try {
            const hostedFields = init({
              publicKey: 'sk_test_halalpay_demo_123',
              environment: 'sandbox',
            }) as HostedFieldsApi;
            await hostedFields.create({
              selector: '#payment-fields-container',
            });
            setHostedFields(hostedFields);
        } 
        catch (error) {
          console.error('Error setting up hosted fields:', error);
        } 
        setIsLoading(false);
      };
      setupHostedFields();
    }, [session])

    // Step 1: Create Payment Intent
    const paymentIntentHandler = async () => {
        if (!session) return;
        setIsSubmitting(true);
        try {
          if (!hostedFields) {
            toast.error('Hosted fields not initialized');
            return;
          }
          const intent = await hostedFields.PaymentIntent(
            { currency: session.currency, value: session.amount },
            session.description || 'Checkout payment',
            '5411'
          );
          setIntentResult(intent);
          toast.success(`Intent created — ID: ${intent.id}`);
          setShowVerification(true);
        } catch (e: any) {
          const msg = typeof e === 'string' ? e : e?.message || 'Payment intent failed';
          toast.error(msg);
          console.error('Payment intent failed', e);
        }
        setIsSubmitting(false);
    };

    // Step 2: Charge with verification code
    const paymentChargeHandler = async () => {
        if (!verificationCode.trim()) {
          toast.error('Please enter a verification code');
          return;
        }
        if (!hostedFields) {
          toast.error('Hosted fields not initialized');
          return;
        }
        if (!intentResult?.clientSecret) {
          toast.error('No payment intent found — create one first');
          return;
        }

        setIsCharging(true);
        try {
          const confirm = await hostedFields.PaymentConfirm(intentResult.clientSecret, verificationCode.trim());
          if (confirm.status === 'success') {
            const normalizedReceipt: PaymentReceipt = {
              id: confirm.id,
              status: confirm.status,
              message: confirm.message,
              gateway: confirm.gateway,
              transactionRef: confirm.transactionRef,
              currency: intentResult.currency || session?.currency || 'USD',
              amount: intentResult.amount ?? session?.amount ?? 0,
              description: intentResult.description || session?.description || undefined,
            };

            toast.success('Payment successful!', { duration: 4000, icon: '✅' });
            setReceipt(normalizedReceipt);
            setPaymentSuccess(true);

            // Notify API that session is complete
            if (session) {
              fetch(`${API_BASE}/v1/checkout/sessions/${encodeURIComponent(session.id)}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: confirm.id }),
              }).catch(err => console.error('Failed to mark session complete', err));
            }
          } else {
            toast.error(`Payment ${confirm.status}: ${confirm.message || 'declined'}`, { duration: 4000 });
            setIntentResult(null);
          }
          setShowVerification(false);
          setVerificationCode('');

        } catch (e: any) {
          const msg = typeof e === 'string' ? e : e?.message || 'Payment confirmation failed';
          toast.error(msg, { duration: 4000 });
          console.error('Payment confirmation failed', e);
        }
        setIsCharging(false);
    };

    // Error / no-session screen
    if (sessionError) {
      return <CheckoutStatusScreen title="Checkout Unavailable" message={sessionError} />;
    }

    // Loading session
    if (!session) {
      return <CheckoutStatusScreen title="Loading Checkout" message="Loading checkout session..." />;
    }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '14px', borderRadius: '8px' },
        success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
        error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
      }} />

      <CheckoutSummaryPanel session={session} />

      <div className="flex-1 bg-white flex flex-col">
        <div className="max-w-[480px] w-full mx-auto px-6 py-4 flex-1">
          {paymentSuccess && receipt && <PaymentSuccessCard receipt={receipt} />}
          <PaymentEntryForm
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            hidden={showVerification || paymentSuccess}
            onPay={paymentIntentHandler}
          />
          {showVerification && !paymentSuccess && (
            <VerificationCodePanel
              verificationCode={verificationCode}
              isCharging={isCharging}
              onChange={setVerificationCode}
              onConfirm={paymentChargeHandler}
            />
          )}
        </div>
        <CheckoutFooter />
      </div>
    </div>
  );
}

export default App;

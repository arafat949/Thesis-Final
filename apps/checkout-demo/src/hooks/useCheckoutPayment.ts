import { useEffect, useRef, useState } from 'react';
import { init, type HostedFieldsInstance } from '@amaderPay/web-sdk';
import toast from 'react-hot-toast';
import type { ChargeResult, PaymentIntentData } from '../types/types';

const PUBLIC_KEY = 'sk_test_halalpay_demo_123';
const PAYMENT_AMOUNT = { currency: 'USD', value: 299.0 };
const PAYMENT_DESCRIPTION = 'Grocery purchase';
const MCC_CODE = '5411';

export function useCheckoutPayment() {
  const isInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostedFields, setHostedFields] = useState<HostedFieldsInstance | null>(null);

  const [intentResult, setIntentResult] = useState<PaymentIntentData | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCharging, setIsCharging] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [chargeResult, setChargeResult] = useState<ChargeResult | null>(null);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const setupHostedFields = async () => {
      try {
        const fields = init({
          publicKey: PUBLIC_KEY,
          environment: 'sandbox',
        });
        await fields.create({ selector: '#payment-fields-container' });
        setHostedFields(fields);
      } catch (error) {
        console.error('Error setting up hosted fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupHostedFields();
  }, []);

  const createPaymentIntent = async () => {
    setIsSubmitting(true);
    try {
      if (!hostedFields) {
        toast.error('Hosted fields not initialized');
        return;
      }

      const intent = await hostedFields.PaymentIntent(
        PAYMENT_AMOUNT,
        PAYMENT_DESCRIPTION,
        MCC_CODE
      );
      setIntentResult(intent as unknown as PaymentIntentData);
      toast.success(`Intent created — ID: ${intent.id}`);
      setShowVerification(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Payment intent failed';
      toast.error(msg);
      console.error('Payment intent failed', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmPayment = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter a verification code');
      return;
    }
    if (!intentResult?.clientSecret) {
      toast.error('No payment intent found — create one first');
      return;
    }
    if (!hostedFields) {
      toast.error('Hosted fields not initialized');
      return;
    }

    setIsCharging(true);
    try {
      const result = await (hostedFields as unknown as {
        PaymentConfirm(clientSecret: string): Promise<ChargeResult>;
      }).PaymentConfirm(intentResult.clientSecret);

      if (result.status === 'success') {
        toast.success('Payment successful!', { duration: 4000, icon: '✅' });
        setChargeResult({
          ...result,
          currency: intentResult.currency,
          amount: intentResult.amount,
          description: intentResult.description,
        });
        setPaymentSuccess(true);
      } else {
        toast.error(`Payment ${result.status}: ${result.message || 'declined'}`, { duration: 4000 });
        setIntentResult(null);
      }
      setShowVerification(false);
      setVerificationCode('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Payment confirmation failed';
      toast.error(msg, { duration: 4000 });
      console.error('Payment confirmation failed', e);
    } finally {
      setIsCharging(false);
    }
  };

  const resetPayment = () => {
    setPaymentSuccess(false);
    setChargeResult(null);
    setIntentResult(null);
    setShowVerification(false);
    setVerificationCode('');
  };

  return {
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
  };
}

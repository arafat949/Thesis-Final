import { init, PaymentConfirmResult } from '@amaderPay/web-sdk';

const form = document.getElementById('payment-form') as HTMLFormElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;

const hostedFields = init({
  publicKey: 'sk_test_halalpay_demo_123',
  environment: 'sandbox',
});

async function initializeFields(): Promise<void> {
  try {
    await hostedFields.create({
        selector: '#fields-container',
    });
    
  } catch (error) {
    showResult(false, 'Failed to load payment form.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  resultDiv.className = 'result';
  
  try {
    const intentRes = await fetch('http://localhost:4400/v1/payments/intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk_test_halalpay_demo_123`
      },
      body: JSON.stringify({
        amount: 99,
        currency: 'USD',
        description: 'Demo Payment'
      })
    });
    
    if (!intentRes.ok) {
      throw new Error(`Intent creation failed: ${await intentRes.text()}`);
    }

    const { clientSecret } = await intentRes.json();
    console.log('[Demo] Received Client Secret:', clientSecret);

    const result = await hostedFields.PaymentConfirm(clientSecret);
    
    showResult(true, 'Payment Request Successful!', result);
    hostedFields.clear();
    
  } catch (error: any) {
    showResult(false, error.message || 'Payment failed.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Pay';
  }
});


function showResult(success: boolean, message: string, payload?: PaymentConfirmResult | string): void {
  resultDiv.className = `result ${success ? 'success' : 'error'}`;
  resultDiv.innerHTML = `
    <div>${message}</div>
    ${payload ? `<pre class="payload">${JSON.stringify(payload, null, 2)}</pre>` : ''}
  `;
}

initializeFields();

import { Router } from "express";
import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { verifyCompliance } from "../services/compliance";
import { routeCharge } from "../services/gateway-router";
import { detectPaymentType, cardLast4, detectBrand } from "../helpers";
import { intentSchema, confirmSchema } from "../helpers";

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/payments/intent
// Creates pending Transaction with a secured amount and client_secret.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/payments/intent", async (req, res) => {
  const merchant = (req as any).merchant;

  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { amount, currency, description, mccCode } = parsed.data;

  try {
    const clientSecret = "pi_" + crypto.randomBytes(16).toString("hex");

    const tx = await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        amount,
        currency,
        status: "requires_payment_method",
        mccCode,
        description,
        clientSecret,
      },
    });

    return res.status(201).json({
      id: tx.id,
      merchantId: tx.merchantId,
      clientSecret: tx.clientSecret,
      currency: tx.currency,
      amount: tx.amount,
      status: tx.status,
      description: tx.description,
      mccCode: tx.mccCode,
      createdAt: tx.createdAt,
    });
  } catch (err) {
    console.error("intent error", err);
    return res.status(500).json({ error: "Failed to create intent" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/payments/intent/:id/confirm
// Associates PaymentMethod with Transaction and proceeds to charge.
// Here, :id is the clientSecret since the frontend only has that.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/payments/intent/:id/confirm", async (req, res) => {
  const merchant = (req as any).merchant;
  const clientSecret = req.params.id;

  const parsed = confirmSchema.safeParse({ clientSecret, ...req.body });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { paymentMethod: pm } = parsed.data;

  const tx = await prisma.transaction.findFirst({
    where: { clientSecret, merchantId: merchant.id },
  });

  if (!tx || tx.status !== "requires_payment_method") {
    return res.status(400).json({ error: "Invalid transaction state or credentials" });
  }

  const compliance = verifyCompliance(tx.mccCode || undefined);
  if (!compliance.ok) {
    return res.status(403).json({ error: "Compliance check failed", reason: compliance.reason });
  }

  const gateway = detectPaymentType(pm);

  try {
    const billingName = [pm.BillingFirstName, pm.BillingLastName].filter(Boolean).join(" ") || null;

    const savedPM = await prisma.paymentMethod.create({
      data: {
        merchantId: merchant.id,
        type: gateway,
        cardLast4: pm.CreditCard ? cardLast4(pm.CreditCard.PaymentAccountNumber) : null,
        cardBrand: pm.CreditCard ? detectBrand(pm.CreditCard.PaymentAccountNumber) : null,
        cardExpiry: pm.CreditCard?.ExpirationDate ?? null,
        mobileNumber: pm.Bkash?.MobileNumber ?? pm.Nagad?.MobileNumber ?? null,
        accountType: pm.Bkash?.AccountType ?? pm.Nagad?.AccountType ?? null,
        billingName,
        billingAddr: pm.BillingAddress ? JSON.stringify(pm.BillingAddress) : null,
      },
    });

    const updatedTx = await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        paymentMethodId: savedPM.id,
        gateway,
        status: "processing", // optionally set this here
      },
      include: { paymentMethod: true },
    });

    // Proceed to attempt direct charge via gateway logic 
    // We run it as a synchronous charge.
    const result = await routeCharge(updatedTx.gateway!, {
      amount: updatedTx.amount,
      currency: updatedTx.currency,
      paymentMethodId: updatedTx.paymentMethodId!,
      metadata: {
        transactionId: updatedTx.id,
        cardLast4: savedPM.cardLast4,
      }
    });

    const finalStatus = result.success ? "success" : "failed";

    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: finalStatus,
        message: result.message,
        gatewayRef: result.gatewayRef,
      }
    });

    return res.status(200).json({
      id: updatedTx.id,
      status: finalStatus,
      gateway: updatedTx.gateway,
      message: result.message,
      transactionRef: result.gatewayRef,
    });
  } catch (err) {
    console.error("intent confirm error", err);
    return res.status(500).json({ error: "Failed to confirm intent" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/payments/:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/payments/:id", async (req, res) => {
  const merchant = (req as any).merchant;
  const { id } = req.params;
  try {
    const tx = await prisma.transaction.findFirst({
      where: { id, merchantId: merchant.id },
      include: { paymentMethod: true },
    });
    if (!tx) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({
      id: tx.id,
      merchantId: tx.merchantId,
      paymentMethodId: tx.paymentMethodId,
      currency: tx.currency,
      value: tx.amount,
      message: tx.message,
      description: tx.description,
      mccCode: tx.mccCode,
      gateway: tx.gateway,
      status: tx.status,
      gatewayRef: tx.gatewayRef,
      paymentMethod: tx.paymentMethod
        ? {
            type: tx.paymentMethod.type,
            cardLast4: tx.paymentMethod.cardLast4,
            cardBrand: tx.paymentMethod.cardBrand,
            mobileNumber: tx.paymentMethod.mobileNumber,
          }
        : null,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    });
  } catch (err) {
    console.error("get tx error", err);
    return res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

export default router;

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

// Two routers: one behind auth (session creation), one public (browser checkout)
const authenticated = Router();
const publicRouter = Router();

const CHECKOUT_URL = process.env.CHECKOUT_URL || "http://localhost:4200";
const SESSION_TTL_MINUTES = 30;

const createSessionSchema = z.object({
  cartId: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  mccCode: z.string().optional(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/checkout/sessions
// Agent creates a secure checkout session → returns a URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
authenticated.post("/checkout/sessions", async (req, res) => {
  const merchant = (req as any).merchant;

  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { cartId, currency, description, mccCode } = parsed.data;
  let amount = parsed.data.amount;
  let sessionDescription = description;
  let resolvedCartId = cartId;

  // If cartId provided (or neither cartId nor amount), resolve from cart
  if (cartId || !amount) {
    const cartWhere = cartId
      ? { id: cartId, merchantId: merchant.id, status: "open" }
      : { merchantId: merchant.id, status: "open" };

    const cart = await prisma.cart.findFirst({
      where: cartWhere,
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or not found" });
    }

    const cartTotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    amount = Math.round(cartTotal * 100) / 100;
    resolvedCartId = cart.id;

    if (!sessionDescription) {
      const itemSummary = cart.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ");
      sessionDescription = `Cart checkout: ${itemSummary}`;
    }
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be positive" });
  }

  try {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

    const session = await prisma.checkoutSession.create({
      data: {
        merchantId: merchant.id,
        cartId: resolvedCartId,
        amount,
        currency,
        description: sessionDescription,
        mccCode,
        status: "pending",
        expiresAt,
      },
    });

    return res.status(201).json({
      id: session.id,
      url: `${CHECKOUT_URL}?session=${session.id}`,
      amount: session.amount,
      currency: session.currency,
      description: session.description,
      status: session.status,
      expiresAt: session.expiresAt,
    });
  } catch (err) {
    console.error("checkout session error", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/checkout/sessions/:id
// Get session details (used by hosted checkout page + agent polling)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
publicRouter.get("/checkout/sessions/:id", async (req, res) => {
  try {
    const session = await prisma.checkoutSession.findUnique({
      where: { id: req.params.id },
    });

    if (!session) return res.status(404).json({ error: "Session not found" });

    // Check expiry
    if (session.status === "pending" && new Date() > session.expiresAt) {
      await prisma.checkoutSession.update({
        where: { id: session.id },
        data: { status: "expired" },
      });
      return res.json({ ...session, status: "expired" });
    }

    return res.json({
      id: session.id,
      amount: session.amount,
      currency: session.currency,
      description: session.description,
      status: session.status,
      transactionId: session.transactionId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    });
  } catch (err) {
    console.error("get session error", err);
    return res.status(500).json({ error: "Failed to fetch session" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/checkout/sessions/:id/complete
// Called by the hosted checkout page after successful payment
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
publicRouter.post("/checkout/sessions/:id/complete", async (req, res) => {
  const { transactionId } = req.body;

  try {
    const session = await prisma.checkoutSession.findUnique({
      where: { id: req.params.id },
    });

    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "pending") {
      return res.status(409).json({ error: `Session already ${session.status}` });
    }
    if (new Date() > session.expiresAt) {
      await prisma.checkoutSession.update({
        where: { id: session.id },
        data: { status: "expired" },
      });
      return res.status(410).json({ error: "Session expired" });
    }

    // Mark session complete
    const updated = await prisma.checkoutSession.update({
      where: { id: session.id },
      data: { status: "completed", transactionId },
    });

    // Mark cart as checked out if linked
    if (session.cartId) {
      await prisma.cart.update({
        where: { id: session.cartId },
        data: { status: "checked_out" },
      }).catch(() => {}); // non-critical
    }

    return res.json({
      id: updated.id,
      status: updated.status,
      transactionId: updated.transactionId,
    });
  } catch (err) {
    console.error("complete session error", err);
    return res.status(500).json({ error: "Failed to complete session" });
  }
});

export default { authenticated, public: publicRouter };

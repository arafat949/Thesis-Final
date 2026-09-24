import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/cart
// Get or create the merchant's active cart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/cart", async (req, res) => {
  const merchant = (req as any).merchant;

  try {
    let cart = await prisma.cart.findFirst({
      where: { merchantId: merchant.id, status: "open" },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { merchantId: merchant.id },
        include: { items: { include: { product: true } } },
      });
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return res.json({
      id: cart.id,
      status: cart.status,
      itemCount: cart.items.length,
      total: Math.round(total * 100) / 100,
      currency: "USD",
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: Math.round(item.product.price * item.quantity * 100) / 100,
        category: item.product.category,
      })),
    });
  } catch (err) {
    console.error("get cart error", err);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/cart/add
// Add item to cart { productId, quantity }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/cart/add", async (req, res) => {
  const merchant = (req as any).merchant;
  const { productId, quantity = 1 } = req.body;

  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) return res.status(404).json({ error: "Product not found" });
    if (product.stock < quantity) return res.status(409).json({ error: "Insufficient stock", available: product.stock });

    // Get or create open cart
    let cart = await prisma.cart.findFirst({ where: { merchantId: merchant.id, status: "open" } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { merchantId: merchant.id } });
    }

    // Upsert cart item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    // Return updated cart
    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    const total = updated!.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return res.json({
      message: `Added ${quantity}x "${product.name}" to cart`,
      cartId: cart.id,
      itemCount: updated!.items.length,
      total: Math.round(total * 100) / 100,
      currency: "USD",
    });
  } catch (err) {
    console.error("add to cart error", err);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/cart/remove
// Remove item from cart { productId }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/cart/remove", async (req, res) => {
  const merchant = (req as any).merchant;
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ error: "productId is required" });

  try {
    const cart = await prisma.cart.findFirst({ where: { merchantId: merchant.id, status: "open" } });
    if (!cart) return res.status(404).json({ error: "No active cart" });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    const total = updated!.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return res.json({
      message: "Item removed from cart",
      cartId: cart.id,
      itemCount: updated!.items.length,
      total: Math.round(total * 100) / 100,
      currency: "USD",
    });
  } catch (err) {
    console.error("remove from cart error", err);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /v1/cart/clear
// Clear all items from the active cart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/cart/clear", async (req, res) => {
  const merchant = (req as any).merchant;

  try {
    const cart = await prisma.cart.findFirst({ where: { merchantId: merchant.id, status: "open" } });
    if (!cart) return res.status(404).json({ error: "No active cart" });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.json({ message: "Cart cleared", cartId: cart.id, itemCount: 0, total: 0 });
  } catch (err) {
    console.error("clear cart error", err);
    return res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;

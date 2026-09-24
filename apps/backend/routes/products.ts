import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/products/search?q=&category=&minPrice=&maxPrice=&sortBy=
// Search and filter products
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/products/search", async (req, res) => {
  const { q, category, minPrice, maxPrice, sortBy, limit } = req.query;

  const where: Record<string, unknown> = { active: true };

  if (category) {
    where.category = String(category);
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
  }

  // Text search across name, description, tags
  if (q) {
    where.OR = [
      { name: { contains: String(q) } },
      { description: { contains: String(q) } },
      { tags: { contains: String(q) } },
      { brand: { contains: String(q) } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  else if (sortBy === "price_desc") orderBy = { price: "desc" };
  else if (sortBy === "rating") orderBy = { rating: "desc" };
  else if (sortBy === "name") orderBy = { name: "asc" };

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: Math.min(Number(limit) || 20, 50),
    });
    return res.json({ count: products.length, products });
  } catch (err) {
    console.error("product search error", err);
    return res.status(500).json({ error: "Failed to search products" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/products/:id
// Get product details
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (err) {
    console.error("get product error", err);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /v1/products/categories/list
// List all product categories
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/products/categories/list", async (_req, res) => {
  try {
    const categories = await prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
    });
    return res.json({ categories: categories.map((c) => c.category) });
  } catch (err) {
    console.error("categories error", err);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;

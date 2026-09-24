import "dotenv/config";
import express from "express";
import cors from "cors";
import v1PaymentsRouter from "./routes/payments";
import v1ProductsRouter from "./routes/products";
import v1CartRouter from "./routes/cart";
import v1CheckoutRouter from "./routes/checkout";
import { authMiddleware } from "./middleware/auth";

const app = express();
const port = process.env.PORT || 4400;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Public-Key",
      "X-Session-Id",
      "X-Idempotency-Key",
    ],
  })
);

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "HalalPay API", version: "0.1.0" });
});
app.get("/healthz", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ─── Public routes (no auth — accessed by hosted checkout page) ──
app.use("/v1", v1CheckoutRouter.public);

// ─── Unified v1 API (secured with merchant API key) ─────────
app.use("/v1", authMiddleware, v1PaymentsRouter);
app.use("/v1", authMiddleware, v1CheckoutRouter.authenticated);


// A demo e-commerce API for testing mcp server with agentic payments
app.use("/v1", authMiddleware, v1ProductsRouter);
app.use("/v1", authMiddleware, v1CartRouter);


app.use((req, res) => {
  res.status(404).json({
    error: {
      type: "invalid_request_error",
      code: "not_found",
      message: `Route not found: ${req.method} ${req.url}`,
    },
  });
});

app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  HalalPay API Server                                      ║
║  Running at: http://localhost:${port}                        ║
║                                                           ║
║  Routes:                                                  ║
║  • GET  /              - Service info                     ║
║  • GET  /healthz       - Health check                     ║
║  • /v1/payments/*      - Unified Payment API (auth req.)  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

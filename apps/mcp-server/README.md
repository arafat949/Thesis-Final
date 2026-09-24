# halalpay MCP Server

The **Agentic Commerce Protocol** layer for halalpay — enables AI agents (Claude, GPT, etc.) to discover, evaluate, and execute payments through the Model Context Protocol (MCP).

## Architecture

```
┌─────────────────────┐
│   AI Agent (Claude) │
└─────────┬───────────┘
          │ MCP (stdio)
┌─────────▼───────────┐
│  MCP Server (this)  │  ← Agentic Layer
│  6 Tools exposed    │
└─────────┬───────────┘
          │ HTTP REST
┌─────────▼───────────┐
│  halalpay API       │  ← Operations Layer
│  Express + Prisma   │
└─────────────────────┘
```

## Tools

| Tool | Description |
|------|-------------|
| `create_payment_intent` | Draft a pending payment (requires explicit charge) |
| `execute_payment` | Charge a previously created payment intent |
| `get_transaction` | Look up transaction status by ID |

## Quick Start

### 1. Start the halalpay API (required for payment tools)
```bash
nx serve backend
```

### 2. Run the MCP server
```bash
npx tsx apps/mcp-server/server.ts
```

### 3. Configure Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "amaderPay": {
      "command": "npx",
      "args": [
        "tsx",
        "C:\\Users\\suaeb\\Desktop\\Thesis-project-final\\apps\\mcp-server\\server.ts"
      ],
      "env": {
        "HALALPAY_API_URL": "http://localhost:4400",
        "HALALPAY_API_KEY": "sk_test_halalpay_demo_123"
      }
    }
  },
  "preferences": {
    "coworkScheduledTasksEnabled": false,
    "coworkWebSearchEnabled": true,
    "sidebarMode": "chat"
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HALALPAY_API_URL` | `http://localhost:4400` | halalpay API base URL |
| `HALALPAY_API_KEY` | `sk_test_halalpay_demo_123` | Merchant API key for auth |

## Example Agent Workflow

> **User:** "I want to buy some product under 500 USD to a grocery store. What's the cheapest option?"

The agent would:
3. Call `create_payment_intent` with gateway `nagad` → returns `transaction_id`
4. Present the intent to the user for approval
5. Call `execute_payment` with the transaction ID → payment settled

## Prompts examples for testing:
- Find a smartphone with good reviews between ৳50,000 and ৳80,000. then add the cheapest phone to my cart and checkout


# Presentation: Agentic Payment, Commerce & MCP Server

---

## How It Works (End-to-End)

```
User: "Find groceries under ৳500"
  → Agent calls search_products ─── GET /v1/products/search
  ← Returns product list

User: "Add rice and oil to cart"
  → Agent calls manage_cart(add) ─── POST /v1/cart/add
  ← Cart total: ৳380

User: "Checkout"
  → Agent calls checkout_cart ────── POST /v1/checkout/sessions
  ← { checkoutUrl: "…?session=abc123" }
  → Agent shares URL with user

User opens URL in browser
  → Hosted Fields (Web SDK) render in iframe
  → User enters card details (PCI compliant — agent never sees this)
  → PaymentIntent → Verification → PaymentCharge
  → Checkout page calls POST /sessions/abc123/complete

User: "Did it work?"
  → Agent calls get_payment_status ─ GET /v1/checkout/sessions/abc123
  ← { status: "completed", transaction: { amount: 380, gateway: "card" } }
  → Agent: "✅ ৳380 paid successfully!"
```

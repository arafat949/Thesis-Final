#!/usr/bin/env node
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  HalalPay MCP Server — Agentic Commerce Protocol
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  This server implements the Model Context Protocol (MCP) and
//  exposes HalalPay capabilities as "Tools" that AI agents
//  (Claude, GPT, etc.) can discover and invoke.
//
//  Transport: stdio  (suitable for Claude Desktop, VS Code, etc.)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import * as getTransaction from "./tools/get-transaction.js";
import * as searchProducts from "./tools/search-products.js";
import * as manageCart from "./tools/manage-cart.js";
import * as checkoutCart from "./tools/checkout-cart.js";
import * as getPaymentStatus from "./tools/get-payment-status.js";

const server = new McpServer({
  name: "halalpay",
  version: "0.1.0",
});

server.tool(
  getTransaction.name,
  getTransaction.description,
  getTransaction.schema.shape,
  async (args) => ({
    content: [
      { type: "text", text: JSON.stringify(await getTransaction.execute(args), null, 2) },
    ],
  })
);

server.tool(
  searchProducts.name,
  searchProducts.description,
  searchProducts.schema.shape,
  async (args) => ({
    content: [
      { type: "text", text: JSON.stringify(await searchProducts.execute(args), null, 2) },
    ],
  })
);

server.tool(
  manageCart.name,
  manageCart.description,
  manageCart.schema.shape,
  async (args) => ({
    content: [
      { type: "text", text: JSON.stringify(await manageCart.execute(args), null, 2) },
    ],
  })
);

server.tool(
  checkoutCart.name,
  checkoutCart.description,
  checkoutCart.schema.shape,
  async (args) => ({
    content: [
      { type: "text", text: JSON.stringify(await checkoutCart.execute(args), null, 2) },
    ],
  })
);

server.tool(
  getPaymentStatus.name,
  getPaymentStatus.description,
  getPaymentStatus.schema.shape,
  async (args) => ({
    content: [
      { type: "text", text: JSON.stringify(await getPaymentStatus.execute(args), null, 2) },
    ],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("halalpay MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

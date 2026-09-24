// ─── HalalPay API Client ─────────────────────────────────────
// Lightweight HTTP client for calling the HalalPay REST API
// from the MCP server (Agentic Layer → Operations Layer).

const API_BASE = process.env.HALALPAY_API_URL || "http://localhost:4400";
const API_KEY = process.env.HALALPAY_API_KEY || "sk_test_halalpay_demo_123";

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function apiCall<T = unknown>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json()) as T;
  return { ok: res.ok, status: res.status, data };
}

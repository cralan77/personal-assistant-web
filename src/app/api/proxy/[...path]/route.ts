import { NextRequest, NextResponse } from "next/server";

function getDestinationUrl(pathSegments: string[], req: NextRequest): string {
  const service = pathSegments[0];
  const rest = pathSegments.slice(1).join("/");

  const baseDomain = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const authBase = process.env.AUTH_SERVICE_URL || (baseDomain ? `${baseDomain}/auth` : "http://localhost:8082");
  const healthBase = process.env.HEALTH_SERVICE_URL || (baseDomain ? `${baseDomain}/health` : "http://localhost:8081");
  const financeBase = process.env.FINANCIAL_SERVICE_URL || (baseDomain ? `${baseDomain}/finance` : "http://localhost:8080");
  const botBase = process.env.BOT_GATEWAY_URL || (baseDomain ? `${baseDomain}/bot` : "http://localhost:8081");

  let targetUrl: string;

  if (service === "auth") {
    targetUrl = `${authBase}/api/auth/${rest}`;
  } else if (service === "health") {
    targetUrl = `${healthBase}/api/health/${rest}`;
  } else if (["financial-entries", "bills", "incomes", "wallets", "categories", "sub-categories", "credit-cards"].includes(service)) {
    targetUrl = `${financeBase}/api/${service}${rest ? `/${rest}` : ""}`;
  } else if (service === "assistant") {
    targetUrl = `${botBase}/api/assistant/${rest}`;
  } else {
    throw new Error(`Serviço desconhecido: ${service}`);
  }

  const search = req.nextUrl.search;
  return targetUrl + search;
}

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    const targetUrl = getDestinationUrl(path, req);

    const headers = new Headers();
    req.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!["host", "content-length", "transfer-encoding", "connection", "expect"].includes(lowerKey)) {
        headers.set(key, val);
      }
    });

    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await response.arrayBuffer();
    const resHeaders = new Headers();
    response.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(lowerKey)) {
        resHeaders.set(key, val);
      }
    });

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("[Runtime Proxy Error]:", error);
    return NextResponse.json(
      { error: error.message || "Proxy error" },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
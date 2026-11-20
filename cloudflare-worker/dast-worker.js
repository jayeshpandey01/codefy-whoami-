/**
 * Cloudflare Worker: Reverse Proxy & Edge Gateway for Codefy DAST Microservice
 *
 * Proxies incoming API requests to the Codefy DAST backend (https://dast-js9w.onrender.com)
 * with full CORS headers, streaming (SSE) support for /v1/jobs/{id}/stream, and body forwarding.
 * Deployed at: https://dast.pandeyjayesh020.workers.dev
 */

// SECURITY: Only these origins receive credentialed CORS responses.
const ALLOWED_ORIGINS = new Set([
  "https://cmd-d-llm.vercel.app",
  "vscode-webview://",
]);

function resolveAllowOrigin(origin) {
  if (!origin) return "null";
  for (const allowed of ALLOWED_ORIGINS) {
    if (origin === allowed || origin.startsWith(allowed)) return origin;
  }
  return "null";
}

export default {
  async fetch(request, env) {
    const BACKEND_URL = env?.BACKEND_URL || "https://dast-js9w.onrender.com";

    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, BACKEND_URL);

    const origin = request.headers.get("Origin") || "";
    const allowOrigin = resolveAllowOrigin(origin);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowOrigin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
          "Access-Control-Allow-Credentials": allowOrigin !== "null" ? "true" : "false",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Clone headers and rewrite the Host header for the backend
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("Host", targetUrl.host);
    forwardHeaders.set("X-Forwarded-Host", incomingUrl.host);
    forwardHeaders.set("X-Forwarded-Proto", incomingUrl.protocol.replace(":", ""));

    // Forward request to backend
    const hasBody = !["GET", "HEAD"].includes(request.method);
    const backendResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: hasBody ? request.body : undefined,
      redirect: "follow",
    });

    // Copy backend response headers and attach CORS permissions
    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.set("Access-Control-Allow-Origin", allowOrigin);
    responseHeaders.set("Access-Control-Allow-Credentials", allowOrigin !== "null" ? "true" : "false");
    responseHeaders.set("Access-Control-Expose-Headers", "*");

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  },
};

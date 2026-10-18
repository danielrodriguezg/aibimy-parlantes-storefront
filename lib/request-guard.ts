import "server-only";

/**
 * Small guards for the order endpoints. The rate limit lives in memory, so on serverless it is
 * per instance: it stops a burst from one client, not a distributed attack (that needs the
 * hosting firewall or a shared store).
 */
const hits = new Map<string, number[]>();

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** True when `key` made fewer than `limit` calls in the last `windowMs`; records this call. */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [entry, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(entry);
  return true;
}

/** Browsers send Origin on POST; a request from another site (or a bare script with a wrong one) is refused. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}

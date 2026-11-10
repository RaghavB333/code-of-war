const SOCKET_URL = process.env.SOCKET_INTERNAL_URL || "http://localhost:4000";

export const userRoom = (id) => `user:${id}`;
export const lobbyRoom = (id) => `pg:${id}`;

// `rooms` is one room name or an array of them.
export async function emit(rooms, event, payload = {}) {
  const secret = process.env.SOCKET_INTERNAL_SECRET;
  if (!secret) {
    console.warn(`SOCKET_INTERNAL_SECRET is not set - skipped realtime event "${event}"`);
    return;
  }

  try {
    await fetch(`${SOCKET_URL}/internal/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": secret },
      body: JSON.stringify({ rooms: Array.isArray(rooms) ? rooms : [rooms], event, payload }),
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
  } catch (error) {
    console.error(`Realtime emit failed (${event}):`, error.message);
  }
}

// Which of these users are online right now? Returns an array of ids, or null if the
// socket service can't be reached (callers then skip the check instead of blocking everything).
export async function getOnlineUserIds(userIds) {
  const secret = process.env.SOCKET_INTERNAL_SECRET;
  if (!secret) return null;

  try {
    const res = await fetch(`${SOCKET_URL}/internal/online`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": secret },
      body: JSON.stringify({ userIds }),
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.online) ? data.online.map(String) : null;
  } catch (error) {
    console.error("Online check failed:", error.message);
    return null;
  }
}
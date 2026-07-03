import { getSessionId } from "./session";

// In-memory, server-only store of "favorite" country codes, keyed by session
// id (see session.ts). It lives only on the server (never shipped to the
// browser) and is mutated by a Server Action. Scoped per-session so different
// browsers/users don't share state; still resets on server restart and isn't
// shared across instances — good enough to demonstrate server-owned,
// per-user state without pulling in a real datastore.
const favoritesBySession = new Map<string, Set<string>>();

function favoritesForSession(sessionId: string): Set<string> {
  let favorites = favoritesBySession.get(sessionId);
  if (!favorites) {
    favorites = new Set();
    favoritesBySession.set(sessionId, favorites);
  }
  return favorites;
}

export function listFavorites(): string[] {
  return [...favoritesForSession(getSessionId())];
}

export function toggleFavorite(code: string): string[] {
  const favorites = favoritesForSession(getSessionId());
  if (favorites.has(code)) favorites.delete(code);
  else favorites.add(code);
  return [...favorites];
}

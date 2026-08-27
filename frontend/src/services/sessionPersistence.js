/**
 * Session persistence layer for the InsForge SDK.
 *
 * Background: The InsForge SDK keeps the access token in-memory only. After a
 * page reload the in-memory token is gone and the SDK tries to recover the
 * session by calling /api/auth/refresh with the httpOnly refresh cookie. If
 * that cookie is missing or has been cleared, the user is silently signed out
 * and forced through the sign-in flow again on every reload.
 *
 * This module bridges that gap by:
 *   1. Snapshotting { accessToken, refreshToken, user } into localStorage on
 *      every successful sign-in (signInWithPassword, signUp, OAuth).
 *   2. Re-hydrating the SDK's in-memory token manager on app boot, BEFORE
 *      AuthContext calls getCurrentUser(), so getCurrentUser() returns the
 *      cached user immediately without needing a network round-trip.
 *   3. Clearing the snapshot on sign-out.
 *
 * The snapshot is only used as a cache — the live session is still the source
 * of truth. If the cached token is rejected by the server, the SDK's
 * refreshSession() / setSession(null) path will still log the user out.
 */

const STORAGE_KEY = 'devastra_insforge_session_v1';

function safeRead() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeWrite(snapshot) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!snapshot) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota / private mode — fail silent, the in-memory session still works
  }
}

/**
 * Try to push a saved snapshot into the SDK's token manager so subsequent
 * getCurrentUser() calls hit the cached user path. Returns true if the SDK
 * accepted the hydration.
 */
function rehydrate(insforge, snapshot) {
  if (!insforge || !snapshot || !snapshot.accessToken) return false;
  try {
    // Mirror the SDK's own TokenManager.saveSession() shape so the in-memory
    // cache matches what getSession() / getCurrentUser() expect.
    const session = {
      accessToken: snapshot.accessToken,
      user: snapshot.user || null,
      refreshToken: snapshot.refreshToken || null,
    };
    if (insforge.tokenManager && typeof insforge.tokenManager.saveSession === 'function') {
      insforge.tokenManager.saveSession(session);
    }
    if (insforge.tokenManager && typeof insforge.tokenManager.setUser === 'function' && snapshot.user) {
      insforge.tokenManager.setUser(snapshot.user);
    }
    if (insforge.http && typeof insforge.http.setAuthToken === 'function') {
      insforge.http.setAuthToken(snapshot.accessToken);
    }
    if (insforge.http && typeof insforge.http.setRefreshToken === 'function' && snapshot.refreshToken) {
      insforge.http.setRefreshToken(snapshot.refreshToken);
    }
    return true;
  } catch (err) {
    console.warn('[sessionPersistence] rehydrate failed:', err?.message);
    return false;
  }
}

/**
 * Read the latest user/token state out of the SDK and persist it.
 * Called after every successful sign-in or token refresh.
 */
function captureFromSdk(insforge) {
  if (!insforge || !insforge.tokenManager) return;
  try {
    const session = insforge.tokenManager.getSession
      ? insforge.tokenManager.getSession()
      : null;
    if (!session || !session.accessToken) return;
    const refreshToken =
      insforge.http && typeof insforge.http.getRefreshToken === 'function'
        ? insforge.http.getRefreshToken()
        : null;
    safeWrite({
      accessToken: session.accessToken,
      refreshToken,
      user: session.user || null,
      savedAt: Date.now(),
    });
  } catch (err) {
    console.warn('[sessionPersistence] captureFromSdk failed:', err?.message);
  }
}

/**
 * Public API used by api.js to wire the persistence layer in.
 *
 * @param {object} insforge - the InsForge SDK client instance
 * @returns {{ persist: () => void, clear: () => void, hydrate: () => boolean }}
 */
export function installSessionPersistence(insforge) {
  if (!insforge) {
    return {
      persist: () => {},
      clear: () => {},
      hydrate: () => false,
    };
  }

  // Best-effort: hydrate on install so the very first getCurrentUser() works.
  hydrate();

  // Persist automatically whenever the SDK reports a SIGNED_IN, TOKEN_REFRESHED
  // or SIGNED_OUT event. We piggyback on the SDK's own listener so we don't
  // miss any token refresh triggered by the SDK itself. The capture is deferred
  // to the next microtask so any synchronous http.setRefreshToken() the SDK
  // performs after the SIGNED_IN event still lands before we read it.
  let unsubscribe = null;
  try {
    if (typeof insforge.auth.onAuthStateChange === 'function') {
      unsubscribe = insforge.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Defer so post-event SDK bookkeeping (e.g. setRefreshToken) completes
          Promise.resolve().then(() => captureFromSdk(insforge));
        } else if (event === 'SIGNED_OUT') {
          clear();
        }
      });
    }
  } catch (err) {
    console.warn('[sessionPersistence] could not subscribe to auth state changes:', err?.message);
  }

  return {
    persist: () => captureFromSdk(insforge),
    clear,
    hydrate: () => {
      const snapshot = safeRead();
      return rehydrate(insforge, snapshot);
    },
  };
}

export function hydrate() {
  return safeRead();
}

export function clear() {
  safeWrite(null);
}

export function persistFromAuthResponse(authResult) {
  if (!authResult) return;
  const { accessToken, refreshToken, user } = authResult;
  if (!accessToken) return;
  safeWrite({
    accessToken,
    refreshToken: refreshToken || null,
    user: user || null,
    savedAt: Date.now(),
  });
}

// Shared Spotify utilities for Supabase Edge Functions
// Centralizes token acquisition/caching and resilient fetch with retry/backoff
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

type NormalizedError = {
  status: number;
  code: string;
  message: string;
};

const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000; // refresh 60s before expiry

let cachedToken: {
  value: string;
  expiresAt: number; // epoch ms
} | null = null;

function nowMs(): number {
  return Date.now();
}

function normalizeError(status: number, message: string, code?: string): NormalizedError {
  return { status, code: code || `SPOTIFY_${status}`, message };
}

async function requestNewToken(): Promise<{ token: string; expiresIn: number }> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw normalizeError(500, 'Spotify credentials are not configured', 'MISSING_SPOTIFY_CREDS');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw normalizeError(response.status, 'Failed to fetch Spotify token');
  }

  const data = await response.json();
  return { token: data.access_token as string, expiresIn: Number(data.expires_in) * 1000 };
}

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_EXPIRY_BUFFER_MS > nowMs()) {
    return cachedToken.value;
  }

  const { token, expiresIn } = await requestNewToken();
  cachedToken = {
    value: token,
    expiresAt: nowMs() + expiresIn,
  };
  return token;
}

export async function getSpotifyUserToken(userId: string, supabaseClient: SupabaseClient): Promise<string> {
  const { data, error } = await supabaseClient
    .from('spotify_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw normalizeError(401, 'User not connected to Spotify', 'NO_SPOTIFY_CONNECTION');
  }

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw normalizeError(500, 'Spotify credentials are not configured', 'MISSING_SPOTIFY_CREDS');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: data.refresh_token,
    }),
  });

  if (!response.ok) {
    throw normalizeError(response.status, 'Failed to refresh Spotify user token');
  }

  const tokenData = await response.json();

  // If a new refresh token is returned, update it
  if (tokenData.refresh_token) {
    await supabaseClient
      .from('spotify_tokens')
      .update({
        refresh_token: tokenData.refresh_token,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }

  return tokenData.access_token as string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ access_token: string; refresh_token: string }> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw normalizeError(500, 'Spotify credentials are not configured', 'MISSING_SPOTIFY_CREDS');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw normalizeError(response.status, `Failed to exchange code: ${errorText}`);
  }

  return await response.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoff(baseMs: number, attempt: number): number {
  // exponential backoff with jitter
  const backoff = baseMs * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return backoff + jitter;
}

type FetchRetryOptions = {
  retries?: number; // total retry attempts
  baseBackoffMs?: number;
};

export async function fetchSpotify(
  url: string,
  init: RequestInit = {},
  options: FetchRetryOptions = {},
  getToken?: () => Promise<string>
): Promise<Response> {
  const retries = options.retries ?? 2;
  const baseBackoffMs = options.baseBackoffMs ?? 250;

  let token = await (getToken ? getToken() : getSpotifyToken());
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    try {
      const res = await fetch(url, { ...init, headers });

      if (res.status === 401) {
        // refresh token once and retry immediately
        token = await (getToken ? getToken() : getSpotifyToken());
        if (attempt < retries) {
          continue;
        }
        lastError = normalizeError(401, 'Unauthorized when calling Spotify after token refresh');
        break;
      }

      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        // rate limited or transient server error
        if (attempt < retries) {
          const retryAfterHeader = res.headers.get('Retry-After');
          const retryAfter = retryAfterHeader ? Number(retryAfterHeader) * 1000 : computeBackoff(baseBackoffMs, attempt);
          await sleep(retryAfter);
          continue;
        }
        lastError = normalizeError(res.status, `Spotify request failed with status ${res.status}`);
        break;
      }

      if (!res.ok) {
        // non-retryable client error
        lastError = normalizeError(res.status, `Spotify request failed with status ${res.status}`);
        break;
      }

      return res;
    } catch (err) {
      // network error or similar
      lastError = err;
      if (attempt < retries) {
        await sleep(computeBackoff(baseBackoffMs, attempt));
        continue;
      }
      break;
    }
  }

  if (typeof lastError === 'object' && lastError && 'status' in (lastError as any)) {
    throw lastError;
  }
  throw normalizeError(500, 'Spotify request failed');
}

export async function fetchSpotifyJson<T = unknown>(
  url: string,
  init?: RequestInit,
  options?: FetchRetryOptions,
  getToken?: () => Promise<string>
): Promise<T> {
  const res = await fetchSpotify(url, init, options, getToken);
  return await res.json() as T;
}



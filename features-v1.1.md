# The B-side – Features v1.1

## ✨ Scope
This document tracks the new feature set proposed for v1.1. Each item is written as a checklist so we can mark them done incrementally, similar to `ROADMAP.md`.

Status legend: [ ] pending, [x] done

---

## 1) Post-login Spotify Connect
- [ ] Add "Connect Spotify" prompt after successful Google login
- [ ] Implement OAuth Authorization Code with PKCE flow
- [ ] Request minimal scopes for v1.1
  - [ ] `playlist-modify-private` (required for playlist creation)
  - [ ] `playlist-modify-public` (only if creating public playlists)
  - [ ] `user-top-read` (for taste-based recommendations)
- [ ] Store refresh token securely server-side (Supabase) and implement refresh
- [ ] Allow users to skip connection and continue (graceful fallback)
- [ ] Add settings page controls: connect, disconnect, view granted scopes
- [ ] Display clear error and retry UI for auth failures

Acceptance:
- [ ] After Google login, users can link Spotify in one click and land back in-app
- [ ] Access/refresh tokens rotate seamlessly; connection can be revoked at any time

---

## 2) Convert In-App Lists → Spotify Playlists
- [ ] Map list items to Spotify track IDs
  - [ ] Prefer ISRC matching when available
  - [ ] Fallback to track+artist search with best-match selection
- [ ] Create target playlist for the user (`/v1/me/playlists`)
- [ ] Add tracks in batches of up to 100; handle 429 via `Retry-After`
- [ ] Deduplicate tracks prior to upload
- [ ] Handle region/availability gaps (skip with summary)
- [ ] Let user choose public/private and playlist name/description
- [ ] Show post-action report (added, skipped, failed)

Acceptance:
- [ ] A typical 50–200 track list converts successfully with clear feedback
- [ ] Errors never block the app; partial success is summarized to the user

---

## 3) Discover Page Personalized by Spotify Taste
- [ ] Fetch user top artists/tracks (`/v1/me/top/{artists,tracks}`)
- [ ] Request recommendations (`/v1/recommendations`) with 2–5 seeds
- [ ] Add optional tuning (energy, tempo, valence) for variety
- [ ] Cache per-user results (e.g., 6–12h) to reduce rate limits
- [ ] Graceful fallback when Spotify not connected (use existing/popular feed)
- [ ] Expose a simple UI toggle to refresh recommendations on demand

Acceptance:
- [ ] Discover shows personalized rows/cards derived from the user’s Spotify taste
- [ ] Works offline/unauthenticated by showing the fallback instead of errors

---

## 4) Search Public Playlists by Name (for Reviews)
- [ ] Add search filter UI similar to Spotify chips/tabs
  - [ ] All | Artists | Songs | Playlists | Albums | Genres & Moods | Podcasts & Shows | Profiles
  - [ ] When `Playlists` is selected, query only playlists for precision
- [ ] Use app-level Client Credentials token to call `/v1/search?q=...&type=playlist`
- [ ] Support pagination via `limit`/`offset` up to API caps
- [ ] Display playlist owner (as available), track count, images
- [ ] Allow selecting a playlist to view details via `/v1/playlists/{id}` (public only)
- [ ] Clarify limitation in UI: cannot search users directly; results are text-based

Acceptance:
- [ ] Users can type a playlist name and find public playlists reliably
- [ ] Selecting a result opens details suitable for starting a review flow

---

## 5) Security, Rate Limits, and UX Guarantees (Cross-cutting)
- [ ] Centralize Spotify API client with retry, backoff, and error normalization
- [ ] Honor 429 `Retry-After`; log structured errors for diagnostics
- [ ] Never expose refresh tokens to the browser
- [ ] Clear, human-readable messages for partial failures (e.g., missing tracks)
- [ ] Analytics event hooks around conversions and recommendations (optional)

---

## 🔌 Endpoints & Scopes Summary (Reference)
- Authorization: Authorization Code with PKCE
- Key endpoints:
  - `POST /v1/me/playlists` – create playlist
  - `POST /v1/playlists/{playlist_id}/tracks` – add tracks
  - `GET /v1/me/top/{artists,tracks}` – seeds for taste
  - `GET /v1/recommendations` – personalized recs
  - `GET /v1/search?type=playlist` – public playlist search (app token)
  - `GET /v1/playlists/{id}` – public playlist details (app token)
- Scopes:
  - `playlist-modify-private`, `playlist-modify-public`, `user-top-read`

---

## ✅ Completion Checklist (High-Level)
- [ ] Spotify connect flow in place with robust token handling
- [ ] Lists convert to user playlists with reporting
- [ ] Discover page uses personalized recommendations with fallback
- [ ] Search page supports playlist-only search with filters and pagination
- [ ] Cross-cutting reliability and UX safeguards implemented

---

Last updated: v1.1 draft



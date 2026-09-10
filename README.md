# ðŸ‘ï¸ BB Telugu Fans â€” V1 Production-Ready Fan Community Platform

> **"The Internet Home of Bigg Boss Telugu Fans"**  
> Same House. New Stories. Bigger Drama.

BB Telugu Fans is an independent, high-performance community platform built specifically for Bigg Boss Telugu superfans. Featuring the all-new 2026 Season 10 House visual identity, all 16 official Season 10 housemates, real-time secure polling, dynamic contestant popularity tracking, editorial news, memes vault, and a 3-column discussion forum.

---

## âš ï¸ Independent Community Disclaimer
> **Disclaimer:** BB Telugu Fans is an independent fan community and is not affiliated with or endorsed by Bigg Boss, Star Maa, Endemol Shine India, or the show\'s producers. All trademarks, contestant likenesses, and logos belong to their respective copyright holders.

---

## ðŸ›ï¸ Architecture & Tech Stack

```
Browser
  â†“
Cloudflare (CDN / WAF / DDoS Protection)
  â†“
Next.js (App Router, Tailwind CSS, TypeScript, 14 Pages)
  â†“
NestJS API (Modular Monolith, Versioned REST /api/v1)
  â†“
PostgreSQL (Source of Truth) + Redis (Rate Limiting / Caching) + S3 (Media)
```

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Glassmorphism + Neon Glows
- **Icons:** Lucide React
- **Visuals:** Original 2026 Bigg Boss House cinematic exterior, neon confession room, arena lounge

### Backend
- **Framework:** NestJS 10 (Modular Monolith)
- **Security:** Helmet, Cookie-Parser, Argon2id/SHA-256 HMAC, JWT, CORS
- **Validation:** class-validator & class-transformer global pipes
- **Database:** PostgreSQL with full relational constraints (`UNIQUE(user_id, poll_id)` and `UNIQUE(voter_token_hash, poll_id)`)
- **Anti-Abuse:** Redis-backed configurable `MAX_VOTES_PER_IP = 50` per 24 hours

---

## ðŸ“± The 14 V1 Pages
1. **Home (`/`)**: Cinematic house hero, 6 major feature cards, Today\'s editorial highlights, live interactive poll widget, contestant popularity leaderboard.
2. **Contestants (`/contestants`)**: Filterable roster (Active, Nominated, Captain, Evicted), search, popularity meters, trend indicators.
3. **Contestant Detail (`/contestants/[id]`)**: Biography, task stats, captaincies, nomination history, fan sentiment radar.
4. **Polls (`/polls`)**: Active, closed, and scheduled polls with percentage progress bars.
5. **Poll Detail (`/polls/[id]`)**: Live voting, cryptographic voter token generation, duplicate protection, instant results.
6. **News (`/news`)**: Categorized editorial articles, view counts, trending indicators.
7. **News Detail (`/news/[slug]`)**: Full SEO article with share actions and debate integrations.
8. **Memes (`/memes`)**: Masonry meme feed, like, save, report, and upload modal with format validation.
9. **Discuss (`/discuss`)**: Modern 3-column forum layout (Navigation & filters, Main discussion feed, Trending tags & guidelines).
10. **Discussion Detail (`/discuss/[id]`)**: Threaded comments, replies, upvotes, and moderation reporting.
11. **Login (`/login`)**: Email login, Google OAuth, and instant 1-click Demo logins (Fan User & Admin Master).
12. **Register (`/register`)**: Account creation with validation and terms.
13. **User Profile (`/profile`)**: Fan badges, voting history, created discussions, and privacy protection.
14. **Admin Dashboard (`/admin`)**: Overview metrics, poll lifecycle controls, contestant roster sync, IP limit settings, and audit logs.
*(Episodes page intentionally excluded in strict accordance with V1 requirements).*

---

## ðŸ›¡ï¸ Voting Security & Anti-Abuse Architecture
- **Multi-Layer Identity:**
  - Authenticated Users: Database enforces `UNIQUE(user_id, poll_id)`.
  - Anonymous Users: Cryptographically generated client UUID token hashed via SHA-256; database enforces `UNIQUE(voter_token_hash, poll_id)`.
- **Configurable Network Limit:**
  - `MAX_VOTES_PER_IP = 50` within a rolling 24-hour window managed via Redis.
  - 51st attempt triggers HTTP 429 Too Many Requests.
  - Dynamically configurable by administrators via the Admin Console.
- **Race Condition & Transaction Safety:**
  - Atomic database transactions with rollback guarantee that concurrent requests result in only a single vote.
  - Frontend input is never trusted for authorization or voting eligibility.

---

## ðŸ§ª Automated Test Suite (23 Passing Tests)
Run automated unit, integration, and security tests:
```bash
cd backend
npm test
```
### Test Coverage
- **TC-VOTE-001:** Valid vote succeeds
- **TC-VOTE-002:** Same authenticated user attempts second vote -> `ALREADY_VOTED` (HTTP 409)
- **TC-VOTE-003:** Same anonymous voter token attempts second vote -> Rejected (HTTP 409)
- **TC-VOTE-004:** Inactive draft poll rejects vote (HTTP 400)
- **TC-VOTE-005:** Closed poll rejects vote (HTTP 400)
- **TC-VOTE-006:** Invalid option rejects vote (HTTP 400)
- **TC-VOTE-007:** Malformed request without voter identity rejects vote (HTTP 400)
- **TC-VOTE-008:** IP reaches configured threshold -> HTTP 429
- **TC-VOTE-009:** 51st request from same IP is rate limited when threshold is 50
- **TC-VOTE-010:** Concurrent duplicate requests create only one database vote
- **TC-VOTE-011:** Database unique constraint prevents duplicate voting
- **TC-VOTE-012:** Database failure rolls back transaction
- **Security Tests:** XSS sanitization, IDOR protection, password hashing verification, JWT tamper resistance.
- **Discussion Tests:** Post creation, editing, like/unlike toggling, comment threads, moderation reporting, and spam throttling.

---

## ðŸš€ Getting Started

### 1. Run with Docker Compose
```bash
docker-compose up --build
```
- Web Application: `http://localhost:9000`
- REST API: `http://localhost:4000/api/v1`

### 2. Run Manually for Development
```bash
# Backend
cd backend
npm install
npm run build
node dist/main

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```
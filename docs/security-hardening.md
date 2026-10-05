# Data and administrator access hardening

Implemented on 2026-10-05 for Supabase project `plcmsgbsetpqwjkfmjzk`.
This change covers database access, administrator authorization and the public
submission paths affected by removing direct browser writes. It does not certify
the entire site, the book's claims, the scientific scoring models or payment
fulfilment.

## Authorization

The database checks the current entry in `admin_users`, the actual Auth user,
an active `auth.sessions` entry matching the JWT session ID, and user bans.
Privileged operations also require an `aal2` JWT, an `aal2` server session and
that session's verified MFA factor belonging to the same user. Removing a role,
session or factor therefore removes access even while an old JWT is unexpired.
Client navigation checks are supplementary; the database and Edge Functions
enforce the restrictions.

| Operation | `super_admin` + MFA | `editor` + MFA | `moderator` + MFA |
| --- | --- | --- | --- |
| Create, edit and delete news through the news API | Yes | Yes | No |
| Approve and delete game posts/comments | Yes | No | Yes |
| Read inquiries and private assessment/log records | Yes | No | No |
| Read Stripe orders through the orders API | Yes | No | No |
| Change administrator memberships through the public API | No | No | No |

Before completing MFA, an existing member can read only their own minimal role
and the access status required to set up MFA. Non-members have no admin access.
Existing real administrator memberships are preserved; no expert identity or
administrator role is inferred from a person's name.

## Database and public submissions

- Nine existing public tables use explicit grants and replacement RLS policies.
  Anonymous clients can read only published news and approved, unflagged game
  content with an approved parent. Private answers, inquiries and telemetry are
  unavailable to anonymous clients.
- Browser clients cannot insert into those tables, self-grant roles, change
  content/counters or perform arbitrary deletions. Moderation grants cover only
  the approval/flag columns and authorized deletes.
- Public forms use validated server endpoints with bounded request bodies and
  persistent rate limits. CAPTCHA-protected paths fail closed when verification
  or its server configuration is missing.
- Game history and deletion use a random 256-bit capability. Only its SHA-256
  hash is stored in the private schema. Public session IDs no longer grant
  ownership. New posts and comments await moderation. Likes use transactional,
  idempotent updates per actor capability; this does not establish one reaction
  per real person.
- New telemetry/assessment submissions do not save raw IP addresses or user
  agents. Existing records are preserved and access-restricted.
- News HTML is sanitized on the server and when displayed. The retired Google
  ping endpoint requires authorization and returns 410 without changing news.
- Private ownership, reaction and rate-limit tables intentionally have RLS and
  no browser policies: their grants permit only the service role. The advisor's
  informational "RLS Enabled No Policy" finding describes this default-deny
  configuration.

## Deployment and first administrator sign-in

The deployed migration is
`supabase/migrations/20261005200622_harden_data_and_admin_access.sql`.
Its version matches the managed database migration history. It hardens the
existing project schema; it is not a complete initial schema for a new project.
Do not execute it again manually on the same project. The follow-up migration
`20261005202517_fix_game_owner_delete.sql` qualifies a comment-column reference
so verified owners can also delete their pending posts without a SQL ambiguity.

Ten changed/new Edge Functions were deployed: `admin-news`, `get-stripe-orders`,
`notify-google-index`, `tavora-shield-submit`, `analyze-viral-post`, `social-game`,
`submit-partnership`, `tavora-biometric-log`, `tavora-literacy-log` and
`tavora-content-analyzer`. Source for previously untracked deployed functions
was also brought into the repository without changing their behavior.

Pull this version into Readdy and publish the frontend. At `/admin/login`, an
existing administrator signs in with their usual credentials and is directed
to `/admin/mfa`. Add the displayed QR code to an authenticator and verify its
six-digit code. Future administrative sessions require a verified second factor.
Do not share the QR code or its secret. Recovery of a lost factor requires the
verified account owner using trusted Supabase administration; do not weaken the
application checks to recover access.

The public Edge Functions retain disabled gateway JWT verification because
their intended users are anonymous. Owner actions implement capability checks;
administrator functions independently verify the Auth user and database
permission. CORS restrictions are not an authorization mechanism. Service and
Stripe secret keys remain server environment variables.

## Repeatable checks

Use Node 24 and run:

```sh
npm ci
npm test
npm run typecheck
npm run check:edge
npm run build
npm audit --omit=dev --audit-level=high
```

GitHub Actions repeats these checks for pull requests and pushes to `main`.
The lockfile pins the tested dependency graph. Runtime dependency auditing
reported zero known vulnerabilities at implementation time; this result is
time-sensitive and does not cover all development dependencies.

The 42 automated tests include actual migration execution in PGlite, public and
authenticated role/column permissions, MFA/session/role revocation, private
capabilities, pending moderation, atomic reactions, validation and actual Edge
handler code with isolated provider responses. PGlite uses a minimal Auth
fixture, and handler tests mock remote providers. See the implementation's
validation record for separate checks against the live Supabase deployment.

## Remaining account setting

Supabase still reports **Leaked Password Protection Disabled**. The connected
tools do not expose the Auth settings update needed to enable it. The verified
account owner should enable it in the Supabase Auth password-security settings,
subject to the project's plan availability:
<https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>.
This is separate from the mandatory application MFA and must not be reported as
already enabled.

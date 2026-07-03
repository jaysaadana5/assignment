# Auth Testing Playbook — SSoC Season 5 User Dashboard

## Scope
JWT email+password auth for end-user dashboard. Admin account already seeded via ADMIN_EMAIL/ADMIN_PASSWORD env vars. Existing user registrations (`registrations` collection) are auto-claimed when a signup uses the same email.

## Endpoints
- POST /api/auth/register — {name, email, password} → {user, token}
- POST /api/auth/login — {email, password} → {user, token}
- GET  /api/auth/me — Authorization: Bearer <token> → {user, applications: [...]}
- GET  /api/user/referral-link — Bearer → {link} (403 if no approved application)
- POST /api/user/referral-link/generate — Bearer → creates or returns existing link
- PUT  /api/admin/registrations/{id}/status — {status: "pending"|"under-review"|"approved"|"rejected"}

## Test Credentials
Stored in /app/memory/test_credentials.md.

## MongoDB Collections
- users: {id, email (lowercase), password_hash, name, role: "user"|"admin", created_at}
- registrations (existing, now has `status` field default "pending")
- referral_links (existing, user-generated links carry user_id ref)

## Testing
```bash
API=$REACT_APP_BACKEND_URL
# Register new user
curl -X POST "$API/api/auth/register" -H "Content-Type: application/json" -d '{"name":"T","email":"t@x.com","password":"pass1234"}'
# Should return {user, token}. If email matches existing registration(s), applications[] is populated.

# Login
curl -X POST "$API/api/auth/login" -H "Content-Type: application/json" -d '{"email":"t@x.com","password":"pass1234"}'

# Get me with token
TOKEN=...
curl "$API/api/auth/me" -H "Authorization: Bearer $TOKEN"
```

# Security Policy

## Architecture

This portfolio runs a Node.js/Express server on Railway. It includes a client-side security gate (`assets/js/gate.js`) that controls access to sensitive content, and a server-side admin API for content management.

### Security gate

Three roles are supported:

| Role | Credential | What it unlocks |
|------|------------|-----------------|
| Guest | None | Site with sensitive fields blurred |
| Recruiter | 4-digit PIN | Full site access |
| Admin | Password | Full access + admin panel |

Gate credentials are **never stored in the repository**. They are injected at container startup from Railway environment variables (`RECRUITER_CODE`, `ADMIN_PASS`). If those variables are not set, the respective roles are inaccessible.

### Admin panel & API

`admin.html` is accessible only after entering the admin password at the gate. Once the admin logs in:

1. `gate.js` stores the entered password in `sessionStorage.pf_admin_token`
2. `admin.html` calls `POST /api/login` with that password to establish a server-side Express session (cookie-based, signed with `SESSION_SECRET`)
3. All write API endpoints (`POST /api/config`, `POST /api/upload`, `DELETE /api/upload/:file`) require an active session

The session cookie is `HttpOnly` and scoped to the current origin. `SESSION_SECRET` is set as a Railway environment variable and never committed to the repository.

### Image uploads

Uploaded images are stored in `data/uploads/` on the Railway Volume. The server validates file type (MIME + extension) and limits file size to 15 MB. Filenames are sanitized (timestamps prefixed, special characters stripped) before writing to disk.

### Anti-scraping

The gate blocks right-click, copy, drag, DevTools shortcuts, and view-source for non-authenticated visitors. These are client-side measures and are not a substitute for server-side security.

---

## Supported Versions

| Component | Maintained |
|-----------|------------|
| Static HTML/CSS/JS | Yes |
| Security gate (`gate.js`) | Yes |
| Admin panel (`admin.html`) | Yes |
| Express server (`server.js`) | Yes |
| EmailJS contact form | Yes |
| Railway / Node.js deployment | Yes |

---

## Reporting a Vulnerability

If you discover a security issue — for example, a credential exposed in the repo, an XSS vulnerability, a path traversal in the upload endpoint, a session fixation issue, or a compromised vendor script — please **do not** open a public GitHub Issue.

Email: **patrickperez1322@gmail.com**

Include:
- A clear description of the vulnerability
- Steps to reproduce
- Potential impact

I will respond within **7 days** and aim to address confirmed issues within **30 days**.

---

## Scope

**In scope:**
- Credentials or secrets accidentally committed to the repository
- Cross-site scripting (XSS) in any injected or rendered content
- Path traversal or arbitrary file write via the upload endpoint
- Session fixation or session hijacking
- Compromised or malicious scripts in `assets/vendor/`
- Logic flaws in the security gate that bypass role checks

**Out of scope:**
- Issues with Railway infrastructure or DNS
- Social engineering
- Denial-of-service against the hosting provider
- Bypassing client-side blur — this is cosmetic, not a security boundary
- Brute-forcing the gate PIN over HTTPS (Railway rate limits are out of scope for this policy)

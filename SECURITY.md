# Security Policy

## Architecture

This is a static portfolio site served by nginx. It includes a client-side security gate (`assets/js/gate.js`) that controls access to sensitive content.

### Security gate

Three roles are supported:

| Role | Credential | What it unlocks |
|------|------------|-----------------|
| Guest | None | Site with sensitive fields blurred |
| Recruiter | 4-digit PIN | Full site access |
| Admin | Password | Full access + admin panel |

Credentials are **never stored in the repository**. They are injected at container startup from Railway environment variables (`RECRUITER_CODE`, `ADMIN_PASS`). If those variables are not set, the respective roles are inaccessible.

### Admin panel

`admin.html` is accessible only after entering the admin password at the gate. It uses the GitHub API (with a user-supplied Personal Access Token stored in the visitor's own localStorage) to commit `data/config.json`. The PAT is never transmitted to any server other than `api.github.com`.

### Anti-scraping

The gate blocks right-click, copy, drag, DevTools shortcuts, and view-source for non-authenticated visitors. These are client-side measures and are not a substitute for server-side security.

---

## Supported Versions

| Component | Maintained |
|-----------|------------|
| Static HTML/CSS/JS | Yes |
| Security gate (`gate.js`) | Yes |
| Admin panel (`admin.html`) | Yes |
| EmailJS contact form | Yes |
| Railway / nginx deployment | Yes |

---

## Reporting a Vulnerability

If you discover a security issue — for example, a credential exposed in the repo, an XSS vulnerability, or a compromised vendor script — please **do not** open a public GitHub Issue.

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
- Cross-site scripting (XSS) in any injected content
- Compromised or malicious scripts in `assets/vendor/`
- Misconfigured nginx security headers
- Logic flaws in the security gate that bypass role checks

**Out of scope:**
- Issues with Railway infrastructure or DNS
- Social engineering
- Denial-of-service against the hosting provider
- Bypassing client-side blur — this is cosmetic, not a security boundary

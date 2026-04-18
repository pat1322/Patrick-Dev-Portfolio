# Security Policy

## Supported Versions

This is a static personal portfolio website. There is no backend, no database, and no authentication system. The attack surface is minimal, but the following applies:

| Component | Status |
|-----------|--------|
| Static HTML/CSS/JS | Maintained |
| EmailJS contact form | Maintained |
| Railway / nginx deployment | Maintained |

## Reporting a Vulnerability

If you discover a security issue (e.g., exposed API keys, malicious dependency, XSS via injected content), please **do not** open a public GitHub Issue.

Instead, email: **patrickperez1322@gmail.com**

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

I will respond within **7 days** and aim to address confirmed issues within **30 days**.

## Scope

The following are in scope:
- Exposed secrets or API keys in the codebase
- Cross-site scripting (XSS) vulnerabilities
- Malicious or compromised third-party vendor scripts in `assets/vendor/`
- Misconfigured nginx security headers

The following are out of scope:
- Issues with Railway infrastructure
- Issues with the `patrickdev.work` registrar or DNS provider
- Social engineering attacks
- Denial-of-service against the hosting provider

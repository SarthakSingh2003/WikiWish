# Security Policy

## Reporting a Vulnerability

We take the security of WikiWish seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

Email the security team at: **security@wikimedia.org**

Or create a private security advisory on GitHub:
https://github.com/wikiwish/wikiwish/security/advisories/new

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any proof of concept exploit
- Affected versions

### Response Timeline

- Initial response within 48 hours
- Regular updates on progress
- Fix coordinated release timeline

## Responsible Disclosure

We ask that you:

- Not publicly disclose the vulnerability until we've had time to fix it
- Not use the vulnerability to access or modify data without permission
- Not perform denial of service attacks or data destruction

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |

## Security Features

### Authentication Security

- OAuth 1.0a via Wikimedia (no password storage)
- Session tokens are encrypted
- 24-hour session timeout

### Data Privacy

- Only public Meta-Wiki data accessed
- No personal information collected
- OAuth tokens stored only in session cookies

### API Etiquette

- Rate limiting: Max 3 concurrent requests
- Proper User-Agent identification
- Caching to reduce API load

## Common Vulnerabilities We're Protected Against

- **SQL Injection**: No database queries with user input
- **XSS**: Content Security Policy headers, React's auto-escaping
- **CSRF**: OAuth state parameter validation
- **Open Redirects**: Validated redirect URLs
- **Clickjacking**: X-Frame-Options header

## Security Best Practices

### For Contributors

- Never commit secrets or credentials
- Use `.env` files for configuration
- Review changes before committing
- Run security linting in CI

### For Deployers

- Use HTTPS for all connections
- Set strong `SESSION_SECRET`
- Keep dependencies updated
- Monitor for security advisories

## Security Checklist

- [ ] OAuth credentials stored securely
- [ ] SESSION_SECRET is random and at least 32 characters
- [ ] HTTPS enforced in production
- [ ] Secure cookie flags enabled
- [ ] CORS origins restricted
- [ ] Dependencies updated regularly

## Contact

For security concerns, contact the maintainers or create a GitHub security advisory.

We appreciate your help in keeping WikiWish secure for all users.
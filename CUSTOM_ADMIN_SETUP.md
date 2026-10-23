# Admin setup — two settings only

The dedicated admin lives at /admin/ after a future production deployment.
Login username: gilrosman.

Add these two environment variables to the correct Netlify site:
- ADMIN_PASSWORD — choose a unique password with at least 16 characters. Do not send it through chat or commit it to GitHub.
- GITHUB_WRITE_TOKEN — fine-grained personal access token restricted to repository rosman-swimming/rosman-swimming-school; permission: Contents read and write. Never expose the token in code or browser pages.

Netlify All scopes is acceptable if Functions-only is not offered. Delete unused legacy ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET values after successful cutover.

Admin uses HTTPS, secure HTTP-only session cookies with an eight-hour expiry, origin validation and Netlify platform rate limits. The signing key is derived from the server-only password. Saving updates content/site.json on GitHub main; deploy works only if the production site is connected to GitHub main.

Before making it live: confirm Netlify function deployment, test login + logout + invalid login + save, review the rate-limit behavior, verify main deploy branch and verify production content. The public site has not been changed by this development branch.

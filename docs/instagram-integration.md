# Instagram integration setup

The integration uses the existing Spring Boot API and the same PostgreSQL/Supabase database as Hyperniche. Instagram access tokens stay in the backend and are encrypted with AES-256-GCM. Supabase `anon` and `authenticated` roles have no direct access to integration tables; browser requests use the existing authenticated API.

## Meta setup

1. Create/configure a Meta app with the Instagram API with Instagram Login product and add the exact redirect URI `https://<backend-host>/api/v1/instagram/callback`.
2. Configure Instagram Login permissions for professional creator accounts. Submit the app for any required Meta App Review/advanced access before inviting creators outside app roles.
3. Set `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_REDIRECT_URI`, `FRONTEND_URL`, and `INSTAGRAM_TOKEN_ENCRYPTION_KEY` on the existing backend deployment. The encryption key must be base64 for exactly 32 random bytes; keep it stable and backed up because losing it makes stored tokens unreadable.
4. Apply `database/migrations/V5__instagram_creator_integration.sql` once to the same Supabase PostgreSQL project Hyperniche already uses. Ensure the backend connects with its trusted database role, not the browser anon key.
5. Creators connect from **Profile → Instagram account**. Discovery and sharing of summary insights are separate opt-ins and default off. Disconnect removes the stored token and synced history.

Instagram only returns fields/insights permitted for the connected professional account, granted scopes, API version, app access level, and account eligibility. Some demographic and media insights are unavailable for some accounts. The dashboard therefore shows metrics only when Meta returns them.

## Scheduling and n8n

Spring's scheduled sync is enabled by `INSTAGRAM_SYNC_CRON` (default 03:15 UTC daily). For failure retries, import `automation/n8n/instagram-sync-retry.json` into the existing n8n instance, activate it, then set these n8n environment variables:

- `HYPERNICHE_API_URL`: backend origin, without `/api/v1`.
- `INSTAGRAM_WORKFLOW_SECRET`: same high-entropy secret as the backend environment variable.

Set the backend's `N8N_INSTAGRAM_RETRY_WEBHOOK_URL` to the n8n production webhook URL. The workflow waits one minute and calls the authenticated-by-secret backend retry endpoint; HTTP failures receive up to three retries. n8n never receives Instagram access tokens and cannot query Supabase directly.

To enable Meta webhooks, configure the same callback URL with the Meta app, set `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`, subscribe only to supported Instagram fields, and provide Meta's app secret to validate `X-Hub-Signature-256`. Webhook events trigger a backend sync; the scheduled sync remains the recovery path for missed events.

## Verification and deployment

Build the frontend and run backend tests before deploying. Then deploy backend and frontend code, apply V5 to the existing database, configure Meta/n8n settings, and test with one creator account and one brand account. Confirm a creator can connect, sync, disconnect, and opt into discovery; confirm a brand can search and see only opted-in profile data; confirm turning off discovery hides the profile and turning off insights hides summary metrics. Live OAuth, webhook delivery, token refresh, and Meta App Review require configured Meta credentials and eligible test accounts.

# BYD Harmony Sales Floor

The Sales Floor web app brings BYD's Lead Centre, sales CRM and Delivery Centre into one authenticated workspace. Its dark sidebar, red active navigation, daily metric cards, tables and mobile navigation follow the Booran Sales Floor structure with BYD branding.

## Workflows

- Lead Centre enquiries, server pagination, search and automatic five-second refresh.
- Salesperson assignment and reassignment using active BYD accounts, with a shared customer/opportunity identity and assignment notifications.
- PULSE traffic signals from saved follow-up and conversion data, configurable site thresholds and optional device-location check-in.
- Customer profiles, lead/customer merges, pipeline management, deal registration, stock, sales logs, reports and exports.
- Photo/video upload, preview and SMS sharing. Videos use MP4/MOV, have a server-verified three-minute limit and a 65 MB maximum. Uploads use 2 MB requests; serverless deployments retain files in the existing MongoDB database.
- Calendar and Virtual Yard booking workflows, existing appraisals and customer communications.
- Delivery watch, Sales ↔ Delivery handoff, scheduling, accessory preparation/photo proof, PDI and validated handover.
- Contractor job assignment and an assigned-job view with current-location checks for on-site completion photos.
- Existing BYD user management, audit history, site settings and post-delivery follow-up controls.

`crm/` contains the required modules brought from the existing `byd-sales-crm-layer` application. They use the same Sales Floor token, backend URL and selected dealership; there is no additional login. Changes to these modules should be reviewed alongside their original CRM counterparts.

Stock cards open opportunity registration with the chosen vehicle. Confirmed sales follow BYD's existing stock reservation and Delivery handoff workflow.

## Configuration and deployment

Set `NEXT_PUBLIC_API_URL` to the existing BYD Sales Floor backend URL ending in `/api`. Deploy the backend changes before the updated web app and Lead Centre frontend.

Point Lead Centre's existing `NEXT_PUBLIC_CRM_URL` setting at the unified Sales Floor origin when moving staff to this workspace. Existing `customer_id`, `lead_id` and search handoff links open the matching customer or enquiry view.

Existing account site permissions and role checks remain server enforced. Per-site PULSE, geofence and verified SMS sender settings are under **Settings**. Video/SMS sharing uses the existing Mobile Message configuration, customer consent and sender approval. Configure the backend's existing `PUBLIC_API_URL` with its public HTTPS origin; on Vercel the deployment's production hostname is also supported. Persistent VPS media uses `FLOOR_MEDIA_DIR`; Vercel media uses MongoDB GridFS.

To recover older assignments, a manager can open **Staff & Allocation → Check missing allocations**. Review the preview and select **Recover missing assignments**. Each pass inspects up to 100 historical incomplete allocations. Missing/archived enquiries, unavailable staff and newer differing owners remain flagged for review. Browser-only receipts from the former failed-allocation fallback are no longer treated as confirmation.

## Validation

```sh
npm run typecheck
npm test
npm run build
```

The build and dev scripts explicitly select Next.js Webpack because the installed Windows Turbopack worker exits before connecting during CSS compilation. This is a compiler selection only.

Browser verification used isolated fixtures for desktop/mobile navigation, assignment, historical recovery, media sharing, merging and PULSE. No live customer messages or provider writes were made during verification. Real SMS, Virtual Yard writes, geolocation and handover still require acceptance against the configured deployment.

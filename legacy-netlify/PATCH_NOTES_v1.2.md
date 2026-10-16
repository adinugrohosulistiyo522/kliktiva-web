# Kliktiva Production Patch V1.2 — Live Public Preview

## Problem fixed
The live public preview could remain on its initial shell (default beige theme and zero collections) while the Admin displayed demo data. The embedded preview's `postMessage` handshake rejected messages when `event.origin` did not match the nested sandboxed `srcdoc` document origin.

## Code change
- Admin parent accepts preview status messages only from the exact embedded preview iframe (`event.source === frame.contentWindow`).
- Public preview accepts draft-data messages only from its exact parent Admin window (`event.source === window.parent`) and the expected message type.
- No visual UI, CSS, product markup, Admin actions, or Apps Script/backend behavior was redesigned.
- Google Apps Script, Google Sheets, Netlify Function, environment variables, and WhatsApp integration are unchanged.

## Expected result
On first open, Admin's existing demo data (Ruang Rona profile, embedded photo, four collections, products, and Lavender Mist palette) should populate the embedded Public Preview. Editing supported Admin fields should update the preview live.

## Deploy
Update the repository's `site/index.html` with this package's `site/index.html`, commit/push, and wait for Netlify to deploy. No Apps Script redeployment is required. After deploy, hard-refresh `https://kliktiva.my.id` and open Demo Admin.

# Copenhagen Service and Repair

Next.js App Router application with dedicated public routes, a protected admin workspace, MongoDB content and submissions, and MongoDB-backed serverless image uploads.

## Run locally

1. Use Node.js 22 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `MONGODB_URI` to your MongoDB Atlas connection string or local MongoDB database. Allow the deployment network in Atlas.
4. Set `SESSION_SECRET` to a cryptographically random value of at least 32 characters.
5. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters.
6. Set `NEXT_PUBLIC_SITE_URL` to the exact origin used in the browser, including the port locally.
7. Run `npm run seed`, then `npm run dev`.
8. Open `http://localhost:3000`; sign in at `/admin/login`.

Without MONGODB_URI, public pages render the initial reference-themed content. Forms and admin require a real database; no submissions are simulated. Once a database is configured, run seed before use. Runtime database failures are reported rather than silently replacing persisted content with defaults.

The seed is idempotent. It never replaces edited content or existing admin passwords. Remove ADMIN_PASSWORD from runtime deployment settings after provisioning. Bootstrap credentials are never sent to the browser.

## Vercel deployment

Import this Next.js project into Vercel. Configure MONGODB_URI, SESSION_SECRET, and NEXT_PUBLIC_SITE_URL in the target environment. Set the site URL to the final deployment origin. Run the seed against the target database from a trusted local environment, then deploy with `npm run build`. A preview deployment needs its own correctly configured origin for form and admin mutation checks. This app uses Node/Mongoose and should be hosted on a Node-compatible platform, not a Cloudflare Worker without Mongo support.

No runtime upload operation writes to disk. A local `.env.local` is deliberately not supplied and credentials are not hardcoded. Connection strings and signing secrets stay server-side.

## Content and logo

The initial website follows the supplied navy, blue, white and red reference. Upload the licensed original logo under Admin > Site settings. The supplied logo is included as a transparent PNG at public/images/brand/copenhagen-logo.png and displayed in the navigation alongside the wordmark. It remains replaceable through admin.

Initial content photos are custom AI-generated industrial illustrations, saved as optimized WebP files under public/images/generated. They do not depict the actual business premises, staff or available inventory. Full generation prompts and asset provenance are in assets/image-generation.json. All images remain replaceable in admin. The Facebook URL, address and hours start empty because no exact values were supplied. Configure these in Site settings.

## Upload architecture

AdminImageField accepts PNG, JPEG, WebP and GIF up to 8 MiB. Files up to 3 MiB use POST /api/upload with multipart fields file and folder. Larger files use 1 MiB chunks through /api/upload/init, /api/upload/chunk and /api/upload/complete. Sessions are owned by the signed-in admin, expire after one hour, and use unique indexed chunks for idempotent retries. A failed transport cancels its open session. A finalization state transition prevents concurrent finalization; the generated final name also makes retries idempotent.

Vercel functions have a 4.5 MB request limit, so increasing a Next.js parser setting does not make an 8 MB multipart request work. Chunking keeps each request below that limit while retaining MongoDB as the final storage. Configure duration/memory limits for the selected host as appropriate. Validate large-file delivery in the deployed environment before launch.

Final image bytes are stored once in StoredUpload.data with a unique folder/filename index. Content stores URL strings only. The public GET /api/uploads/[folder]/[filename] route reads the file and emits 64 KiB stream chunks with immutable headers. The MongoDB file is buffered in application memory before HTTP streaming; it is not a streaming MongoDB cursor or GridFS implementation. Eight MiB is below MongoDB's single-document limit.

Allowed folders: products, gallery, pages, misc. Image MIME is checked against binary signatures; SVG uploads are rejected. File names use crypto randomness. Media list queries exclude binary data.

Image replacement saves the new content URL first, then deletes an old internal upload only when no service, settings or page still references it. Removing an image in an editor is a draft change until Save. Media deletion blocks referenced files. Deletion is restricted to authenticated same-origin admin mutations. Unsplash images are never deleted. Immutable upload URLs are never reused for different bytes.

Temporary upload sessions and chunks expire via MongoDB TTL indexes. Abandoned final images remain visible in Media for explicit review and deletion; do not auto-delete a media-library image just because it is not yet attached. Legacy /uploads URLs render the bundled placeholder. Uploaded images use next/image with unoptimized delivery to preserve the streaming route; Unsplash images use the configured image optimizer.

## Checks

- `npm run typecheck`
- `npm run build`
- `npm test`

Contact/booking records are saved in MongoDB, not sent as email. There is no automated booking confirmation or availability engine. Preferred dates use America/Toronto and are requests pending business confirmation. Rate-limit counters live in MongoDB, not process memory. Deploy behind a trusted proxy that supplies client IP headers; shared IPs share rate limits.

Authentication uses bcrypt passwords, random revocable database sessions, hashed tokens, expiring HTTP-only cookies and strict origin checking. Public admin registration is disabled. Sessions last eight hours. All admin APIs authorize server-side.

Production setup requires configuring a real MongoDB database, uploading the licensed logo, verifying photos and business details, and exercising the deployed large-file transport. No deployment is implied by a passing local build.
## Updated qualifications and imagery

The client supplied the claims "30+ Years of Experience", "Licensed Technicians", and "Factory-Trained Technician". These appear on Home and About and are editable under Admin > Page content > Home. No founding date or additional qualification has been inferred.

Nine generated WebP photographs cover the hero, all seven services and the workshop/about sections. These are bundled deployment assets, separate from the MongoDB admin-upload system. Existing seeded databases can use `npm run refresh-brand` to replace previous stock-photo URLs while preserving custom uploaded images and other edited content.

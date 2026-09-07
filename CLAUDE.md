# Giftitution — Image Sourcing & API Rules

Project context: affiliate gift-curation site for the US market. Traffic model is
Pinterest/Instagram → giftitution.com → merchant. Content is English.

These rules are **binding**. If a task cannot be completed without breaking one of
them, stop and tell me instead of finding a workaround.

---

## 1. Image source decision table

Before using ANY image, identify its source and apply the matching rule.

| Source | Site use | Pinterest / Instagram | Modify (text overlay, crop) |
|---|---|---|---|
| Pexels API | yes | yes | yes |
| Unsplash — **manual download** | yes | yes | yes |
| Unsplash **API** | see §3 | no | no |
| Amazon (Creators API) | yes | no | no |
| Amazon (scraped / right-click) | see §4 note | **never** | **never** |
| Awin product feed | yes | yes | check merchant terms |
| Own photography | yes | yes | yes |

**Default choice for pin generation: Pexels API.**

---

## 2. Pexels API — primary source

### Attribution — required for API use

The Pexels *download license* waives attribution. The *API guidelines* do
not. This project uses the API, so attribution is mandatory.

- Every collection page that displays API-sourced imagery must carry a
  visible "Photos provided by Pexels" link in the footer.
- Each image needs a photographer credit: "Photo by {photographer} on
  Pexels", linked to the photo's Pexels page.
- Render these from image-credits.json. If an entry is missing its
  photographer or photo_url, fail the build rather than publishing
  uncredited.

Rate limits: 200/hour, 20,000/month. Log X-Ratelimit-Remaining on every
call. On HTTP 429, back off — never retry in a loop. Working around the
rate limit terminates API access.

### Endpoint
```
GET https://api.pexels.com/v1/search
Header: Authorization: $PEXELS_API_KEY
```

### Required parameters for this project
- `orientation=portrait` — always
- `locale=en-US` — always (US market)
- `per_page` — max 80

### Use the `portrait` src variant
`src.portrait` returns 800×1200, which is exactly Pinterest's 2:3 ratio.
Do not re-crop it unless asked.

### Rate limits
- 200 requests/hour, 20,000/month
- Read `X-Ratelimit-Remaining` and `X-Ratelimit-Reset` from responses
- These headers appear **only on 2xx responses**, not on 429
- Never retry aggressively; never attempt to work around the limit —
  Pexels terminates API access for this

### Attribution — REQUIRED
Pexels requires a prominent link back whenever the API is used.

Implementation for this project:
1. `Photos provided by Pexels` link in the site footer — must stay present
2. Per-image credit on collection pages where a Pexels photo appears
3. Pin descriptions: include credit where space allows (site link carries
   the primary obligation)

### Metadata logging — REQUIRED
For every image retrieved, append a record to `data/image-credits.json`:

```json
{
  "pin_id": "kids-wrapping-06",
  "source": "pexels",
  "photo_id": 2014422,
  "photographer": "Joey Farina",
  "photographer_url": "https://www.pexels.com/@joey",
  "photo_url": "https://www.pexels.com/photo/...",
  "alt": "Brown Rocks During Golden Hour",
  "retrieved": "2026-09-02"
}
```

This file is the evidence trail if Pexels ever asks for a demo when
requesting a rate-limit increase. Never delete or truncate it.

### Useful fields
- `alt` — use as the starting point for Pinterest alt text
- `avg_color` — use to pick contrasting overlay text color automatically
- `color` param — accepts hex, use for brand-consistent results

---

## 3. Unsplash — manual only

**Do not add an Unsplash API integration to this project.**

The Unsplash API Guidelines conflict with our pipeline:
- All API images must use hotlinked `photo.urls` — we cannot download and
  burn text overlays onto them
- A request to `photo.links.download_location` is required on download
- Attribution with UTM params and a link to the photographer's profile is
  required on display — impractical inside a pin
- The API is explicitly for "non-automated" experiences

Images downloaded manually from unsplash.com fall under the standard
Unsplash License instead, which permits commercial use and modification.
If I supply an Unsplash image manually, treat it as usable — but still log
it in `image-credits.json` with `"source": "unsplash-manual"`.

---

## 4. Amazon images

- **Interim policy (current):** hotlinking product images directly from
  `m.media-amazon.com` (pulling the real image hash/URL off the live
  product page, never downloading or re-hosting a copy) is the accepted
  approach for **site use only**, until the Amazon Creators API is
  available to us. Creators API access requires a proven sales history,
  which this site doesn't have yet.
- **Target end state:** once Creators API access is granted, migrate site
  images to it and stop hotlinking. Revisit this section then.
- Regardless of interim/end state: Amazon-sourced images may be used
  **solely on our Site**. Never place them into Pinterest or Instagram
  assets, never build collages/composites/slideshows from them, and never
  download-and-store a local copy (hotlink only — the image must keep
  resolving from Amazon's own CDN).
- Resizing proportionally is allowed; alterations that change meaning or
  imply Amazon endorsement are not.

### Amazon links — always need a manual affiliate_url

Amazon is not on Awin. Convert-a-Link (§5) never touches amazon.com URLs —
there is no sitewide auto-conversion for this source.

Rule for `products.json` across any collection, including mixed ones:
- **`source: "amazon"`** → `affiliate_url` is REQUIRED, built via SiteStripe
  or by appending `?tag=OURTAG-20` to the product URL. Never publish an
  untagged Amazon link anywhere — site, Pinterest, or email.
- **Any Awin-merchant source** (`quiettown`, `yellowowlworkshop`,
  `brobasket`, `monbento`) → leave `affiliate_url` empty on-site;
  Convert-a-Link generates the tracked link live in the browser. Only
  build a manual `cread.php` link for off-site use per §5.

A single collection can mix both — check `source` per product, not per
collection, when deciding whether `affiliate_url` is needed.

---

## 5. Awin / merchant feeds

**Confirmed Awin merchants (as of 2026-09):** monbento, Yellow Owl Workshop,
BroBasket, Quiet Town. Check Awin's Advertiser Search before assuming any
other partner is on this network.

Awin product feeds include `aw_image_url` and `aw_thumb_url` with a license
to use in promotion — these **may** be used on social platforms.

Before using a new merchant's feed images:
1. Check that merchant's program terms in Awin
2. Record the outcome in `data/merchant-image-rights.md`
3. If terms are unclear, ask me — do not assume

### On-site links: Publisher MasterTag handles this automatically

The site has Awin's Publisher MasterTag installed sitewide:
```html
<script src="https://www.dwin2.com/pub.3065263.min.js"></script>
```
This must be present before `</body>` on every page. With the
**Convert-a-Link** plugin active, plain merchant product URLs placed on
giftitution.com are automatically rewritten into tracked affiliate links
in the visitor's browser.

**Default behavior: write plain product URLs on the site.** Do not
manually build `cread.php` deep links for on-site content — Convert-a-Link
already does this for any confirmed Awin merchant. Manually-built deep
links are unnecessary duplication and can conflict with the plugin.

The **adMission** plugin auto-discloses monetized links on the site, but
this does NOT cover Pinterest or Instagram — `#ad` in pin/post descriptions
(§7) is still required manually there, since MasterTag only runs on
giftitution.com pages.

### Manual deep links — only for off-site use

If a link is needed somewhere Convert-a-Link doesn't run (e.g. a direct
email newsletter, a non-Awin merchant), build it manually:
```
https://www.awin1.com/cread.php?awinmid={MID}&awinaffid=3065263&clickref={CHANNEL}&ued={URL_ENCODED_TARGET}
```
Always URL-encode `ued`. Always use https. Always set `clickref` so channel
attribution works (`pinterest_*`, `instagram_*`, `email_*`). Ask me for the
merchant's `awinmid` if it isn't already on file — do not guess it.

---

## 6. Secrets

- API keys live in environment variables only
- Never write a key into a source file, a commit, or a log
- Never print a key in terminal output
- `.env` stays in `.gitignore`

---

## 7. Disclosure

Every generated pin/post description must begin with `#ad`.
This is non-negotiable — it is both an FTC and a platform requirement.

---

## 8. When rules conflict

Order of precedence:
1. Platform legal terms (Amazon, Awin, Pexels, Unsplash)
2. FTC / disclosure requirements
3. Pinterest and Instagram policies
4. Performance optimization

If a task requires violating (1) or (2), stop and explain the conflict.
Do not propose a workaround.

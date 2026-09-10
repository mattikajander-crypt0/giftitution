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
| Amazon (hotlinked — see §4) | yes, interim | **never** | **never** |
| Awin product feed | yes | yes | check merchant terms |
| Own photography | yes | yes | yes |

**Default choice for pin generation: Pexels API.**

---

## 2. Pexels API — primary source

### Endpoint

```
GET https://api.pexels.com/v1/search
Header: Authorization: $PEXELS_API_KEY
```

Required parameters for this project:

- `orientation=portrait` — always
- `locale=en-US` — always (US market)
- `per_page` — max 80

Pins render at 1000×1500. `src.portrait` is only 800×1200, so use
`src.large2x` or `src.original` and resize down. Never upscale.

Useful response fields:

- `alt` — starting point for Pinterest alt text, then rewrite it to describe
  the gift rather than the stock photo
- `avg_color` — rough guide only, see the contrast rule below
- `color` param — accepts hex, use for palette-consistent results

### Attribution — REQUIRED

The Pexels *download license* waives attribution. The *API guidelines* do not.
This project uses the API, so attribution is mandatory.

1. A visible `Photos provided by Pexels` link in the site footer — must stay
   present on every page that displays API-sourced imagery.
2. A per-image credit on collection pages: `Photo by {photographer} on Pexels`,
   linked to the photo's Pexels page.
3. Render both from `data/image-credits.json`. If an entry is missing its
   photographer or photo_url, fail the build rather than publishing uncredited.

Pin descriptions carry no attribution obligation — the site link carries it.

### Rate limits

- 200 requests/hour, 20,000/month
- Log `X-Ratelimit-Remaining` and `X-Ratelimit-Reset` on every call
- These headers appear **only on 2xx responses**, not on 429
- On 429, back off. Never retry in a loop, and never attempt to work around
  the limit — Pexels terminates API access for this

### image-credits.json — append-only with dedupe

The file is an attribution register, not a run log. It answers "which photos are
in use and who gets credit", so credits can be rendered on collection pages. It
is also the evidence trail if Pexels asks for a demo when we request a
rate-limit increase.

Schema — every entry has exactly these fields:

```json
{
  "used_in": "jewel-06",
  "source": "pexels",
  "photo_id": 2014422,
  "photographer": "Joey Farina",
  "photographer_url": "https://www.pexels.com/@joey",
  "photo_url": "https://www.pexels.com/photo/...",
  "alt": "Brown Rocks During Golden Hour"
}
```

Rules:

- Append a new entry only when `photo_id` + `used_in` is not already present.
  An exact re-run writes nothing.
- Do not include a date or any run identifier in the dedupe key. A date defeats
  the dedupe on the next day's run.
- Never delete or edit an existing entry. Skipping an identical append is not
  deletion — history stays intact.
- If a pin later uses a different photo, keep both entries. The file records
  what has been used, not only what is current.
- If any required field is missing, fail the run rather than writing an
  incomplete entry. An incomplete entry is worse than a missing one, because it
  looks like attribution is handled while rendering an empty credit.

### Query guidance for pin backgrounds

Use material and texture queries — velvet, silk, marble, stone, glass. Avoid
styled arrangements (`flat lay`, `table setting`): in stock libraries these
reliably return seasonal, usually Christmas, styling. Jewel Tones and the other
Color Lovers collections are year-round.

Skip candidates whose Pexels `alt` contains christmas, holiday, xmas, santa,
new year, easter or valentine. This is a backstop, not the primary defence —
fix the query first.

### Legibility — hard requirement

Pins render roughly 236px wide in the Pinterest feed. A headline that reads
fine at full size is often unreadable there.

- The headline must dominate the pin. Render a 236px-wide preview alongside
  each full-size pin so legibility can be judged at feed scale.
- Always place a semi-transparent scrim behind the headline.
- Sample contrast from the region behind the text, not from `avg_color` of the
  whole image — a light-average photo can still have a dark area under the text.
- Keep the top 15% and bottom 12% clear of text; Pinterest's own UI covers them.
- For typographic variants, use the palette hex as a solid background rather
  than a photo.

---

## 3. Unsplash — manual only

**Do not add an Unsplash API integration to this project.**

The Unsplash API Guidelines conflict with our pipeline:

- All API images must use hotlinked `photo.urls` — we cannot download and burn
  text overlays onto them
- A request to `photo.links.download_location` is required on download
- Attribution with UTM params and a link to the photographer's profile is
  required on display — impractical inside a pin
- The API is explicitly for "non-automated" experiences

Images downloaded manually from unsplash.com fall under the standard Unsplash
License instead, which permits commercial use and modification. If I supply an
Unsplash image manually, treat it as usable — but still log it in
`image-credits.json` with `"source": "unsplash-manual"`.

---

## 4. Amazon images

**Interim approach — my decision, my risk.** Product images are hotlinked
directly from `m.media-amazon.com`, using the real image URL from the live
product page, never downloading or re-hosting a copy. This is **site use only**.

To be explicit about what this is: it is not compliant with the Associates
Operating Agreement, which licenses Program Content obtained through approved
tools. I have weighed that and accepted it as an interim measure. It is not a
reading of the terms, and §8 does not override it — this section is the
exception, and the only one.

Creators API access requires a proven sales history this site doesn't have yet.

**Target end state:** once Creators API access is granted, migrate site images
to it and stop hotlinking. Revisit this section then.

Regardless of interim or end state:

- Amazon-sourced images may be used **solely on our Site**. Never place them
  into Pinterest or Instagram assets.
- Never build collages, composites or slideshows from them.
- Never download and store a local copy — hotlink only, the image must keep
  resolving from Amazon's own CDN.
- Resizing proportionally is allowed; alterations that change meaning or imply
  Amazon endorsement are not.

### Amazon links — always need a manual affiliate_url

Amazon is not on Awin. Convert-a-Link (§5) never touches amazon.com URLs —
there is no sitewide auto-conversion for this source.

Rule for `products.json` across any collection, including mixed ones:

- **`source: "amazon"`** → `affiliate_url` is REQUIRED, built via SiteStripe or
  by appending `?tag=OURTAG-20` to the product URL. Never publish an untagged
  Amazon link anywhere — site, Pinterest, or email.
- **Any Awin-merchant source** (`quiettown`, `yellowowlworkshop`, `brobasket`,
  `monbento`) → leave `affiliate_url` empty on-site; Convert-a-Link generates
  the tracked link live in the browser. Only build a manual `cread.php` link
  for off-site use per §5.

A single collection can mix both — check `source` per product, not per
collection, when deciding whether `affiliate_url` is needed.

---

## 5. Awin / merchant feeds

**Confirmed Awin merchants (as of 2026-09):** monbento, Yellow Owl Workshop,
BroBasket, Quiet Town. Check Awin's Advertiser Search before assuming any other
partner is on this network.

Awin product feeds include `aw_image_url` and `aw_thumb_url` with a license to
use in promotion — these **may** be used on social platforms. The license is
"without modification", so they cannot carry a text overlay. Use them as-is on
the site; do not use them as pin backgrounds.

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
giftitution.com are automatically rewritten into tracked affiliate links in the
visitor's browser.

**Default behavior: write plain product URLs on the site.** Do not manually
build `cread.php` deep links for on-site content — Convert-a-Link already does
this for any confirmed Awin merchant. Manually-built deep links are unnecessary
duplication and can conflict with the plugin.

The **adMission** plugin auto-discloses monetized links on the site, but this
does NOT cover Pinterest or Instagram — `#ad` in pin/post descriptions (§7) is
still required manually there, since MasterTag only runs on giftitution.com
pages.

### Manual deep links — only for off-site use

If a link is needed somewhere Convert-a-Link doesn't run (e.g. a direct email
newsletter, a non-Awin merchant), build it manually:

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
- Do not type a key into a file on my behalf, and do not accept one pasted in
  chat — tell me to add it myself

---

## 7. Disclosure

Every generated pin/post description must begin with `#ad`.
This is non-negotiable — it is both an FTC and a platform requirement.

Pin destinations are always a giftitution.com collection page, never a merchant
or Amazon URL directly.

---

## 8. When rules conflict

Order of precedence:

1. Platform legal terms (Amazon, Awin, Pexels, Unsplash)
2. FTC / disclosure requirements
3. Pinterest and Instagram policies
4. Performance optimization

If a task requires violating (1) or (2), stop and explain the conflict. Do not
propose a workaround. The single exception is the interim approach recorded in
§4, which I have decided explicitly.

---

## 9. Repo and deployment

Repo: `mattikajander-crypt0/giftitution`
Deployed via Cloudflare Workers Builds. **A push to main deploys to
production.** Non-main branches upload preview versions.

- Show `git show --stat` before any push. Never push a commit whose contents
  you haven't shown me.
- Never commit: `.env`, `node_modules/`, `output/`
- `output/pins/` is generated output, not source. Pins are uploaded to
  Pinterest manually and never committed.
- `scripts/`, `data/` and `CLAUDE.md` belong in the repo.
- There is a separate `From ChatGPT/` folder tree outside the repo with earlier
  parallel work. Leave it alone unless I ask about it specifically.
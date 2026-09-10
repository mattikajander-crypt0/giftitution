'use strict';

/**
 * Pexels-backed pin image pipeline for the Jewel Tones collection.
 * See CLAUDE.md §2 (Pexels), §5 (Awin), §7 (disclosure) for the rules this follows.
 *
 * Usage:
 *   node --env-file=.env scripts/generate-pins.js                # all in-scope pins
 *   node --env-file=.env scripts/generate-pins.js jewel-06 jewel-07   # just these two
 *
 * Scope: only "typographic" and "stock" format pins are produced here.
 * "product" format pins (jewel-11, jewel-12) are Awin-sourced product photos and
 * are intentionally skipped — this script burns text onto every image it touches,
 * and Awin feed images carry a no-modification license that hasn't been cleared
 * for these merchants yet (CLAUDE.md §5). Handle those separately.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const COLLECTION_PATH = path.join(ROOT, 'data', 'jewel-tones-collection.json');
const CREDITS_PATH = path.join(ROOT, 'data', 'image-credits.json');
const OUTPUT_DIR = path.join(ROOT, 'output', 'pins');

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1500;
const SAFE_TOP = Math.round(CANVAS_HEIGHT * 0.15); // 225 — Pinterest header chrome
const SAFE_BOTTOM = Math.round(CANVAS_HEIGHT * 0.12); // 180 — Pinterest save-bar chrome
const SAFE_TOP_Y = SAFE_TOP;
const SAFE_BOTTOM_Y = CANVAS_HEIGHT - SAFE_BOTTOM;
const SAFE_HEIGHT = SAFE_BOTTOM_Y - SAFE_TOP_Y;
const TEXT_MARGIN_X = 80;
const MAX_TEXT_WIDTH = CANVAS_WIDTH - TEXT_MARGIN_X * 2;

// Headline sizes tuned to dominate the pin at full size, not just be legible —
// Pinterest feed thumbnails render at ~236px wide, a ~4.2x downscale from
// this 1000px canvas. A 236px-wide preview is rendered alongside every pin
// specifically so feed-scale legibility can be checked without eyeballing it.
const TYPOGRAPHIC_FONT_SIZE = 132;
const STOCK_FONT_SIZE = 100;
const PREVIEW_WIDTH = 236;
const PREVIEW_HEIGHT = Math.round((PREVIEW_WIDTH * CANVAS_HEIGHT) / CANVAS_WIDTH);

const PEXELS_ENDPOINT = 'https://api.pexels.com/v1/search';

// Stock photos are picked for a year-round "jewel tones" theme, not a
// holiday one — skip any candidate whose Pexels alt text flags it as
// seasonal rather than silently accepting whatever ranks first.
const SEASONAL_TERMS = ['christmas', 'holiday', 'xmas', 'santa', 'new year', 'easter', 'valentine'];

function isSeasonal(photo) {
  const alt = (photo.alt || '').toLowerCase();
  return SEASONAL_TERMS.some((term) => alt.includes(term));
}

// ---------------------------------------------------------------- utilities

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Required file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function channelLuminance(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

// WCAG contrast ratio between a background luminance and white/black text,
// picking whichever gives the higher ratio — not an eyeballed threshold.
function pickTextColor(hexBg) {
  const L = relativeLuminance(hexToRgb(hexBg));
  const ratioWithWhite = (1.0 + 0.05) / (L + 0.05);
  const ratioWithBlack = (L + 0.05) / (0.0 + 0.05);
  return ratioWithWhite >= ratioWithBlack
    ? { color: '#FFFFFF', ratio: ratioWithWhite }
    : { color: '#111111', ratio: ratioWithBlack };
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Approximate word-wrap without real font metrics: bold sans-serif averages
// roughly 0.58 * fontSize px per character, which is close enough for a
// centered headline at these sizes.
function wrapText(text, fontSize, maxWidthPx) {
  const approxCharWidth = fontSize * 0.58;
  const maxChars = Math.max(1, Math.floor(maxWidthPx / approxCharWidth));
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Shared geometry so the scrim, the region sampler, and the SVG text all
// agree on exactly where "the text area" is.
function measureTextBlock(title, fontSize) {
  const lines = wrapText(title, fontSize, MAX_TEXT_WIDTH);
  const lineHeight = fontSize * 1.25;
  const blockHeight = lines.length * lineHeight;
  const startY = SAFE_TOP_Y + (SAFE_HEIGHT - blockHeight) / 2 + fontSize; // baseline of first line
  const ascent = fontSize * 0.85;
  const descent = fontSize * 0.25;
  const padding = fontSize * 0.35;
  const top = Math.max(0, Math.round(startY - ascent - padding));
  const bottom = Math.min(CANVAS_HEIGHT, Math.round(startY + (lines.length - 1) * lineHeight + descent + padding));
  return { lines, lineHeight, startY, top, height: bottom - top };
}

// scrim: { fill: '#000000' | '#FFFFFF', opacity: 0..1 } drawn full-width
// behind the text, or null for no scrim (typographic pins on a solid fill
// don't need one — there's no underlying detail to guard against).
function buildTextSvg(title, fontSize, textColor, scrim) {
  const block = measureTextBlock(title, fontSize);

  const scrimRect = scrim
    ? `<rect x="0" y="${block.top}" width="${CANVAS_WIDTH}" height="${block.height}" fill="${scrim.fill}" fill-opacity="${scrim.opacity}" />`
    : '';

  const textElements = block.lines
    .map((line, i) => {
      const y = block.startY + i * block.lineHeight;
      return `<text x="${CANVAS_WIDTH / 2}" y="${y}" font-family="Arial, Helvetica, sans-serif" ` +
        `font-weight="800" font-size="${fontSize}" fill="${textColor}" text-anchor="middle">` +
        `${escapeXml(line)}</text>`;
    })
    .join('\n');

  return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
${scrimRect}
${textElements}
</svg>`;
}

// Average out a region of an already-canvas-sized image buffer to a single
// hex color by downsampling it to 1x1 — cheap, dependency-free "region
// average" that avoids sampling against the whole photo's avg_color when
// only a band behind the headline actually matters for contrast.
async function sampleRegionHex(canvasBuffer, { top, height }) {
  const region = await sharp(canvasBuffer)
    .extract({ left: 0, top, width: CANVAS_WIDTH, height })
    .resize(1, 1, { fit: 'fill' })
    .raw()
    .toBuffer();
  const [r, g, b] = region;
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Dedupe key is (photo_id, used_in) only — not pin_id or date. A re-run of
// the same pin with the same photo is exactly what this skips; a later run
// of the same pin with a *different* photo_id is a new entry and must stay,
// since the file records every photo that has ever been used, not just the
// current one. Existing entries are never rewritten or removed.
function appendCredits(entries) {
  const existing = loadJson(CREDITS_PATH, []);
  const seen = new Set(existing.map((e) => `${e.photo_id}::${e.used_in}`));

  const toAppend = [];
  for (const entry of entries) {
    const key = `${entry.photo_id}::${entry.used_in}`;
    if (seen.has(key)) {
      console.log(`  Skipping duplicate credit entry — photo ${entry.photo_id} already logged for ${entry.used_in}`);
      continue;
    }
    seen.add(key);
    toAppend.push(entry);
  }

  if (!toAppend.length) return 0;
  const updated = existing.concat(toAppend);
  fs.writeFileSync(CREDITS_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  return toAppend.length;
}

// ------------------------------------------------------------------ Pexels

async function searchPexels(query, hex) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not set in the environment. Run with `node --env-file=.env scripts/generate-pins.js`.');
  }

  const url = new URL(PEXELS_ENDPOINT);
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'portrait');
  url.searchParams.set('locale', 'en-US');
  url.searchParams.set('size', 'large');
  url.searchParams.set('per_page', '15');
  url.searchParams.set('color', hex.replace('#', ''));

  const res = await fetch(url, { headers: { Authorization: apiKey } });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Pexels search failed for query "${query}" — HTTP ${res.status} ${res.statusText}. ${body}\n` +
      'Not retrying: CLAUDE.md §2 forbids retrying aggressively or working around rate limits.'
    );
  }

  const remaining = res.headers.get('x-ratelimit-remaining');
  const reset = res.headers.get('x-ratelimit-reset');
  if (remaining !== null) {
    console.log(`  Pexels rate limit — remaining: ${remaining}, reset: ${reset}`);
  }

  const data = await res.json();
  if (!data.photos || data.photos.length === 0) {
    throw new Error(`Pexels query "${query}" returned 0 results. Not falling back to another source — fix the query or the color filter.`);
  }

  for (const photo of data.photos) {
    if (isSeasonal(photo)) {
      console.log(`  Skipping Pexels photo ${photo.id} — seasonal alt text: "${photo.alt}"`);
      continue;
    }
    return photo;
  }

  throw new Error(
    `All ${data.photos.length} Pexels results for "${query}" were filtered out as seasonal ` +
    `(${SEASONAL_TERMS.join(', ')}). Not falling back to a seasonal photo — try a different query.`
  );
}

async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download Pexels image from ${url} — HTTP ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// -------------------------------------------------------------- pin build

async function buildTypographicPin(pin, collection) {
  const paletteHex = collection.typographic_hex || collection.hex;
  const bgHex = `#${paletteHex}`;
  const { color: textColor } = pickTextColor(bgHex);
  const svg = buildTextSvg(pin.title, TYPOGRAPHIC_FONT_SIZE, textColor, null);

  const background = await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: bgHex,
    },
  })
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();

  return { buffer: background, creditEntry: null, siteAlt: pin.alt };
}

async function buildStockPin(pin, collection) {
  const query = pin.image_source.replace(/^pexels search:\s*/i, '').trim();
  const photo = await searchPexels(query, collection.hex);

  console.log(`  Selected Pexels photo ${photo.id} by ${photo.photographer} (whole-image avg_color ${photo.avg_color})`);

  const rawImage = await fetchImageBuffer(photo.src.portrait);
  const canvasBuffer = await sharp(rawImage)
    .resize(CANVAS_WIDTH, CANVAS_HEIGHT, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  // avg_color describes the whole photo, not what's actually behind the
  // headline — sample the text's own band instead, then pin both the text
  // color and the scrim's tint to that so the pairing always contrasts
  // regardless of local detail (a dark ribbon in an otherwise light photo,
  // for example) rather than relying on the scrim alone to save it.
  const block = measureTextBlock(pin.title, STOCK_FONT_SIZE);
  const regionHex = await sampleRegionHex(canvasBuffer, block);
  const { color: textColor } = pickTextColor(regionHex);
  const scrim = textColor === '#FFFFFF'
    ? { fill: '#000000', opacity: 0.55 }
    : { fill: '#FFFFFF', opacity: 0.55 };
  console.log(`  Text-region sampled color ${regionHex} -> ${textColor} text on a ${scrim.fill} scrim`);

  const svg = buildTextSvg(pin.title, STOCK_FONT_SIZE, textColor, scrim);

  const composed = await sharp(canvasBuffer)
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();

  const creditEntry = {
    pin_id: pin.id,
    source: 'pexels',
    photo_id: photo.id,
    photographer: photo.photographer,
    photographer_url: photo.photographer_url,
    photo_url: photo.url,
    alt: pin.alt,
    pexels_alt: photo.alt || null,
    query,
    retrieved: todayIso(),
  };

  return { buffer: composed, creditEntry, siteAlt: pin.alt };
}

function writeDescriptionFile(pin, collection, slug) {
  const destinationUrl = collection.url.startsWith('http') ? collection.url : `https://${collection.url}`;
  const body = `${pin.description}\n\n${destinationUrl}\n`;
  const outPath = path.join(OUTPUT_DIR, `${slug}.txt`);
  fs.writeFileSync(outPath, body, 'utf8');
  return outPath;
}

function pinSlug(collection, pin) {
  const suffix = pin.id.split('-')[1] || pin.id;
  return `${collection.slug}-${suffix}`;
}

// --------------------------------------------------------------------- run

async function run(requestedIds) {
  const data = loadJson(COLLECTION_PATH);
  const { collection, pins } = data;

  if (!collection.hex) {
    throw new Error('collection.hex is missing in data/jewel-tones-collection.json — required for Pexels color search and typographic backgrounds.');
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const eligible = pins.filter((p) => p.format === 'typographic' || p.format === 'stock');
  const skipped = pins.filter((p) => p.format === 'product');

  if (skipped.length) {
    console.log(`Skipping ${skipped.length} product-format pin(s) (${skipped.map((p) => p.id).join(', ')}) — Awin product photos, out of scope for this Pexels-only script. See CLAUDE.md §5.`);
  }

  const targets = requestedIds && requestedIds.length
    ? eligible.filter((p) => requestedIds.includes(p.id))
    : eligible;

  if (requestedIds && requestedIds.length) {
    const missing = requestedIds.filter((id) => !eligible.some((p) => p.id === id));
    if (missing.length) {
      throw new Error(`Requested pin id(s) not found among eligible (typographic/stock) pins: ${missing.join(', ')}`);
    }
  }

  console.log(`Generating ${targets.length} pin(s): ${targets.map((p) => p.id).join(', ')}`);

  const newCredits = [];

  for (const pin of targets) {
    const slug = pinSlug(collection, pin);
    console.log(`\n[${pin.id}] format=${pin.format} -> ${slug}.png`);

    let result;
    if (pin.format === 'typographic') {
      result = await buildTypographicPin(pin, collection);
    } else {
      result = await buildStockPin(pin, collection);
    }

    const pngPath = path.join(OUTPUT_DIR, `${slug}.png`);
    fs.writeFileSync(pngPath, result.buffer);
    console.log(`  Wrote ${pngPath}`);

    const previewBuffer = await sharp(result.buffer)
      .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, { fit: 'cover' })
      .png()
      .toBuffer();
    const previewPath = path.join(OUTPUT_DIR, `${slug}-preview236.png`);
    fs.writeFileSync(previewPath, previewBuffer);
    console.log(`  Wrote ${previewPath} (${PREVIEW_WIDTH}x${PREVIEW_HEIGHT} feed-scale preview)`);

    if (result.creditEntry) {
      result.creditEntry.used_in = `${slug}.png`;
      newCredits.push(result.creditEntry);
    }

    const txtPath = writeDescriptionFile(pin, collection, slug);
    console.log(`  Wrote ${txtPath}`);
  }

  if (newCredits.length) {
    const appendedCount = appendCredits(newCredits);
    console.log(`\nAppended ${appendedCount} of ${newCredits.length} credit entr(y/ies) to ${CREDITS_PATH} (${newCredits.length - appendedCount} duplicate(s) skipped)`);
  }

  console.log('\nDone.');
}

const requestedIds = process.argv.slice(2);
run(requestedIds).catch((err) => {
  console.error('\nFAILED:', err.message);
  process.exit(1);
});

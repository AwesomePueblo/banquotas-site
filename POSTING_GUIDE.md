# TwoSuitDonny / BanQuotas — Posting Workflow

When the user says "let's do post N", follow every step in order.

---

## Step 1 — Write the post

Pull source content from the site, then produce a complete ready-to-paste Substack post including:
- **Title** and **Subtitle**
- **Opening hook** (2–4 lines, no italics, draws reader in before the prose)
- **Original prose** from the site (in italics)
- **Science + faith section** (weave facts with God's creation framing — avoid Big Bang, use "the moment God created the universe / spoke light into being / etc.")
- **Closing teaser** for the next post
- **Standing sign-off:** *"TwoSuitDonny is a journey through God's creation — the light, the senses, and the wonders He built into the fabric of how we experience the world. Subscribe to follow the rest of the journey through the spectrum."*

---

## Step 2 — Provide tags

Always include:
- `Faith`
- `Science`
- `Creation`
- `Light` (for the Light series) or `Taste` / `Quantum` (for those series)
- `Journey Through Light` (or the relevant series tag)
- 1–2 topic-specific tags (e.g. `Vision`, `Nature`, `Physics`)

Max 6 tags total.

---

## Step 3 — Provide the Substack Note

Write the Note as a ready-to-copy block. Format:
- Line 1–2: the single most arresting fact or line from the post (make it work as a standalone thought)
- Line 3: one sentence of context or consequence
- Final line: "Part N of the Journey Through Light: [link placeholder]"

**How to post it:**
1. Open Substack app or substack.com
2. Tap/click the compose icon → choose **Note** (not Post)
3. Paste the text, replace [link placeholder] with your published post URL
4. Publish immediately after the post goes live

---

## Step 4 — Provide image prompts

Give prompts for both **Midjourney** and **DALL-E 3**, tailored to the post's specific content and mood. Key style words to maintain across all posts: *painterly, reverent, cinematic, divine, no text, wide format (3:2 or 16:9).*

---

## Step 5 — After user publishes and drops the link

1. Add a new post card to the newsletter section of `index.html` (newest first)
2. Move "Latest post" label to the new card, remove it from the previous one
3. Commit and push to `main`

Card format:
```html
<a class="substack-post" href="[URL]" target="_blank" rel="noopener">
  <h4>[Title]</h4>
  <span class="substack-post-date">June 2026 &mdash; Latest post</span>
  <p>[2-sentence excerpt from the opening hook]</p>
</a>
```

---

## Full Content Series — Source Pages

### Series 1: Journey Through Light
Source: `senses/light.html`

| # | Title | Status | Source Section |
|---|-------|--------|---------------|
| 1 | Why I Write About the Senses | ✅ Published | Intro / original |
| 2 | The Silence Before Light | ✅ Published | Radio Waves |
| 3 | The Afterglow of Creation | ✅ Published | Microwaves + Infrared |
| 4 | And Then There Was Color | ✅ Published | Visible Light |
| 5 | The Secret Garden | ✅ Published | Ultraviolet |
| 6 | The Light That Sees Through You | ✅ Published | X-Rays |
| 7 | I Have Become the Light | ✅ Published | Gamma Rays |
| 8 | The Full Spectrum (reflection) | ⬜ Not written | Original / synthesis |

### Series 2: Journey Through Taste
Source: `senses/taste.html`

| # | Title | Status | Source Section |
|---|-------|--------|---------------|
| 9  | The Two Tastes You Were Born Trusting | ✅ Published | Sweet + Salt |
| 10 | Warning System | ✅ Published | Sour + Bitter |
| 11 | The Taste With No English Word | ✅ Published | Umami |
| 12 | The Sixth Taste | ✅ Published | Oleogustus / Fat |
| 13 | The Fiction of Flavor | ⬜ Not written | Smell + brain synthesis |

### Series 3: Quantum Perception
Source: `senses/quantum.html`

| # | Title | Status | Source Section |
|---|-------|--------|---------------|
| 14 | The Observer and the Observed | ⬜ Not written | Delayed choice experiment |
| 15 | Does God Play Dice? | ⬜ Not written | Quantum uncertainty + faith |

---

## Voice & Editorial Rules

- **Italic prose** = pulled from the site's original essays
- **Non-italic** = new science commentary written for Substack
- Opening hook is always non-italic, first-person observational, short
- Closing teaser always previews the next post by name
- Sign-off is always the TwoSuitDonny line (exact wording above)

### God & Scripture Rules (STRICT)
- **Never use the word "evolution"** — reframe neutrally: "the body is calibrated to," "we were built to," "nature designed," "precisely tuned to"
- **Never replace God with evolution** or vice versa
- **God/scripture only if:** (1) already in the source page content, OR (2) user explicitly requests it
- **All scripture must be NIV84**
- **Confirm with user before adding** any God/scripture reference not in the source
- **No Big Bang framing** — if origin of universe must be mentioned, use "the moment God created the universe" or similar — but only if user approves

---

## Platforms

- **Substack:** twosuitdonny.substack.com
- **Website:** banquotas.com (GitHub Pages, auto-deploys from `main`)
- **Notes:** Post in Substack Notes tab immediately after each post publishes

## Notes on Growing Views
- Post a Note on Substack every time a new post goes live
- Make sure publication is listed under both "Religion & Spirituality" and "Science" categories in Substack settings

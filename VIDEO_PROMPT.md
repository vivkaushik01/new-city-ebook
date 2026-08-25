# Author Welcome Video — Script + Generation Prompt

**File expected at:** `public/videos/author-welcome.mp4`
**Used:** "A Note From Sarah Mitchell" section, directly under the feature grid.

### A quick honest note first
This is written as an **author welcome video in authentic, UGC-style** —
filmed like a phone selfie video, not a polished ad — because that's what
actually converts on landing pages *and* because it's honest: it's the
author talking, not an actor pretending to be a random satisfied customer.
If you'd rather film this yourself on a phone instead of generating it,
just read the script below straight to camera — it'll likely look and feel
more authentic than an AI generation anyway.

---

## Option A: Generation prompt (for Sora, Runway, Pika, HeyGen, or similar)

> A warm, authentic UGC-style selfie video of a friendly woman in her late
> thirties standing in a home kitchen, talking directly to the camera as
> if filming herself on a phone. Natural window lighting, slightly handheld
> camera feel, casual apron over a sweater, warm wood-toned kitchen
> background softly out of focus. She speaks warmly and personally,
> gesturing naturally, making genuine eye contact with the lens. Tone:
> honest, warm, encouraging — not scripted-sounding, not a hard sell.
> Vertical 9:16 format, 30–40 seconds, natural color grading, soft warm
> tones matching a cream-and-terracotta brand palette.

*(If your video tool accepts a voice/dialogue track, pair it with the
script below. If it generates lip-synced dialogue directly, feed it the
script as the spoken line.)*

---

## Option B: The dialogue script (for AI lip-sync, voiceover, or filming it yourself)

**Duration target: ~35–40 seconds**

> "Hi — I'm Sarah. I was diagnosed with celiac disease in my late twenties,
> and honestly? The hardest part wasn't giving up gluten.
>
> It was that nobody explained *why* gluten-free cooking behaves so
> differently. Why my bread kept collapsing. Why my flour blends never
> worked the way the recipe promised.
>
> So I wrote the book I wish I'd had on day one — not just recipes, but
> the actual science behind them, plus real systems for grocery shopping,
> meal planning, eating out, and travel.
>
> If you've ever felt like gluten-free cooking is working against you —
> this book is going to change that. I'll see you in the kitchen."

*(Pause 1 second on the final line before ending, so the video doesn't feel abruptly cut off.)*

---

## Placement notes
- The HTML already wires this file in as an inline, controllable `<video>`
  element (not autoplay) with `author-photo.jpg` as its poster/thumbnail —
  visitors click play, which tends to perform better than forced autoplay.
- Keep the file under ~15MB if possible so it loads fast on Render's free tier.
- If you skip video entirely, just delete the `<source>` tag in
  `index.html` and the poster image will display alone — the section
  still reads fine as a styled quote block.

# Image Prompts

Generate these with Midjourney, DALL·E, Ideogram, or similar, then drop the
file into `public/images/` using **exactly** the filename shown — the HTML
already points at these paths, so nothing else needs to change.

The page will not break if an image is missing — it shows a subtle striped
placeholder instead — but obviously looks far better with the real thing.

---

### 1. `hero-book-mockup.png`
**Used:** Hero section, top of page — the single most important image on the page.

> A professional 3D book cover mockup of a paperback cookbook titled "The
> Gluten-Free Kitchen" standing upright at a slight angle, photographed in
> soft natural window light on a warm wooden kitchen counter. The cover is
> a warm cream color with terracotta-brown accents, elegant serif
> typography, and a minimalist line-art wheat stalk icon with a diagonal
> slash through it. Beside the book: a small rustic bowl, a wooden spoon,
> and a few scattered oats or grains, softly out of focus. Warm, editorial,
> lifestyle food-photography style, shallow depth of field, no people,
> high resolution, magazine quality.

Aspect ratio: portrait or square, at least 1600px wide.

---

### 2. `toolkit-preview.jpg`
**Used:** "What's Actually Inside" section — shows the printable worksheets.

> A flat-lay photo of a printed worksheet page titled "Pantry Audit"
> sitting on a warm wooden table, styled like a professional planner or
> workbook product photo. The page has a clean cream background, a brown
> header bar, and a simple table with checkboxes. A pen and a small potted
> herb rest beside it. Soft natural light, top-down flat-lay composition,
> warm and organized aesthetic, high resolution.

---

### 3. `recipe-sample-1.jpg`
**Used:** "What's Actually Inside" section — shows a sample recipe layout.

> A styled overhead flat-lay photograph of a printed cookbook recipe page
> on a wooden table, next to the actual finished dish it describes — a
> rustic gluten-free breakfast bowl with fruit, yogurt, and granola in a
> ceramic bowl. Warm natural lighting, shallow depth, editorial food
> photography style, cream and terracotta color palette to match a
> cookbook's branding.

---

### 4. `author-photo.jpg`
**Used:** Poster image for the author video before it's played.

> A warm, approachable lifestyle portrait of a woman in her late thirties
> with a friendly smile, standing in a home kitchen, wearing a simple
> apron over a casual sweater, softly lit by natural window light. She is
> mid-conversation, gesturing gently, as if talking to camera. Background
> is a softly blurred cozy kitchen with warm wood tones. Natural,
> authentic, not overly polished — approachable "creator" photography
> style rather than a corporate headshot.

---

### 5. `og-image.jpg`
**Used:** Social share preview (Facebook/Twitter/link previews). Can reuse
the hero mockup composition but cropped to a landscape 1200×630px banner.

> A landscape-format promotional banner, 1200x630px, warm cream
> background, showing the book cover mockup on the left and bold serif
> text on the right reading "125+ Foolproof Gluten-Free Recipes." Terracotta
> and cream color palette, clean minimalist layout, high contrast enough
> to read as a small thumbnail.

---

## Optional extras (not wired into the HTML yet, but nice to add later)

- `lifestyle-1.jpg` / `lifestyle-2.jpg` — candid warm kitchen scenes (someone
  cooking, a family table) if you want to expand the "Problem/Empathy"
  section visually.
- A small `favicon.ico` (32×32) using the wheat-stalk icon from the cover,
  dropped into `public/` and linked in `<head>` if you want a browser tab icon.

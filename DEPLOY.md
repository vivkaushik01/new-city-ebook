# Deploy Guide — Google Sheet → Razorpay → Render (all free)

Follow these in order. Total time: roughly 45–60 minutes the first time.

---

## STEP 1 — Google Sheet (your buyer database)

1. Go to [sheets.google.com](https://sheets.google.com) → create a **new blank sheet**.
2. Rename the tab at the bottom to `Sheet1` (or note whatever it's called —
   you'll put that name in `Code.gs`).
3. In row 1, type these column headers exactly, one per cell:
   `Timestamp | Name | Email | OrderID | PaymentID | AmountPaid | Token | ExpiresAt | Used`
4. Go to **Extensions → Apps Script**. Delete the placeholder `myFunction()`
   code, and paste in the entire contents of `apps-script/Code.gs` from this
   project.
5. At the top of the pasted code, edit the `CONFIG` block:
   - `SITE_URL` → you won't have this yet on the first pass — leave the
     placeholder, you'll come back and update it after Step 6.
   - `SUPPORT_EMAIL`, `FROM_NAME`, `BOOK_TITLE` → fill in your real details.
6. Click **Deploy → New deployment**.
   - Click the gear icon → select type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**. Google will ask you to authorize — approve it (it's
     your own script, this is expected).
7. Copy the **Web app URL** it gives you (ends in `/exec`). This is your
   `GOOGLE_SHEET_WEBAPP_URL` — save it somewhere for Step 4.

**This Google Sheet is now your buyer database and mailing list** — every
purchase appends a row automatically, including an `ExpiresAt` timestamp for
that buyer's download link. Export it to CSV anytime from File → Download,
or connect it to Mailchimp/any email tool later.

---

## STEP 2 — Your book file

1. Upload your final book PDF to Google Drive.
2. Right-click the file → **Share** → change access to **"Anyone with the
   link"** (Viewer).
3. Copy the file's ID out of its share link:
   `https://drive.google.com/file/d/`**`THIS_PART_IS_THE_ID`**`/view`
4. Save that ID — it's your `BOOK_FILE_ID` for Step 4.

*(Buyers never see this Drive link — the server proxies the download
through your one-time, time-limited token URL instead.)*

---

## STEP 3 — Razorpay

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → sign up
   (Indian business/individual KYC is required to go **live**, but you can
   build and test everything below first in **Test Mode** with no KYC).
2. Make sure you're in **Test Mode** first (toggle, top-left) — test
   everything before going live.
3. Go to **Settings → API Keys → Generate Test Key**. Copy the **Key ID**
   and **Key Secret** — these are your `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET` for Step 4.
4. When you're ready to accept real payments later, complete Razorpay's KYC
   (business/individual documents, bank account), switch to **Live Mode**,
   generate **Live** API keys the same way, and swap them into Render's
   environment variables.
5. Razorpay's Standard Checkout (the popup this project uses) supports UPI,
   cards, netbanking, and wallets out of the box for INR — no extra setup
   needed for any of those.

---

## STEP 4 — Configure the project

1. In this project folder, copy `.env.example` to a new file named `.env`.
2. Fill in every value using what you collected in Steps 1–3:
   ```
   RAZORPAY_KEY_ID=...
   RAZORPAY_KEY_SECRET=...
   GOOGLE_SHEET_WEBAPP_URL=...
   BOOK_FILE_ID=...
   PORT=3000
   SITE_URL=http://localhost:3000
   DOWNLOAD_EXPIRY_HOURS=48
   SELF_PING_MINUTES=10
   ```
3. Open `config.js` and edit the public-facing fields — price, discount,
   author name, FAQs, etc. (Every field marked `[CONFIRM]` needs a real
   value from you before launch — see the note at the top of the file.)
4. **Replace the placeholder reviews** in `config.js` → `REVIEWS` with real
   feedback before you launch (see README.md for why this matters).

### Test locally (optional but recommended)
```bash
npm install
npm start
```
Visit `http://localhost:3000`. Use one of [Razorpay's test cards/UPI IDs]
(dashboard.razorpay.com → Docs → Test Card/UPI details, while in Test Mode)
to run a full test purchase end-to-end, and confirm a row appears in your
Google Sheet with a Token and an ExpiresAt timestamp.

---

## STEP 5 — Push to GitHub

Render deploys from a GitHub repo.

1. Create a new repo on GitHub (private is fine).
2. **Do not commit your `.env` file** — it's already listed in the
   `.gitignore` below; double check it's ignored.
3. Push this whole project folder to that repo.

```bash
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## STEP 6 — Deploy to Render (free)

1. Go to [render.com](https://render.com) → sign up/log in (GitHub login is easiest).
2. **New → Web Service** → connect your GitHub repo.
3. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Under **Environment Variables**, add every value from your `.env` file
   one by one (Render does not read your local `.env` file — you re-enter
   them here in the dashboard). Set `SITE_URL` to a placeholder for now —
   you'll fix it in the next step once Render gives you the real URL.
5. Click **Create Web Service**. Wait for the build/deploy to finish (a
   few minutes).
6. Render gives you a live URL like `https://your-app-name.onrender.com`.

### Now go back and fix the URL everywhere it appears:
- In Render's **Environment Variables**, update `SITE_URL` to the real
  Render URL and save (this triggers a redeploy) — this is what powers the
  self-ping keep-alive in Step 6A.
- In `config.js` → `SITE_URL`, put the same real Render URL, commit, and
  push again.
- In your Google Apps Script `CONFIG.SITE_URL` (Step 1), update it to the
  same URL, save, and **Deploy → Manage deployments → Edit → New version**
  so the change takes effect (this is what the backup confirmation email
  uses to build the download link).

**Note on Render's free tier:** the free instance "sleeps" after 15 minutes
of no traffic and takes ~30–60 seconds to wake up on the next visit. See
**Step 6A below** — this project has a *built-in* self-ping fix for this,
plus an optional external monitor as a backstop. Set both up before you
share your link publicly. A buyer who clicks "Buy Now" and stares at a
blank tab for a minute is a buyer who leaves.

---

## STEP 6A — Keep the server warm (do this before launch)

Render sleeps a free instance after 15 minutes with **zero incoming
traffic**. This project handles that two ways — use both, they're
complementary, not either/or:

### 1. Built-in self-ping (already running — just confirm it's on)

`server.js` pings its own `${SITE_URL}/health` route every
`SELF_PING_MINUTES` (10 by default) once it's running. As long as the
process is alive, it keeps itself warm with zero extra setup — just make
sure `SITE_URL` is set to your real Render URL in the environment variables
(Step 6), or the self-ping has nothing to ping and logs a warning instead
of running.

Check your Render service's **Logs** tab a few minutes after deploy — you
should see lines like `[self-ping] enabled — pinging https://your-app.onrender.com/health every 10 min`.

**What self-ping can't do:** if Render restarts, redeploys, or the process
itself crashes, there's nothing running to *send* the ping — it can only
keep an already-warm instance warm, not revive a dead one or alert you.
That's what the external monitor below is for.

### 2. External monitor as a backstop (free, 5 minutes, recommended)

1. Go to [uptimerobot.com](https://uptimerobot.com) → create a free account
   (no card required — free plan allows 50 monitors, checking every 5 minutes).
2. Click **+ Add New Monitor**.
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** New City Kitchen — Keep Alive
   - **URL:** `https://your-app-name.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
3. Save. That's it.

This also emails you if the site ever actually goes down — monitoring you
don't get from self-ping alone. **Alternative (also free):**
[cron-job.org](https://cron-job.org) works the same way.

---

## ALTERNATIVE TO STEP 6 — Deploy to Koyeb instead (better free tier)

If you'd rather skip Render's sleep behavior entirely, Koyeb is a very
close alternative — same Node/Express code, no rewrite needed — with a
much shorter cold start (1–5 seconds instead of 30–60) even without a
keep-alive ping, and no credit card required. The built-in self-ping in
`server.js` still works the same way on Koyeb — just point `SITE_URL` at
your Koyeb URL instead.

### Deploy

1. Go to [koyeb.com](https://www.koyeb.com) → sign up free (GitHub login
   works, no card needed).
2. Click **Create Web Service** → **GitHub** → select your repo.
3. Settings:
   - **Builder:** Buildpack (Koyeb auto-detects Node.js from `package.json`)
   - **Run Command:** leave default (it reads `npm start` automatically)
   - **Port:** `3000` (must match the `PORT` value in your `.env`)
   - **Instance:** Free (Nano — 512MB RAM, 1 vCPU)
   - **Region:** Frankfurt or Washington, D.C. (only two available on free tier — pick whichever routes better to India for you; test both if unsure)
4. Under **Environment Variables**, add every value from your `.env` file,
   exactly like you did for Render — including `SITE_URL` set to your Koyeb
   URL once you have it.
5. Click **Deploy**. Koyeb gives you a live URL like
   `https://your-app-name.koyeb.app`.
6. Same as with Render — update `SITE_URL` in Render's/Koyeb's env vars,
   `config.js`, and your Google Apps Script `CONFIG.SITE_URL` to this new
   Koyeb URL, then push / redeploy the Apps Script.

Koyeb's free tier scales to zero after **1 hour** of no traffic (much more
forgiving than Render's 15 minutes) — the built-in self-ping alone is
generally enough here without an external monitor, though pairing it with
one (interval 30 minutes) costs nothing and adds down-alerting.

---

## STEP 7 — Full end-to-end test

1. Visit your live Render URL.
2. Make a real purchase using Razorpay's **Test Mode** (a test card or test
   UPI ID — see Razorpay's docs while `RAZORPAY_KEY_ID` is a `rzp_test_...` key).
3. Confirm:
   - You land on `/thankyou.html` with a working download button
   - The file downloads correctly
   - Clicking the same link again shows "already used"
   - Waiting past `DOWNLOAD_EXPIRY_HOURS` (or temporarily setting it to a
     small number like `0.01` for a quick test) shows "link expired"
   - A new row appeared in your Google Sheet with Token/ExpiresAt filled in
   - You received the backup email (check spam folder too)

---

## STEP 8 — Go live

1. Complete Razorpay KYC if you haven't, switch to **Live Mode**, generate
   live API keys, and swap them into Render's environment variables
   (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`).
2. Add your real images (`IMAGE_PROMPTS.md`) and video (`VIDEO_PROMPT.md`)
   into `public/images/` and `public/videos/`, commit, push.
3. Replace the placeholder reviews in `config.js`.
4. Set your real `COUNTDOWN_END_ISO` date if using the discount timer.
5. Do one final **real**, small-amount test purchase yourself if you can,
   to confirm live mode works end to end, then you're ready to share the link.

---

## Optional: custom domain
Render supports free custom domains on the free tier — under your service
→ **Settings → Custom Domains**, add your domain and point its DNS per
Render's instructions. This just changes the URL people see; remember to
update `SITE_URL` in the environment variables, `config.js`, and `Code.gs`
again if you do this.

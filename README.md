# The New City Kitchen — Landing Page System

This is a complete, self-hosted sales system: landing page + Razorpay
checkout + a one-time, time-limited download link + buyer mailing list,
built to run **free** on Render (Node.js web service) with **Google
Sheets** as your database. Built for an India-based launch — INR pricing,
Razorpay (cards, UPI, netbanking, wallets), and a self-pinging server so
the free Render tier doesn't cold-start on a real buyer.

## What's in this project

```
landing/
├── server.js                 Node/Express backend (Razorpay + download logic + self-ping)
├── package.json
├── .env.example               Copy to .env — put your real secrets here
├── config.js                  Public settings (price, discount, copy) — edit this freely
├── public/
│   ├── index.html              The landing page
│   ├── thankyou.html           Post-payment page with the download button
│   ├── css/style.css
│   ├── js/main.js              Landing page interactivity + Razorpay Checkout
│   ├── js/thankyou.js          Download-link logic (valid / used / expired / invalid)
│   └── images/                 Drop your generated images here (see IMAGE_PROMPTS.md)
├── apps-script/Code.gs         Paste into Google Apps Script — this IS your database
├── IMAGE_PROMPTS.md            Every image the page needs, with generation prompts
├── VIDEO_PROMPT.md             UGC-style video script + generation prompt
└── DEPLOY.md                   Step-by-step: Google Sheet → Razorpay → Render
```

## How the download link protection works

Every purchased link is protected two ways at once, both enforced
server-side against the Google Sheet (never trust the browser):

1. **One-time use** — the moment `/download/:token` is hit successfully,
   the Sheet's `Used` column flips to `TRUE` and every later request for
   that token is rejected.
2. **Time-limited** — every token also gets an `ExpiresAt` timestamp
   (`DOWNLOAD_EXPIRY_HOURS` in `.env`, 48 hours by default) set at purchase
   time. A request after that window is rejected even if the link was
   never used.

The thank-you page shows a distinct message for each failure mode (used,
expired, or invalid) instead of a generic error.

## Honest things you should know before you launch

1. **On reviews:** The reviews section is built, but not filled with fake
   five-star reviews attributed to invented customers — that's deceptive
   advertising and the kind of thing that gets payment accounts flagged
   once discovered. It ships with clearly marked placeholders. Fill it with
   **real** feedback from beta readers, ARC reviewers, or early buyers —
   even 3–4 genuine ones outperform ten fake ones.

2. **On the "UGC video":** Written as an authentic **author welcome/intro
   video** (phone camera, talking to camera) rather than a fake "customer
   testimonial," for the same reason as above.

3. **On download protection:** The link genuinely can't be reused after
   its first successful download, and genuinely stops working after the
   expiry window — both enforced server-side via the Google Sheet, not just
   hidden in the frontend. What it *can't* do is stop someone from
   re-sharing the file itself after downloading it — no low-cost system
   can. This is standard for indie ebook sales; don't oversell it as
   piracy-proof in your marketing.

4. **On "No Return Policy":** Digital goods are normally sold as
   all-sales-final, and the footer says so. Razorpay itself doesn't run a
   PayPal-style buyer-initiated dispute system the same way, but cardholder
   chargebacks through the issuing bank are still possible regardless of
   your stated policy — stating the policy clearly is still the right
   move, it just isn't a legal shield against a chargeback.

5. **On pricing:** `ORIGINAL_PRICE`/`SALE_PRICE` in `config.js` (₹399/₹199)
   reflect a quick market check for the students+young-professionals
   audience specifically — Indian students tend to balk at ₹299–499 but pay
   ₹149–199 more readily, so pricing splits the difference for the dual
   audience. This is a starting hypothesis, not full Phase 4 research (real
   competitor-title benchmarking on Amazon.in, direct-sale platform
   comparables, and a proper cost/margin pass haven't run yet) — treat it as
   a placeholder to confirm, not final pricing.

Everything else below is ready to configure and deploy — see `DEPLOY.md`.

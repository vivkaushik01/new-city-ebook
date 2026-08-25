// ============================================================================
// SERVER.JS — the whole backend lives here. Sections are labeled so you can
// find things fast:
//   1. Setup
//   2. Public config endpoint (feeds main.js)
//   3. Razorpay helpers (create order, verify signature)
//   4. POST /api/create-order      — called when buyer clicks "Buy Now"
//   5. POST /api/verify-payment    — called after Razorpay Checkout succeeds
//   6. GET  /api/check-download    — thankyou.html polls this
//   7. GET  /download/:token       — the actual download, one-time + time-limited
//   8. Self-ping keep-alive        — stops Render's free tier from sleeping
// ============================================================================

require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const Razorpay = require("razorpay");
const publicConfig = require("./config");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  GOOGLE_SHEET_WEBAPP_URL,
  BOOK_FILE_ID,
  PORT,
  SITE_URL,
  DOWNLOAD_EXPIRY_HOURS, // how long a token stays valid after purchase
  SELF_PING_MINUTES,     // how often the server pings its own /health route
} = process.env;

const EXPIRY_HOURS = Number(DOWNLOAD_EXPIRY_HOURS) > 0 ? Number(DOWNLOAD_EXPIRY_HOURS) : 48;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// ============================================================================
// HEALTH CHECK — hit by the self-ping loop below (and/or an external monitor
// like UptimeRobot) so the free-tier instance never gets a chance to sleep.
// ============================================================================
app.get("/health", (req, res) => res.status(200).send("OK"));

// ============================================================================
// 2. PUBLIC CONFIG — main.js fetches this on page load to render prices/copy.
//    Only non-secret fields from config.js are exposed here, plus the
//    Razorpay Key ID (key IDs are meant to be public; the SECRET never is).
// ============================================================================
app.get("/api/config", (req, res) => {
  res.json({
    ...publicConfig,
    RAZORPAY_KEY_ID, // safe to expose — required by Razorpay Checkout.js
  });
});

// ============================================================================
// 4. CREATE ORDER — buyer clicked "Buy Now". We create the order SERVER-SIDE
//    (never trust a price sent from the browser) using the price in config.js.
//    Razorpay amounts are in the smallest currency subunit — paise for INR.
// ============================================================================
app.post("/api/create-order", async (req, res) => {
  try {
    const amountRupees = publicConfig.DISCOUNT_ACTIVE
      ? publicConfig.SALE_PRICE
      : publicConfig.ORIGINAL_PRICE;
    const amountPaise = Math.round(amountRupees * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: publicConfig.CURRENCY, // "INR"
      receipt: `order_rcpt_${Date.now()}`,
      notes: { book: publicConfig.BOOK_TITLE },
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("create-order error:", err.message);
    res.status(500).json({ error: "Could not create Razorpay order." });
  }
});

// ============================================================================
// 5. VERIFY PAYMENT — Razorpay Checkout returns (razorpay_order_id,
//    razorpay_payment_id, razorpay_signature) to the browser after a
//    successful payment. We NEVER trust that on its own — we recompute the
//    HMAC-SHA256 signature server-side with our key_secret and compare.
//    Only after that matches do we:
//      a) generate a random one-time, time-limited download token
//      b) log the buyer + token + expiry to your Google Sheet
//      c) return the token to the browser, which redirects to /thankyou.html?token=...
// ============================================================================
app.post("/api/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      buyerName,
      buyerEmail,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(String(razorpay_signature), "utf8");
    // timingSafeEqual throws on mismatched lengths rather than returning
    // false — a malformed/short signature must fail closed, not crash.
    const isAuthentic =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isAuthentic) {
      console.error("Signature mismatch — possible tampering:", razorpay_order_id);
      return res.status(400).json({ error: "Payment verification failed." });
    }

    // Double-check the actual charge with Razorpay itself (belt & braces —
    // confirms the order wasn't captured for a different amount).
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return res.status(400).json({ error: "Payment was not completed." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 3600 * 1000).toISOString();

    await logToSheet({
      action: "log_buyer",
      timestamp: new Date().toISOString(),
      name: buyerName || "",
      email: buyerEmail || "",
      orderID: razorpay_order_id,
      paymentID: razorpay_payment_id,
      amountPaid: payment.amount ? (payment.amount / 100).toFixed(2) : "",
      token,
      expiresAt,
      used: "FALSE",
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error("verify-payment error:", err.message);
    res.status(500).json({ error: "Could not verify Razorpay payment." });
  }
});

// ============================================================================
// 6. CHECK DOWNLOAD STATUS — thankyou.html calls this to show a friendly
//    "link already used" / "link expired" message instead of failing silently.
// ============================================================================
app.get("/api/check-download", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ valid: false });
    const result = await checkTokenInSheet(token);
    res.json(result); // { valid, used, expired }
  } catch (err) {
    console.error("check-download error:", err.message);
    res.status(500).json({ valid: false });
  }
});

// ============================================================================
// 7. DOWNLOAD — the one-time, time-limited link itself. Validates the token
//    against the Google Sheet (both "already used" AND "past its expiry
//    window" are checked), marks it used, then redirects to the actual file.
//    Because the real Google Drive file ID lives only in .env, buyers never
//    see it directly in the page source.
// ============================================================================
app.get("/download/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const status = await checkTokenInSheet(token);

    if (!status.valid) {
      return res.status(404).send(expiredPage("This download link isn't valid."));
    }
    if (status.used) {
      return res.status(410).send(expiredPage("This download link has already been used."));
    }
    if (status.expired) {
      return res
        .status(410)
        .send(expiredPage(`This download link has expired (links are valid for ${EXPIRY_HOURS} hours).`));
    }

    await logToSheet({ action: "mark_used", token });

    const directUrl = `https://drive.google.com/uc?export=download&id=${BOOK_FILE_ID}`;
    res.redirect(directUrl);
  } catch (err) {
    console.error("download error:", err.message);
    res.status(500).send(expiredPage("Something went wrong. Please contact support."));
  }
});

function expiredPage(message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link unavailable</title>
  <style>body{font-family:Georgia,serif;background:#FBF6EE;color:#2B2420;text-align:center;padding:80px 20px}
  h1{color:#8A5A34}a{color:#8A5A34}</style></head><body>
  <h1>⚠ ${message}</h1>
  <p>Each download link can only be used once and expires after ${EXPIRY_HOURS} hours. If you believe this is
  an error, please contact <a href="mailto:${publicConfig.SUPPORT_EMAIL}">${publicConfig.SUPPORT_EMAIL}</a>
  with your Razorpay payment ID.</p></body></html>`;
}

// ============================================================================
// GOOGLE SHEET HELPERS — every read/write goes through your Apps Script Web
// App (see apps-script/Code.gs). The sheet IS the database.
// ============================================================================
async function logToSheet(payload) {
  if (!GOOGLE_SHEET_WEBAPP_URL) {
    console.warn("GOOGLE_SHEET_WEBAPP_URL not set — skipping sheet log.");
    return;
  }
  await fetch(GOOGLE_SHEET_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function checkTokenInSheet(token) {
  if (!GOOGLE_SHEET_WEBAPP_URL) return { valid: false, used: false, expired: false };
  const resp = await fetch(
    `${GOOGLE_SHEET_WEBAPP_URL}?action=check_token&token=${encodeURIComponent(token)}`
  );
  return resp.json(); // { valid, used, expired }
}

// ============================================================================
// 8. SELF-PING KEEP-ALIVE — Render's free tier sleeps a web service after 15
//    minutes with zero incoming traffic. Rather than depending only on an
//    external monitor, the server pings its own /health route on an interval
//    shorter than the sleep window, so it keeps itself warm as long as it's
//    already running. This only helps once the service is awake and does NOT
//    replace an external monitor (Render can still restart/redeploy the
//    service, which an external ping would recover from but a pure
//    self-ping can't if the process itself is down) — see DEPLOY.md for
//    pairing this with a free UptimeRobot/cron-job.org monitor as a backstop.
// ============================================================================
function startSelfPing() {
  const url = SITE_URL && SITE_URL.startsWith("http") ? `${SITE_URL}/health` : null;
  const minutes = Number(SELF_PING_MINUTES) > 0 ? Number(SELF_PING_MINUTES) : 10;

  if (!url) {
    console.warn("SITE_URL not set — self-ping keep-alive disabled. Set SITE_URL to your live Render URL.");
    return;
  }

  setInterval(async () => {
    try {
      await fetch(url);
      console.log(`[self-ping] pinged ${url}`);
    } catch (err) {
      console.warn(`[self-ping] failed: ${err.message}`);
    }
  }, minutes * 60 * 1000);

  console.log(`[self-ping] enabled — pinging ${url} every ${minutes} min`);
}

// ============================================================================
app.listen(PORT || 3000, () => {
  console.log(`Server running on port ${PORT || 3000}`);
  startSelfPing();
});

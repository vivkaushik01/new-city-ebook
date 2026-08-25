// ============================================================================
// PUBLIC CONFIG — safe to edit freely. Nothing in this file is secret.
// Secrets (Razorpay key secret, Apps Script URL) go in .env instead — see
// .env.example. This file is read by server.js and exposed to the browser
// via GET /api/config, so main.js can render prices/copy without a rebuild.
//
// Fields marked [CONFIRM] are placeholders pulled or inferred from the
// sample manuscript — check these against the real, final book before
// launch. Pricing especially: no Phase 4 (KDP royalty math + competitor
// benchmarking) has run yet for this book, so ORIGINAL_PRICE/SALE_PRICE
// below are a reasonable India-market starting guess, not researched numbers.
//
// DOWNLOAD_LINK_HOURS below must match DOWNLOAD_EXPIRY_HOURS in your .env —
// it's only used to word the FAQ answer, so keep the two in sync by hand.
// ============================================================================

const DOWNLOAD_LINK_HOURS = 48;

module.exports = {
  // ---------- Book & brand ----------
  BOOK_TITLE: "The New City Kitchen",
  BOOK_SUBTITLE: "125+ Budget Recipes, Smart Buying Charts & a Zero-Waste Kitchen System for Students & Young Professionals",
  AUTHOR_NAME: "Sonia Kaushik",
  AUTHOR_TITLE: "Author — A Mother's Tested Kitchen System, Proven Over Six Years", // [CONFIRM] wording
  SITE_URL: "https://your-app-name.onrender.com",     // <-- set after first deploy
  SUPPORT_EMAIL: "support@yourdomain.com",              // [CONFIRM] <-- shown in footer & FAQs
  COMPANY_NAME: "Sonia Kaushik",                       // [CONFIRM] <-- for copyright line

  // ---------- Pricing ----------
  // [CONFIRM] Research note: for a students+young-professionals audience in
  // India specifically, ₹299–499 tends to be a stretch for students, while
  // ₹149–199 clears more easily (source: Digital Publishing in India 2025
  // guide). Set below to split the difference for the dual audience —
  // reconsider if you learn your buyers skew heavily student vs. professional.
  CURRENCY: "INR",
  ORIGINAL_PRICE: 399,          // [CONFIRM] shown struck-through — whole rupees
  SALE_PRICE: 199,               // [CONFIRM] the real charge amount
  DISCOUNT_ACTIVE: true,
  DISCOUNT_LABEL: "Launch Week Price — 50% Off",

  // Optional countdown banner (set COUNTDOWN_ACTIVE:false to hide it entirely)
  COUNTDOWN_ACTIVE: true,
  COUNTDOWN_END_ISO: "2026-09-08T23:59:59+05:30", // [CONFIRM] IST offset

  // ---------- What buyers get (rendered as the feature grid) ----------
  DELIVERABLES: [
    { icon: "🛒", title: "Daily, Weekly & Monthly Buying Charts", text: "Exact charts for what to buy and when, so you stop over-shopping and under-eating." },
    { icon: "🍲", title: "125+ Budget Recipes", text: "Rice, roti, dal, breakfasts under 10 minutes, and 15-minute emergency meals for long days." },
    { icon: "📦", title: "The FIFO Inventory System", text: "A first-in-first-out method that stops food from rotting in the back of your fridge." },
    { icon: "🍳", title: "The Indian Pantry, Decoded", text: "What to actually stock in a new city kitchen — no guessing, no waste." },
    { icon: "💸", title: "Real Budgeting Tools", text: "Practical charts for eating well on a student or first-job budget, including splitting costs with roommates." },
    { icon: "📄", title: "Instant Digital Download", text: "Read on any device, keep it forever." },
  ],

  // ---------- Hero section ----------
  HERO_EYEBROW: "FOR STUDENTS & YOUNG PROFESSIONALS COOKING FOR THE FIRST TIME",
  HERO_HEADLINE: "A Kitchen System That Finally Feels Like Home.",

  // ---------- "Problem / Empathy" section ----------
  PROBLEM_HEADLINE: "You Moved Out. Your Fridge Didn't Come With Instructions.",
  PROBLEM_PARAGRAPH_1: "New city, new job or college, and a kitchen you don't know how to run. You over-buy vegetables that rot by Thursday, under-buy dal, and end up ordering in — again — because cooking after a long day feels like one more exam you didn't study for.",
  PROBLEM_PARAGRAPH_2: "It doesn't have to be this way. This book turns six real years of one mother's tested system — buying charts, a FIFO inventory method, and 125+ genuinely simple recipes — into a system you can run from week one.",

  // ---------- "Everything Inside" section intro ----------
  CONTENTS_INTRO: "Five parts, front to back: getting your kitchen and pantry sorted, a buying-and-inventory system that stops waste before it starts, everyday cooking that's actually simple, real skills like rice-roti-dal, and how to live the system long-term — budgeting, roommates, and festivals away from home.",

  // ---------- Author quote ----------
  AUTHOR_QUOTE: "Six years ago I stood in a small rented room in Bengaluru with a brand-new pressure cooker still in its box and a son who didn't know the difference between a kadhai and a tawa. This book is the system we built that week — tested, refined, and proven over six real years.", // [CONFIRM] pulled from manuscript's opening

  // ---------- Medical/legal/financial disclaimer ----------
  DISCLAIMER_TEXT: "This book is intended for informational and educational purposes only and is not a substitute for professional nutritional or medical advice. Please consult a qualified healthcare provider with any questions about your individual dietary needs.",

  // ---------- "What's Actually Inside" contents list ----------
  CONTENTS_LIST: [
    { label: "Part One — Landing on Your Feet", text: "Your minimum viable kitchen, nutrition basics, and the Indian pantry decoded." },
    { label: "Part Two — The Buying & Inventory System", text: "The FIFO method plus daily, weekly, and monthly buying charts and a minimum inventory list." },
    { label: "Part Three — Everyday Cooking, Actually Simple", text: "Breakfast in under 10 minutes, carry-or-cook-fast lunches, dinners, and 15-minute emergency meals." },
    { label: "Part Four — Building Real Skills", text: "Rice, roti, dal, the pressure cooker, protein on a budget, and snacks." },
    { label: "Part Five & Appendix — Living the System", text: "Budgeting, splitting costs with roommates, festivals away from home, kitchen hygiene, and a fillable toolkit." },
  ],

  // ---------- FAQs ----------
  FAQS: [
    { q: "What format do I get?", a: "An instant-access PDF you can read on your phone, tablet, laptop, or print at home. It's yours to keep forever." },
    { q: "Is this a subscription?", a: "No. This is a one-time purchase. You pay once and own it — no recurring charges, ever." },
    { q: "I've never cooked before — is this really for beginners?", a: "Yes. It's written for exactly that first week in a new city, with charts and step-by-step systems instead of assuming you already know your way around a kitchen." },
    { q: "Does this include a refund or return policy?", a: "Because this is an instant-access digital product, all sales are final once the download link has been issued. Please see the full policy in the footer before purchasing." },
    { q: "Is this specific to Indian kitchens and ingredients?", a: "Yes — the pantry list, buying charts, and recipes are built around what's actually available in Indian grocery stores and kitchens, not adapted from a Western cookbook." },
    { q: "How is my download link protected?", a: `Your download link is personal to your order, works once, and expires ${DOWNLOAD_LINK_HOURS} hours after purchase, so please save the file to your device as soon as you download it.` },
  ],

  // ---------- Reviews — REPLACE with real reader feedback before launch ----------
  REVIEWS: [
    { name: "[Beta Reader Name]", detail: "[e.g. First-year MBA student, Pune]", quote: "[Insert a genuine quote from an early/ARC reader here before launch.]", rating: 5 },
    { name: "[Beta Reader Name]", detail: "[...]", quote: "[...]", rating: 5 },
    { name: "[Beta Reader Name]", detail: "[...]", quote: "[...]", rating: 5 },
  ],
};

// ============================================================================
// main.js — fetches /api/config, renders every dynamic piece of the page,
// runs the countdown timer, and wires up the Razorpay Checkout button.
// ============================================================================

let CONFIG = null;

async function init() {
  const resp = await fetch("/api/config");
  CONFIG = await resp.json();

  renderText();
  renderPrices();
  renderDeliverables();
  renderContentsList();
  renderReviews();
  renderFAQs();
  setupCountdown();
  loadRazorpaySDK();
  setupFAQToggle();
}

// ---------- basic text fields (author name/title appear in several spots) ----------
function renderText() {
  document.title = `${CONFIG.BOOK_TITLE} — ${CONFIG.BOOK_SUBTITLE}`;
  document.getElementById("page-title").textContent = document.title;
  document.getElementById("meta-description").setAttribute("content", CONFIG.BOOK_SUBTITLE);
  document.getElementById("og-title").setAttribute("content", CONFIG.BOOK_TITLE);
  document.getElementById("og-description").setAttribute("content", CONFIG.BOOK_SUBTITLE);

  setAll("#logo-title, #footer-title", CONFIG.BOOK_TITLE);
  setAll("#hero-eyebrow", CONFIG.HERO_EYEBROW);
  setAll("#hero-headline", CONFIG.HERO_HEADLINE);
  setAll("#hero-subtitle", CONFIG.BOOK_SUBTITLE);
  setAll("#author-name-hero, #author-name-section, #author-name-section2, #author-name-footer", CONFIG.AUTHOR_NAME);
  setAll("#author-title-hero, #author-title-section", CONFIG.AUTHOR_TITLE);
  setAll("#company-name-footer", CONFIG.COMPANY_NAME);
  setAll("#copyright-year", new Date().getFullYear());

  setAll("#problem-headline", CONFIG.PROBLEM_HEADLINE);
  setAll("#problem-paragraph-1", CONFIG.PROBLEM_PARAGRAPH_1);
  setAll("#problem-paragraph-2", CONFIG.PROBLEM_PARAGRAPH_2);

  setAll("#whats-inside-title", `Everything Inside ${CONFIG.BOOK_TITLE}`);
  setAll("#contents-intro", CONFIG.CONTENTS_INTRO);
  setAll("#author-quote", CONFIG.AUTHOR_QUOTE);
  setAll("#buy-heading", `Get Your Copy of ${CONFIG.BOOK_TITLE}`);

  // Disclaimer line: hide entirely if the niche doesn't need one
  const disclaimerLine = document.getElementById("disclaimer-line");
  if (CONFIG.DISCLAIMER_TEXT && CONFIG.DISCLAIMER_TEXT.trim()) {
    document.getElementById("disclaimer-text").textContent = CONFIG.DISCLAIMER_TEXT;
    disclaimerLine.hidden = false;
  } else {
    disclaimerLine.hidden = true;
  }

  const supportLink = document.getElementById("support-email-link");
  if (supportLink) {
    supportLink.textContent = CONFIG.SUPPORT_EMAIL;
    supportLink.href = `mailto:${CONFIG.SUPPORT_EMAIL}`;
  }
}

function setAll(selector, value) {
  document.querySelectorAll(selector).forEach((el) => (el.textContent = value));
}

// ---------- "What's Actually Inside" contents list ----------
function renderContentsList() {
  const list = document.getElementById("contents-list");
  if (!list || !CONFIG.CONTENTS_LIST) return;
  list.innerHTML = CONFIG.CONTENTS_LIST.map(
    (item) => `<li><strong>${item.label}:</strong> ${item.text}</li>`
  ).join("");
}

// ---------- pricing (rendered in both hero and buy-section) ----------
// India-locale formatting: ₹ symbol before the number, no decimals for
// whole-rupee prices, comma grouping via Intl (handles lakh-style grouping
// correctly, e.g. ₹1,299 not ₹1299).
function fmt(n) {
  const value = Number(n);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
  return `₹${formatted}`;
}

function renderPrices() {
  ["price-sale", "price-sale-2"].forEach((id) => {
    document.getElementById(id).textContent = fmt(
      CONFIG.DISCOUNT_ACTIVE ? CONFIG.SALE_PRICE : CONFIG.ORIGINAL_PRICE
    );
  });

  ["price-original", "price-original-2"].forEach((id) => {
    const el = document.getElementById(id);
    if (CONFIG.DISCOUNT_ACTIVE) {
      el.textContent = fmt(CONFIG.ORIGINAL_PRICE);
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  ["discount-badge", "discount-badge-2"].forEach((id) => {
    const el = document.getElementById(id);
    if (CONFIG.DISCOUNT_ACTIVE) {
      el.textContent = CONFIG.DISCOUNT_LABEL;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
}

// ---------- feature grid ("What You Get") ----------
function renderDeliverables() {
  const grid = document.getElementById("deliverables-grid");
  grid.innerHTML = CONFIG.DELIVERABLES.map(
    (d) => `
    <div class="feature-card">
      <span class="icon">${d.icon}</span>
      <h3>${d.title}</h3>
      <p>${d.text}</p>
    </div>`
  ).join("");
}

// ---------- reviews ----------
function renderReviews() {
  const grid = document.getElementById("reviews-grid");
  grid.innerHTML = CONFIG.REVIEWS.map(
    (r) => `
    <div class="review-card">
      <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="review-quote">"${r.quote}"</p>
      <p class="review-name">${r.name}</p>
      <p class="review-detail">${r.detail}</p>
    </div>`
  ).join("");
}

// ---------- FAQ ----------
function renderFAQs() {
  const list = document.getElementById("faq-list");
  list.innerHTML = CONFIG.FAQS.map(
    (f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-question" data-target="faq-${i}">
        ${f.q} <span class="faq-toggle-icon">+</span>
      </button>
      <div class="faq-answer"><p>${f.a}</p></div>
    </div>`
  ).join("");
}

function setupFAQToggle() {
  document.getElementById("faq-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-question");
    if (!btn) return;
    document.getElementById(btn.dataset.target).classList.toggle("open");
  });
}

// ---------- countdown ----------
function setupCountdown() {
  if (!CONFIG.COUNTDOWN_ACTIVE) return;
  const bar = document.getElementById("countdown-bar");
  const end = new Date(CONFIG.COUNTDOWN_END_ISO).getTime();
  if (isNaN(end)) return;

  document.getElementById("countdown-label").textContent = CONFIG.DISCOUNT_LABEL + " ends in:";
  bar.hidden = false;

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) {
      bar.hidden = true;
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById("cd-days").textContent = String(d).padStart(2, "0");
    document.getElementById("cd-hours").textContent = String(h).padStart(2, "0");
    document.getElementById("cd-mins").textContent = String(m).padStart(2, "0");
    document.getElementById("cd-secs").textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- Razorpay ----------
function loadRazorpaySDK() {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = wireBuyButton;
  script.onerror = () => showStatus("Could not load Razorpay. Please refresh the page.", "error");
  document.body.appendChild(script);
}

function wireBuyButton() {
  const btn = document.getElementById("razorpay-buy-btn");
  btn.disabled = false;
  btn.addEventListener("click", startCheckout);
}

async function startCheckout() {
  const { valid, buyerName, buyerEmail } = validateBuyerForm();
  if (!valid) {
    showStatus("Please enter your name and email before checking out.", "error");
    return;
  }

  const btn = document.getElementById("razorpay-buy-btn");
  btn.disabled = true;
  showStatus("Creating your order…", "");

  try {
    // Order is created SERVER-SIDE using the price from config.js — the
    // browser never gets to dictate the amount charged.
    const orderResp = await fetch("/api/create-order", { method: "POST" });
    const order = await orderResp.json();
    if (!orderResp.ok) throw new Error(order.error || "Could not create order");

    const options = {
      key: CONFIG.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: CONFIG.BOOK_TITLE,
      description: `Purchase: ${CONFIG.BOOK_TITLE}`,
      order_id: order.orderId,
      prefill: { name: buyerName, email: buyerEmail },
      theme: { color: "#8A5A34" },

      handler: async function (response) {
        // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        showStatus("Confirming your payment…", "");
        try {
          const verifyResp = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, buyerName, buyerEmail }),
          });
          const result = await verifyResp.json();
          if (!verifyResp.ok || !result.success) {
            showStatus("Payment could not be confirmed. Please contact support.", "error");
            btn.disabled = false;
            return;
          }
          window.location.href = `/thankyou.html?token=${result.token}`;
        } catch (err) {
          console.error(err);
          showStatus("Payment succeeded but confirmation failed — please contact support with your payment ID.", "error");
        }
      },

      modal: {
        ondismiss: function () {
          showStatus("Checkout cancelled.", "");
          btn.disabled = false;
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      console.error(resp.error);
      showStatus("Payment failed. Please try again or use a different method.", "error");
      btn.disabled = false;
    });
    rzp.open();
  } catch (err) {
    console.error(err);
    showStatus("Something went wrong starting checkout. Please try again.", "error");
    btn.disabled = false;
  }
}

function validateBuyerForm() {
  const buyerName = document.getElementById("buyerName").value.trim();
  const buyerEmail = document.getElementById("buyerEmail").value.trim();
  const emailOk = /\S+@\S+\.\S+/.test(buyerEmail);
  return { valid: buyerName.length > 0 && emailOk, buyerName, buyerEmail };
}

function showStatus(message, type) {
  const el = document.getElementById("payment-status");
  el.textContent = message;
  el.className = `payment-status ${type}`;
  el.hidden = false;
}

init();

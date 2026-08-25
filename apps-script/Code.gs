/**
 * ============================================================================
 * THE NEW CITY KITCHEN — Buyer Database & Download-Token Store
 * ============================================================================
 * HOW TO INSTALL (see DEPLOY.md for full walkthrough):
 *   1. Create a new Google Sheet. Name row 1 exactly:
 *        Timestamp | Name | Email | OrderID | PaymentID | AmountPaid | Token | ExpiresAt | Used
 *   2. In that Sheet: Extensions > Apps Script
 *   3. Delete the placeholder code, paste this whole file in.
 *   4. Edit the CONFIG block right below to match your book.
 *   5. Deploy > New deployment > type: Web app
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   6. Copy the Web App URL into your .env as GOOGLE_SHEET_WEBAPP_URL
 *
 * This single script IS your buyer mailing list (the Sheet) and also emails
 * every buyer their download link automatically, for free, as a backup to
 * the Thank You page.
 * ============================================================================
 */

const CONFIG = {
  SHEET_NAME: "Sheet1",                              // must match your tab name
  SITE_URL: "https://your-app-name.onrender.com",      // <-- same as config.js / server .env SITE_URL
  BOOK_TITLE: "The New City Kitchen",
  FROM_NAME: "Madhurima Singh",
  SUPPORT_EMAIL: "support@yourdomain.com",
  SEND_CONFIRMATION_EMAIL: true,                        // set false to disable the free email backup
};

// Column indices (1-indexed) — must match the header row exactly.
const COL = {
  TIMESTAMP: 1,
  NAME: 2,
  EMAIL: 3,
  ORDER_ID: 4,
  PAYMENT_ID: 5,
  AMOUNT_PAID: 6,
  TOKEN: 7,
  EXPIRES_AT: 8,
  USED: 9,
};

function getSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
}

/**
 * Handles POST requests from server.js:
 *   { action: "log_buyer", timestamp, name, email, orderID, paymentID,
 *     amountPaid, token, expiresAt, used }
 *   { action: "mark_used", token }
 */
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const sheet = getSheet_();

  if (body.action === "log_buyer") {
    sheet.appendRow([
      body.timestamp,
      body.name,
      body.email,
      body.orderID,
      body.paymentID || "",
      body.amountPaid,
      body.token,
      body.expiresAt || "",
      body.used, // "FALSE"
    ]);

    if (CONFIG.SEND_CONFIRMATION_EMAIL && body.email) {
      sendDownloadEmail_(body.email, body.name, body.token, body.expiresAt);
    }

    return jsonResponse_({ success: true });
  }

  if (body.action === "mark_used") {
    const row = findRowByToken_(sheet, body.token);
    if (row) {
      sheet.getRange(row, COL.USED).setValue("TRUE");
    }
    return jsonResponse_({ success: true });
  }

  return jsonResponse_({ success: false, error: "Unknown action" });
}

/**
 * Handles GET requests from server.js:
 *   ?action=check_token&token=xxxx  ->  { valid: bool, used: bool, expired: bool }
 */
function doGet(e) {
  if (e.parameter.action === "check_token") {
    const sheet = getSheet_();
    const row = findRowByToken_(sheet, e.parameter.token);
    if (!row) return jsonResponse_({ valid: false, used: false, expired: false });

    const usedValue = sheet.getRange(row, COL.USED).getValue();
    const used = String(usedValue).toUpperCase() === "TRUE";

    const expiresAtValue = sheet.getRange(row, COL.EXPIRES_AT).getValue();
    const expired = isExpired_(expiresAtValue);

    return jsonResponse_({ valid: true, used, expired });
  }

  return jsonResponse_({ error: "Unknown action" });
}

/** True if the stored ExpiresAt timestamp is in the past. Blank = never checked, treat as not expired. */
function isExpired_(expiresAtValue) {
  if (!expiresAtValue) return false;
  const expiresAt = new Date(expiresAtValue);
  if (isNaN(expiresAt.getTime())) return false;
  return Date.now() > expiresAt.getTime();
}

/** Finds the sheet row (1-indexed) whose Token column matches. */
function findRowByToken_(sheet, token) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][COL.TOKEN - 1] === token) return i + 1; // +1 because sheet rows are 1-indexed
  }
  return null;
}

/** Free backup email via Gmail's built-in MailApp (no API keys needed). */
function sendDownloadEmail_(email, name, token, expiresAt) {
  const downloadUrl = `${CONFIG.SITE_URL}/download/${token}`;
  const expiryNote = expiresAt
    ? `This link expires at ${new Date(expiresAt).toString()}.`
    : "This link expires a limited time after purchase.";
  const subject = `Your download: ${CONFIG.BOOK_TITLE}`;
  const body =
    `Hi ${name || "there"},\n\n` +
    `Thank you for purchasing ${CONFIG.BOOK_TITLE}!\n\n` +
    `Your one-time download link:\n${downloadUrl}\n\n` +
    `IMPORTANT: This link works only once, and ${expiryNote} Please save the file to your ` +
    `device as soon as you download it.\n\n` +
    `Questions? Just reply to this email or contact ${CONFIG.SUPPORT_EMAIL}.\n\n` +
    `— ${CONFIG.FROM_NAME}`;

  try {
    MailApp.sendEmail(email, subject, body);
  } catch (err) {
    // Gmail's free daily send quota (~100/day) may be exceeded on big launch days.
    // The Thank You page download button still works regardless of email success.
    console.error("Email send failed: " + err);
  }
}

/** Small helper to return proper JSON from Apps Script. */
function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

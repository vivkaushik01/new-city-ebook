// ============================================================================
// thankyou.js — reads ?token= from the URL, checks its status with the
// server, and shows the right state (ready to download / already used /
// invalid). The actual file download happens at GET /download/:token,
// which is the ONLY place the token gets marked as used.
// ============================================================================

async function init() {
  const configResp = await fetch("/api/config");
  const config = await configResp.json();
  document
    .querySelectorAll("#ty-support-link, #ty-support-link-2, #ty-support-link-3, #ty-support-link-4")
    .forEach((el) => {
      el.textContent = config.SUPPORT_EMAIL;
      el.href = `mailto:${config.SUPPORT_EMAIL}`;
    });

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const show = (id) => {
    ["ty-loading", "ty-valid", "ty-used", "ty-expired", "ty-invalid"].forEach((x) => {
      document.getElementById(x).hidden = x !== id;
    });
  };

  if (!token) {
    show("ty-invalid");
    return;
  }

  try {
    const resp = await fetch(`/api/check-download?token=${encodeURIComponent(token)}`);
    const status = await resp.json();

    if (!status.valid) {
      show("ty-invalid");
    } else if (status.used) {
      show("ty-used");
    } else if (status.expired) {
      show("ty-expired");
    } else {
      document.getElementById("download-btn").href = `/download/${token}`;
      show("ty-valid");
    }
  } catch (err) {
    console.error(err);
    show("ty-invalid");
  }
}

init();

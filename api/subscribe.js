/**
 * POST /api/subscribe — stores waitlist emails in Supabase (service role, server-only).
 * Env (set in Vercel Project → Settings → Environment Variables):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require("@supabase/supabase-js");

function parseBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on("data", function (c) {
      chunks.push(c);
    });
    req.on("end", function () {
      try {
        var raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function isValidEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (body && String(body._gotcha || "").trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  var emailRaw = body && body.email ? String(body.email) : "";
  var email = emailRaw.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  var url = process.env.SUPABASE_URL;
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(503).json({ error: "Signup is not configured yet. Please try again later." });
  }

  var supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  var page = body.page != null ? String(body.page).slice(0, 2048) : null;
  var formId = "";
  if (body.form_id) {
    formId = String(body.form_id).slice(0, 256);
  } else if (body._subject) {
    formId = String(body._subject).slice(0, 256);
  }

  var row = {
    email: email,
    page: page,
    form_id: formId || null,
  };

  var result = await supabase.from("waitlist").insert(row);

  if (result.error) {
    var code = result.error.code;
    if (code === "23505" || (result.error.message && result.error.message.indexOf("duplicate") !== -1)) {
      return res.status(200).json({ ok: true, duplicate: true });
    }
    console.error("waitlist insert:", result.error);
    return res.status(500).json({ error: "We could not save your email. Please try again." });
  }

  return res.status(200).json({ ok: true });
};

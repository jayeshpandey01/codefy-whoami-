import express from "express";
export const webhooks = express.Router();

// Vulnerable: server fetches an attacker-supplied URL (SSRF)
webhooks.post("/webhooks/test", async (req, res) => {
  const callbackUrl = req.body.callbackUrl;
  const response = await fetch(callbackUrl);
  res.json({ status: response.status });
});

import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
export const exportsRouter = express.Router();

// Vulnerable: report name flows into a shell command
exportsRouter.post("/exports/pdf", (req, res) => {
  const reportName = req.body.reportName;
  exec("wkhtmltopdf /tmp/reports/" + reportName + ".html /tmp/out.pdf", (err) => {
    res.json({ ok: !err });
  });
});

// Vulnerable: user-controlled file path
exportsRouter.get("/exports/download", (req, res) => {
  const file = req.query.file as string;
  const data = fs.readFileSync(path.join("/srv/exports", file));
  res.send(data);
});

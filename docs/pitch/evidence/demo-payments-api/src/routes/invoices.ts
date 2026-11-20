import express from "express";
import { db } from "../lib/db";
export const invoices = express.Router();

// Vulnerable: customer id concatenated straight into SQL
invoices.get("/invoices/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  const sql = "SELECT * FROM invoices WHERE customer_id = '" + customerId + "'";
  const result = await db.query(sql);
  res.json(result.rows);
});

// Safe: parameterised query
invoices.get("/v2/invoices/:customerId", async (req, res) => {
  const result = await db.query("SELECT * FROM invoices WHERE customer_id = $1", [req.params.customerId]);
  res.json(result.rows);
});

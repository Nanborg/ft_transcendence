const express = require("express");
const router = express.Router();

// WHY: Simple endpoint for backend health checks.
//
// Example:
//   curl -i http://localhost:3000/health
//
// Expected body:
//   {"status":"ok"}
router.get("/", (_, res) => {res.json({ status: "ok" });});

module.exports = router;

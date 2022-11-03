const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET Dashboard page */
router.get("/dashboard", (req, res, next) => {
  ///get task name
  res.render("dashboard");
});

module.exports = router;

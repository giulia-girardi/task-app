const express = require('express');
const router = express.Router();

/* GET Dashboard page */
router.get("/dashboard", (req, res, next) => {
    ///get task name
    res.render("dashboard");
});

/* GET Tasks page */
router.get("/", (req, res, next) => {
    res.render("tasks");
  });

/* GET Create Task page */
router.get("/create", (req, res, next) => {
    res.render("create-task");
});

/* GET Create Task page */
router.get("/create", (req, res, next) => {
    res.render("create-task");
});

/* GET Edit Task page */
router.get("/edit", (req, res, next) => {
    res.render("edit-task");
});


module.exports = router;

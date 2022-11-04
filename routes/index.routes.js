const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET Dashboard page */
router.get("/dashboard", async (req, res, next) => {
  const today = new Date();
  console.log(today)
  const tasksDueToday = await TaskModel.find({dueDate: {$eq: today}})
  console.p
  res.render("dashboard", {tasksDueToday});
});

module.exports = router;

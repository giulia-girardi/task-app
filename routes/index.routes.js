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
  const todayToString = today.toISOString().slice(0,10)
  const todayNewFormat = todayToString + "T00:00:00.000+00:00"
  
  const tasksDueToday = await TaskModel.find({dueDate: {$eq: todayNewFormat}})
  console.p
  res.render("dashboard", {tasksDueToday});
});

module.exports = router;

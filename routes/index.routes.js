const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();
const {isLoggedIn} = require('../middleware/route-guard')


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET Dashboard page */
router.get("/dashboard", isLoggedIn, async (req, res, next) => {
  const today = new Date();
  const todayToString = today.toISOString().slice(0,10)
  const todayNewFormat = todayToString + "T00:00:00.000+00:00"
  
  const tasksDueToday = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {dueDate: {$eq: todayNewFormat}}]})
  console.p
  res.render("dashboard", {tasksDueToday});
});

module.exports = router;

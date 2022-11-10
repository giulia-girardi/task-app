const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();
const {isLoggedIn} = require('../middleware/route-guard')
const User = require('../models/User.model')


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET Dashboard page */
router.get("/dashboard", isLoggedIn, async (req, res, next) => {
  const today = new Date();
  const todayToString = today.toISOString().slice(0,10)
  const todayNewFormat = todayToString + "T00:00:00.000+00:00"

  const tasksDueToday = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {dueDate: {$eq: todayNewFormat}}, {taskCompleted: false}]})

  const userWithSharedTask = (await User.find({$and: [ {email: req.session.user.email}, {sharedTasks: {$ne: []}}]}).populate('sharedTasks'))|| []
  const sharedTasksPopulated = userWithSharedTask[0].sharedTasks 


  // only have tasks still to be done
  const sharedTasksDue = sharedTasksPopulated.filter(task => task.taskCompleted == false)

  res.render("dashboard", {tasksDueToday, sharedTasksDue});
});

/* POST Dashboard Done page */
router.post("/dashboard/:id/done", isLoggedIn, async (req, res, next) => {
  try{
    await TaskModel.findByIdAndUpdate(req.params.id, {taskCompleted: true})
    res.redirect("/dashboard");
  }
  catch(error) {
      res.render(`tasks`, {errorMessage: error})
  }
}); 


/* GET Past Tasks page */
router.get("/past-tasks", isLoggedIn, async (req, res, next) => {
  const pastTasks = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {taskCompleted: true}]})
  const userWithSharedTask = await User.find({$and: [ {email: req.session.user.email}, {sharedTasks: {$ne: []}}]}).populate('sharedTasks')
  const sharedTasksPopulated = userWithSharedTask[0].sharedTasks

  // only have tasks still to be done
  const sharedTasksDone = sharedTasksPopulated.filter(task => task.taskCompleted == true)

  res.render("past-tasks", {pastTasks, sharedTasksDone});
});

module.exports = router;


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
  //Create todays date as a string:
  const today = new Date();
  const todayToString = today.toISOString().slice(0,10)
  //Create date in format for searching tasks in database for task owner:
  const todayNewFormat = todayToString + "T00:00:00.000+00:00"

  //Searching and filtering for tasks due today owned by the current user:
  const tasksDueToday = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {dueDate: {$eq: todayNewFormat}}, {taskCompleted: false}]})

  //Searching and filtering for tasks ids shared with the current user and populate tasks inside the shared tasks property:
  const userWithSharedTask = await User.find({$and: [ {email: req.session.user.email}, {sharedTasks: {$ne: []}}]}).populate('sharedTasks')
  //Get just the sharedTasks property containing an array of tasks for the current user instead of the complete user document:
  const sharedTasksPopulated = userWithSharedTask.length ? userWithSharedTask[0].sharedTasks : []


  // Filtering for shared tasks with due date date matching todays date:
  const todayFormatCollaboratorString = todayToString + 'T00:00:00.000Z';
  const sharedTasksDueFalse = sharedTasksPopulated.filter(task => task.taskCompleted == false);
  const sharedTasksDue = sharedTasksDueFalse.filter(task => task.dueDate.toISOString() == todayFormatCollaboratorString);

  //Display tasks due today owned by current user and tasks due today shared with current user:
  res.render("dashboard", {tasksDueToday, sharedTasksDue});
});

/* POST Dashboard Done page */
router.post("/dashboard/:id/done", isLoggedIn, async (req, res, next) => {
  //Update specific task to be completed:
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
  //Find completed tasks owned by current user:
  const pastTasks = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {taskCompleted: true}]})
  //Find completed shared tasks ids for current user and populate the tasks to the sharedTasks property:
  const userWithSharedTask = await User.find({$and: [ {email: req.session.user.email}, {sharedTasks: {$ne: []}}]}).populate('sharedTasks')
  //Get just the sharedTasks property instead of the complete user document in an array for the current user:
  const sharedTasksPopulated = userWithSharedTask.length ? userWithSharedTask[0].sharedTasks : []

  // Filter the array of shared tasks for completed tasks:
  const sharedTasksDone = sharedTasksPopulated.filter(task => task.taskCompleted == true)
  //Display completed tasks owned by the user and completed tasks shared with the user:
  res.render("past-tasks", {pastTasks, sharedTasksDone});
});

module.exports = router;


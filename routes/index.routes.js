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
  console.log('Today: ', today);
  console.log('Typeof today: ', typeof today);
  const todayToString = today.toISOString().slice(0,10)
  console.log('today to string: ', todayToString);
  const todayNewFormat = todayToString + "T00:00:00.000+00:00"

  const tasksDueToday = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {dueDate: {$eq: todayNewFormat}}, {taskCompleted: false}]})

  const userWithSharedTask = await User.find({$and: [ {email: req.session.user.email}, {sharedTasks: {$ne: []}}]}).populate('sharedTasks')
  const sharedTasksPopulated = userWithSharedTask[0].sharedTasks
  console.log('shared tasks: ', sharedTasksPopulated)

  // only have tasks still to be done
  const todayFormatCollaboratorString = todayToString + 'T00:00:00.000Z';
  const sharedTasksDueFalse = sharedTasksPopulated.filter(task => task.taskCompleted == false);
  const sharedTasksDue = sharedTasksDueFalse.filter(task => task.dueDate.toISOString() == todayFormatCollaboratorString);

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


const express = require("express");
const TaskModel = require("../models/Task.model");
const router = express.Router();
const { isLoggedIn } = require("../middleware/route-guard");
const User = require("../models/User.model");

/* GET Tasks page */
router.get("/", isLoggedIn, async (req, res, next) => {
    console.log(req.session.user)
    const allDueTasks = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {taskCompleted: false}]})
    const sharedTasks = await User.find({$and: [{email: req.session.user.email},{sharedTasks: {$ne: []}}]}).populate('sharedTasks')
    const sharedTasksPopulated = sharedTasks[0].sharedTasks
    console.log('sharedTasks >>>>>>>', sharedTasksPopulated)
    res.render("tasks", {allDueTasks, sharedTasksPopulated});
});

/* POST Tasks Done page */
router.post("/:id/done", isLoggedIn, async (req, res, next) => {
  try {
    await TaskModel.findByIdAndUpdate(req.params.id, { taskCompleted: true });
    res.redirect("/tasks");
  } catch (error) {
    res.render(`tasks`, { errorMessage: error });
  }
});

/* GET Create Task page */
router.get("/create", isLoggedIn, (req, res, next) => {
  res.render("create-task");
});

/* POST Create Task page */
router.post("/create", isLoggedIn, async (req, res, next) => {
  try {
    const { taskName, dueDate, collaborators } = req.body;
    const createdTask = await TaskModel.create({
      taskName: taskName,
      dueDate: dueDate,
      collaborators: collaborators,
      taskOwner: req.session.user._id,
    });

    let collaboratorsArray = collaborators.split(",");

    try {
      await collaboratorsArray.forEach(async (collaborator) => {
        await User.findOneAndUpdate(
          { email: collaborator },
          { $push: { sharedTasks: createdTask._id } }
        );
      });
      await User.findByIdAndUpdate(req.session.user._id, {
        $push: { tasks: createdTask._id },
      });
      res.redirect("/tasks");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.render("create-task", { errorMessage: error });
  }
});

/* GET Edit Task page */
router.get("/:id/edit", isLoggedIn, async (req, res, next) => {
  const oneTask = await TaskModel.findById(req.params.id);
  res.render("edit-task", { oneTask });
});

/* POST Edit Task page */
router.post("/:id/edit", isLoggedIn, async (req, res, next) => {
    try {
    let collaboratorsArray = req.body.collaborators.split(", ");
    //console.log('1. Array of collabs: ', collaboratorsArray);
    let validCollaborators = [];
    let userNotFound = false;
    let duplicateCollaborator = false;


    const arrayOfPromises = []
    collaboratorsArray.forEach(collab => {
        arrayOfPromises.push(User.findOne({ email: collab }))
    })
    const arrayOfResponse = await Promise.all(arrayOfPromises)
    console.log('array responses:', arrayOfResponse);
    const currentTask = await TaskModel.findById(req.params.id, );

    arrayOfResponse.forEach((collaborator) => {
      if (!collaborator) {
        userNotFound = true;
        //console.log('2. userNotFound inside forEach: ', userNotFound);
      } else if (collaborator) {
        //console.log('check existing collab: ', checkExistingCollaborator._conditions.collaborators);
        if (!currentTask.collaborators.includes(collaborator.email)) {
          validCollaborators.push(collaborator);
        } else {
          duplicateCollaborator = true;
        }
      }
    })
    //console.log('Array of Response: ', arrayOfResponse);


    //console.log('3. UserNotFound outside forEach: ', userNotFound);
    if (userNotFound) {
        //console.log('UserNotFound outside forEach: ', userNotFound);
        const oneTask = await TaskModel.findById(req.params.id);
        res.render("edit-task", {errorMessage: 'User not found', oneTask})
    } else if (duplicateCollaborator) {
      const oneTask = await TaskModel.findById(req.params.id);
      res.render("edit-task", {errorMessage: 'Collaborator already exists', oneTask})
    } else if (!userNotFound) {
      console.log('If/else at the end: validCollaborators Array: ', validCollaborators);
      const collaboratorsEmails = validCollaborators.map(collaborator => collaborator.email);
      console.log('Mapped emails: ', collaboratorsEmails);
      const updateTask = await TaskModel.findByIdAndUpdate(req.params.id, {
        taskName: req.body.taskName,
        dueDate: req.body.dueDate,
        $push: { collaborators: {$each: collaboratorsEmails} }
      });
      res.redirect('/tasks');
  }
  } catch (error) {
    console.log(error);
  }
});


/* POST Delete Task */
router.post("/:id/delete", isLoggedIn, async (req, res, next) => {
  try {
    await TaskModel.findByIdAndDelete(req.params.id);
    res.redirect("/tasks");
  } catch (error) {
    res.render(`tasks`, { errorMessage: error });
  }
});

module.exports = router;

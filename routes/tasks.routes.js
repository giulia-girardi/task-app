const express = require("express");
const TaskModel = require("../models/Task.model");
const router = express.Router();
const { isLoggedIn } = require("../middleware/route-guard");
const User = require("../models/User.model");

/* GET Tasks page */
router.get("/", isLoggedIn, async (req, res, next) => {
    /// Find tasks to be completed still
    const allDueTasks = await TaskModel.find({$and: [{taskOwner: req.session.user._id}, {taskCompleted: false}]})
    /// Find the array of current user with shared tasks id (if any) and populate them
    const userWithSharedTask = await User.find({$and: [ {email: req.session.user.email}, {sharedTasks: {$ne: []}}]}).populate('sharedTasks')
    /// Get array of populated shared tasks (if none, empty array)
    const sharedTasksPopulated = userWithSharedTask.length ? userWithSharedTask[0].sharedTasks : []
    // only have tasks still to be done
    const sharedTasksDue = sharedTasksPopulated.filter(task => task.taskCompleted == false)

    res.render("tasks", {allDueTasks, sharedTasksDue});
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

    //Transform string of input email as an array
    let collaboratorsArray = req.body.collaborators.split(", ");
    
    //If no collaborator is added, create task
    if (collaboratorsArray[0].length === 0) {
      const createdTask = await TaskModel.create({
        taskName: req.body.taskName,
        dueDate: req.body.dueDate,
        taskOwner: req.session.user._id,   
      }); 
      res.redirect("/tasks");
    } else {
      
      //If collaborators are added, check if added collaborators are valid users, error if not and create task if yes
      const arrayOfPromises = [];
      let userNotFound = false;

      collaboratorsArray.forEach((collab) => {
        arrayOfPromises.push(User.findOne({ email: collab }));
      });
      const arrayOfResponse = await Promise.all(arrayOfPromises);

      let checkedCollaborators = [];
      arrayOfResponse.forEach((collaborator) => {
        if (!collaborator) {
          userNotFound = true;
        } else {
          checkedCollaborators.push(collaborator.email);
        }
      });

      if (userNotFound) {
        res.render("create-task", {
          errorMessage: "Collaborator is not a valid user.",
        });
      } else {
        const createdTask = await TaskModel.create({
          taskName: req.body.taskName,
          dueDate: req.body.dueDate,
          collaborators: checkedCollaborators,
          taskOwner: req.session.user._id,
        });

        // add shared task to the colaborators user model
        try {
          await collaboratorsArray.forEach(async (collaborator) => {
            await User.findOneAndUpdate(
              { email: collaborator },
              { $push: { sharedTasks: createdTask._id } }
            );
          });
          
          // add  task to the owner's user model
          await User.findByIdAndUpdate(req.session.user._id, {
            $push: { tasks: createdTask._id },
          });
          res.redirect("/tasks");
        } catch (error) {
          console.log(error);
        }
      }  
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
    //Transform string of input email as an array
    let collaboratorsArray = req.body.collaborators.split(", ");

    //If no collaborator is added, create task
    if (!collaboratorsArray[0]) {
      const updateTask = await TaskModel.findByIdAndUpdate(req.params.id, {
        taskName: req.body.taskName,
        dueDate: req.body.dueDate,
      });
      res.redirect("/tasks");
    } else if (collaboratorsArray.length > 0) {

      //If collaborators are added, check if added collaborators are valid users, ... 
      let validCollaborators = [];
      let userNotFound = false;
      let duplicateCollaborator = false;
      const arrayOfPromises = [];

      collaboratorsArray.forEach((collab) => {
        arrayOfPromises.push(User.findOne({ email: collab }));
      });
      const arrayOfResponse = await Promise.all(arrayOfPromises);
      const currentTask = await TaskModel.findById(req.params.id);

      arrayOfResponse.forEach((collaborator) => {
        if (!collaborator) {
          userNotFound = true;
        } else if (collaborator) {
          //...and check that the added collaborator is not a collabor already
          if (!currentTask.collaborators.includes(collaborator.email)) {
            validCollaborators.push(collaborator);
          } else {
            duplicateCollaborator = true;
          }
        }
      });

      /// if so error
      if (userNotFound) {
        const oneTask = await TaskModel.findById(req.params.id);
        res.render("edit-task", { errorMessage: "User not found", oneTask });
      } else if (duplicateCollaborator) {
        const oneTask = await TaskModel.findById(req.params.id);
        res.render("edit-task", {
          errorMessage: "Collaborator already exists",
          oneTask,
        });
      } else if (!userNotFound) {
        const collaboratorsEmails = validCollaborators.map(
          (collaborator) => collaborator.email
        );

        //If not, edit the task with the entered values from the form:
        const updateTask = await TaskModel.findByIdAndUpdate(req.params.id, {
          taskName: req.body.taskName,
          dueDate: req.body.dueDate,
          $push: { collaborators: { $each: collaboratorsEmails } },
        });

        //Push the task inside the sharedTasks property of the new collaborator:
        collaboratorsEmails.forEach(async (collaborator) => {
          await User.findOneAndUpdate(
            { email: collaborator },
            { $push: { sharedTasks: req.params.id } }
          );
        });

        res.redirect("/tasks");
      }
    }
  } catch (error) {
    console.log(error);
  }
});

/* POST Delete Task */
router.post("/:id/delete", isLoggedIn, async (req, res, next) => {
  try {
    //check if task id is still in tasks property of user and delete it:
    const taskIdInTasksProperty = await User.findByIdAndUpdate(req.session.user._id, {$pull: {tasks: {$in: [req.params.id]  } } } )
    
    //check if task id is in sharedTasks property of the collaborators and delete it:
    const getTask = await TaskModel.findById(req.params.id);
    const listOfCollaborators = getTask.collaborators;
    listOfCollaborators.forEach(async (collaborator) => {
    await User.findOneAndUpdate({email: collaborator}, {$pull: {sharedTasks: {$in: [req.params.id]  } } })
    })
    
    //find task and delete it:
    await TaskModel.findByIdAndDelete(req.params.id);
    res.redirect("/tasks");
  } catch (error) {
    res.render(`tasks`, { errorMessage: error });
  }
});


module.exports = router;

const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();
const {isLoggedIn} = require('../middleware/route-guard')
const User = require('../models/User.model')

/* GET Tasks page */
router.get("/", isLoggedIn, async (req, res, next) => {
    const allTasks = await TaskModel.find({taskOwner: req.session.user._id})
    res.render("tasks", {allTasks});
  });

/* GET Create Task page */
router.get("/create", isLoggedIn, (req, res, next) => {
    res.render("create-task");
});

/* POST Create Task page */
router.post("/create", isLoggedIn, async (req, res, next) => {
    try {
        const {taskName, dueDate, collaborators} = req.body
        const createdTask = await TaskModel.create({
            taskName: taskName,
            dueDate: dueDate, 
            collaborators: collaborators,
            taskOwner: req.session.user._id
        })

        let collaboratorsArray = collaborators.split(',');

        try {
            await User.findByIdAndUpdate(req.session.user._id, {$push: {sharedTasks: createdTask._id}} )
            await collaboratorsArray.forEach(async (collaborator) => {
                await User.findOneAndUpdate( {email: collaborator}, {$push: {sharedTasks: createdTask._id}} )
            })
            await User.findByIdAndUpdate(req.session.user._id, {$push: {tasks: createdTask._id}} )
            res.redirect("/tasks");
        }
        catch(error) {
            console.log(error)
        }
  
    }
    catch(error) {
        res.render('create-task', {errorMessage: error})
    }
});

/* GET Edit Task page */
router.get("/:id/edit", isLoggedIn, async (req, res, next) => {
    const oneTask = await TaskModel.findById(req.params.id)
    res.render("edit-task", {oneTask});
});

/* POST Edit Task page */
router.post("/:id/edit", isLoggedIn, async (req, res, next) => {
    try {
        let collaboratorsArray = req.body.collaborators.split(',');
        await TaskModel.findByIdAndUpdate(req.params.id, {
            taskName: req.body.taskName,
            dueDate: req.body.dueDate,
        })
        await collaboratorsArray.forEach(async (collaborator) => {
            const findUser = await User.findOne({email: collaborator});
            console.log(findUser);
            if (!findUser) {
                res.render(`${req.params.id}/edit`, {errorMessage: 'User not found'})
            } else {
                await TaskModel.findByIdAndUpdate(req.params.id, {$push: {collaborators: collaborator}}) 
            }
        })

        res.redirect("/tasks");
    }
    catch(error) {
        res.render(`${req.params.id}/edit`, {errorMessage: error})
    }
});

/* POST Delete task from sharedTasks Property from deleted collaborator*/
/*router.post("/:collaborator/delete", isLoggedIn, async (req, res, next) => {
    try {
        console.log(req.params)
        res.render("edit-task", {oneTask});
    } catch (error) {
        res.render(`${req.params.id}/edit`, {errorMessage: error})
    }
})*/

/* POST Delete Task */
router.post("/:id/delete", isLoggedIn, async (req, res, next) => {
    try {
        await TaskModel.findByIdAndDelete(req.params.id)
        res.redirect("/tasks");
    }
    catch(error) {
        res.render(`tasks`, {errorMessage: error})
    }
});

module.exports = router;

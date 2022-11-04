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
        const {taskName, dueDate} = req.body
        //const currentUser = await User.findOne({email})
        const createdTask = await TaskModel.create({
            taskName: taskName,
            dueDate: dueDate, 
            //collaborators: collaborators,
            taskOwner: req.session.user._id
        })
        try {
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
        await TaskModel.findByIdAndUpdate(req.params.id, {
            taskName: req.body.taskName,
            dueDate: req.body.dueDate, 
        })
        console.log(req.params)
        res.redirect("/tasks");
    }
    catch(error) {
        res.render(`${req.params.id}/edit`, {errorMessage: error})
    }
});

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

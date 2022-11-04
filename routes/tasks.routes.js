const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();



/* GET Tasks page */
router.get("/", async (req, res, next) => {
    const allTasks = await TaskModel.find( )
    res.render("tasks", {allTasks});
  });

/* GET Create Task page */
router.get("/create", (req, res, next) => {
    res.render("create-task");
});

/* POST Create Task page */
router.post("/create", async (req, res, next) => {
    try {
        const {taskName, dueDate} = req.body
        await TaskModel.create({
            taskName: taskName,
            dueDate: dueDate, 
        })
        res.redirect("/tasks");
    }
    catch(error) {
        res.render('create-task', {errorMessage: error})
    }
});

/* GET Edit Task page */
router.get("/:id/edit", async (req, res, next) => {
    const oneTask = await TaskModel.findById(req.params.id)
    res.render("edit-task", {oneTask});
});

/* POST Edit Task page */
router.post("/:id/edit", async (req, res, next) => {
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
router.post("/:id/delete", async (req, res, next) => {
    try {
        await TaskModel.findByIdAndDelete (req.params.id)
        res.redirect("/tasks");
    }
    catch(error) {
        res.render(`tasks`, {errorMessage: error})
    }
});


module.exports = router;

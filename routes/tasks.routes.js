const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();



/* GET Tasks page */
router.get("/", (req, res, next) => {
    res.render("tasks");
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
router.get("/:id/edit", (req, res, next) => {
    const oneTask = TaskModel.findById(req.params.id)
    res.render("edit-task", {oneTask});
});

/* POST Edit Task page */
router.post("/:id/edit", async (req, res, next) => {
    try {
        await TaskModel.findByIdAndUpdate(req.params.id, {
            taskName: req.params.taskName,
            dueDate: req.params.dueDate, 
        })
        console.log(req.params)
        res.redirect("/tasks");
    }
    catch(error) {
        res.render('tasks', {errorMessage: error})
    }
});


module.exports = router;

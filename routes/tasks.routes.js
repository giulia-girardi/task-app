const express = require('express');
const TaskModel = require('../models/Task.model');
const router = express.Router();

/* GET Dashboard page */
router.get("/dashboard", (req, res, next) => {
    ///get task name
    res.render("dashboard");
});

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
        const {taskName, dueDate, collaborators, taskCompleted } = req.body
        await TaskModel.create({
            taskName: taskName,
            dueDate: dueDate, 
            collaborators: collaborators,
            taskCompleted: taskCompleted
        })
        res.redirect("/");
    }
    catch(error) {
        res.render('create', {errorMessage: error})
    }
});

/* GET Edit Task page */
router.get("/edit", (req, res, next) => {
    res.render("edit-task");
});


module.exports = router;

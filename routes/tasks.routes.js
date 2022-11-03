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
        res.render('create-task', {errorMessage: error})
    }
});

/* GET Edit Task page */
router.get("/:id", (req, res, next) => {
    const oneTask = TaskModel.findById(req.params.id)
    res.render("edit-task", {oneTask});
});


module.exports = router;

const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const TaskSchema = new Schema(
  {
    taskName: {
      type: String,
      trim: true,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    collaborators: [String],
    taskCompleted: {
        type: Boolean,
        default: false,
    },
    taskOwner: [{type: Schema.Types.ObjectId, ref: 'User'}]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const TaskModel = model("Task", TaskSchema);

module.exports = TaskModel;

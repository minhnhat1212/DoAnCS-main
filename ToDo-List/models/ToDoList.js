const mongoose = require('mongoose');
const { Schema } = mongoose;

// Định nghĩa schema cho Subtask (task con)
const subTaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    completedOn: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date }
});

// Định nghĩa schema cho công việc (To-Do)
const toDoSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    isCompleted: { type: Boolean, required: true, default: false },
    completedOn: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    notify: { type: Boolean, default: true },
    notifyStart: { type: Boolean, default: true },
    notifyEnd: { type: Boolean, default: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    notifyEmail: { type: String },
    subTasks: [subTaskSchema],
    createdBy: {
        ref: "User",
        type: Schema.ObjectId
    }
}, {
    timestamps: true
});

// Tạo model từ schema
const ToDo = mongoose.model("ToDo", toDoSchema);

module.exports = ToDo;
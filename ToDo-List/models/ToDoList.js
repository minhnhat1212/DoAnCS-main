/**
 * File ToDoList.js - Định nghĩa model cho công việc (To-Do) và subtask
 * 
 * File này định nghĩa cấu trúc dữ liệu cho công việc và subtask trong hệ thống,
 * sử dụng Mongoose Schema để tạo model cho MongoDB.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Schema cho Subtask (task con)
 * Mỗi subtask có thể có các thông tin:
 * - title: Tiêu đề subtask (bắt buộc)
 * - description: Mô tả chi tiết
 * - isCompleted: Trạng thái hoàn thành
 * - completedOn: Thời gian hoàn thành
 * - startTime: Thời gian bắt đầu
 * - endTime: Thời gian kết thúc
 * - notifyStart: Có thông báo khi bắt đầu không
 * - notifyEnd: Có thông báo khi kết thúc không
 * - notifyEmail: Email nhận thông báo
 */
const subTaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    completedOn: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    notifyStart: { type: Boolean, default: true },
    notifyEnd: { type: Boolean, default: true },
    notifyEmail: { type: String }
});

/**
 * Schema cho công việc chính (To-Do)
 * Mỗi công việc có thể có các thông tin:
 * - title: Tiêu đề công việc (bắt buộc)
 * - description: Mô tả chi tiết (bắt buộc)
 * - isCompleted: Trạng thái hoàn thành
 * - completedOn: Thời gian hoàn thành
 * - startTime: Thời gian bắt đầu
 * - endTime: Thời gian kết thúc
 * - notify: Có thông báo không
 * - notifyStart: Có thông báo khi bắt đầu không
 * - notifyEnd: Có thông báo khi kết thúc không
 * - priority: Mức độ ưu tiên (low/medium/high)
 * - notifyEmail: Email nhận thông báo
 * - subTasks: Danh sách các subtask
 * - createdBy: ID của người tạo (liên kết với model User)
 * 
 * timestamps: true - Tự động thêm createdAt và updatedAt
 */
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

// Tạo model từ schema và export
const ToDo = mongoose.model("ToDo", toDoSchema);

module.exports = ToDo;
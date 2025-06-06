/**
 * File ToDoRoutes.js - Định nghĩa các route xử lý công việc (To-Do)
 * 
 * File này định nghĩa các endpoint API cho việc quản lý công việc,
 * bao gồm tạo mới, lấy danh sách, cập nhật và xóa công việc.
 * Tất cả các route đều yêu cầu xác thực người dùng thông qua JWT token.
 */

// Import thư viện express để tạo router
const express = require('express');

// Import các hàm controller để xử lý logic To-Do
const { createToDo, getAllToDo, deleteToDo, updateToDo, updateNotify } = require('../controllers/toDoController');

// Import middleware để kiểm tra token đăng nhập (xác thực người dùng)
const authenticateToken = require('../middleware/authJwt');

// Khởi tạo router của express
const router = express.Router();

/**
 * Route tạo mới công việc
 * Method: POST
 * URL: /api/todo/create-to-do
 * Headers: {
 *   Authorization: Bearer <jwt_token>
 * }
 * Body: {
 *   title: string,
 *   description: string,
 *   startTime: Date,
 *   endTime: Date,
 *   priority: 'low' | 'medium' | 'high',
 *   notifyStart: boolean,
 *   notifyEnd: boolean,
 *   notifyEmail: string,
 *   subTasks: Array<{
 *     title: string,
 *     description: string,
 *     startTime: Date,
 *     endTime: Date
 *   }>
 * }
 */
router.post('/create-to-do', authenticateToken, createToDo);

/**
 * Route lấy danh sách công việc của người dùng
 * Method: GET
 * URL: /api/todo/get-all-to-do/:userId
 * Headers: {
 *   Authorization: Bearer <jwt_token>
 * }
 * Params: {
 *   userId: string (ID của người dùng)
 * }
 */
router.get('/get-all-to-do/:userId', authenticateToken, getAllToDo);

/**
 * Route xóa công việc
 * Method: DELETE
 * URL: /api/todo/delete-to-do/:id
 * Headers: {
 *   Authorization: Bearer <jwt_token>
 * }
 * Params: {
 *   id: string (ID của công việc)
 * }
 */
router.delete('/delete-to-do/:id', authenticateToken, deleteToDo);

/**
 * Route cập nhật công việc
 * Method: PATCH
 * URL: /api/todo/update-to-do/:id
 * Headers: {
 *   Authorization: Bearer <jwt_token>
 * }
 * Params: {
 *   id: string (ID của công việc)
 * }
 * Body: Các trường cần cập nhật (tương tự như body của create-to-do)
 */
router.patch('/update-to-do/:id', authenticateToken, updateToDo);

/**
 * Route cập nhật cài đặt thông báo của công việc
 * Method: PATCH
 * URL: /api/todo/update-notify/:id
 * Headers: {
 *   Authorization: Bearer <jwt_token>
 * }
 * Params: {
 *   id: string (ID của công việc)
 * }
 * Body: {
 *   notifyStart: boolean,
 *   notifyEnd: boolean,
 *   notifyEmail: string
 * }
 */
router.patch('/update-notify/:id', authenticateToken, updateNotify);

// Xuất router để sử dụng ở file khác
module.exports = router;

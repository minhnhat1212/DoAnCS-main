// Import thư viện express
const express = require('express');
// Import các hàm controller để xử lý logic To-Do
const { createToDo, getAllToDo, deleteToDo, updateToDo, updateNotify } = require('../controllers/toDoController');
// Import middleware để kiểm tra token đăng nhập (xác thực người dùng)
const authenticateToken = require('../middleware/authJwt');
// Khởi tạo router của express
const router = express.Router();

// Route để tạo mới một công việc (To-Do)
// Chỉ cho phép người dùng đã đăng nhập (authenticateToken)
router.post('/create-to-do', authenticateToken, createToDo);

// Route để lấy tất cả công việc của một người dùng (dựa vào userId)
// Chỉ cho phép người dùng đã đăng nhập
router.get('/get-all-to-do/:userId', authenticateToken, getAllToDo);

// Route để xóa một công việc theo id
// Chỉ cho phép người dùng đã đăng nhập
router.delete('/delete-to-do/:id', authenticateToken, deleteToDo);

// Route để cập nhật một công việc theo id
// Chỉ cho phép người dùng đã đăng nhập
router.patch('/update-to-do/:id', authenticateToken, updateToDo);
router.patch('/update-notify/:id', authenticateToken, updateNotify);
// Xuất router để sử dụng ở file khác
module.exports = router;

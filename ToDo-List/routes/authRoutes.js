// Import thư viện express
const express = require('express');
// Import controller xử lý logic xác thực (đăng ký, đăng nhập)
const AuthController = require('../controllers/AuthController');
// Khởi tạo router của express
const router = express.Router();

// Định nghĩa route cho đăng ký người dùng mới
// POST /api/register
router.post('/register', AuthController.registerUser);

// Định nghĩa route cho đăng nhập người dùng
// POST /api/login
router.post('/login', AuthController.loginUser);

// Xuất router để sử dụng ở file khác
module.exports = router;

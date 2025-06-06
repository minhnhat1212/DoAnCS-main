/**
 * File authRoutes.js - Định nghĩa các route xử lý xác thực người dùng
 * 
 * File này định nghĩa các endpoint API cho việc đăng ký và đăng nhập người dùng.
 * Các route này sẽ được gắn vào đường dẫn /api trong server.js.
 */

// Import thư viện express để tạo router
const express = require('express');

// Import controller xử lý logic xác thực (đăng ký, đăng nhập)
const AuthController = require('../controllers/AuthController');

// Khởi tạo router của express
const router = express.Router();

/**
 * Route đăng ký người dùng mới
 * Method: POST
 * URL: /api/register
 * Body: {
 *   firstName: string,
 *   lastName: string,
 *   username: string,
 *   password: string
 * }
 * Response: Thông tin người dùng đã đăng ký (không bao gồm mật khẩu)
 */
router.post('/register', AuthController.registerUser);

/**
 * Route đăng nhập người dùng
 * Method: POST
 * URL: /api/login
 * Body: {
 *   username: string,
 *   password: string
 * }
 * Response: Token JWT và thông tin người dùng
 */
router.post('/login', AuthController.loginUser);

// Xuất router để sử dụng ở file khác
module.exports = router;

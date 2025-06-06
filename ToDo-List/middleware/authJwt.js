/**
 * File authJwt.js - Middleware xác thực JWT token
 * 
 * File này chứa middleware để xác thực JWT token trong các request,
 * đảm bảo chỉ người dùng đã đăng nhập mới có thể truy cập các route được bảo vệ.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Khóa bí mật để xác thực JWT token
const secretKey = process.env.JWT_SECRET;

/**
 * Middleware xác thực JWT token
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @param {Function} next - Callback function để chuyển sang middleware tiếp theo
 * @returns {Object} Response với thông báo lỗi nếu xác thực thất bại
 * 
 * Quy trình:
 * 1. Lấy token từ header Authorization
 * 2. Kiểm tra token có tồn tại không
 * 3. Xác thực token bằng JWT
 * 4. Nếu hợp lệ, lưu thông tin user vào request và chuyển sang middleware tiếp theo
 * 5. Nếu không hợp lệ, trả về lỗi xác thực
 */
const authenticateToken = async (req, res, next) => {
    let token = req.header('Authorization'); // Lấy token từ header
    if (!token) 
        return res.status(401).send({ message: 'Xác thực thất bại! Vui lòng đăng nhập.' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) 
            return res.status(403).send({ message: "Token không hợp lệ! Vui lòng đăng nhập lại!" });
        req.user = user; // Lưu thông tin user vào req để các route sau dùng
        next(); // Tiếp tục xử lý
    });
}

module.exports = authenticateToken;

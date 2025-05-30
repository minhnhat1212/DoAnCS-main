const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

// Middleware để xác thực token (chỉ cho phép người dùng đã đăng nhập)
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

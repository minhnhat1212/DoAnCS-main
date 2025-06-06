/**
 * File authController.js - Xử lý logic xác thực người dùng
 * 
 * File này chứa các hàm xử lý logic cho việc đăng ký và đăng nhập người dùng,
 * bao gồm kiểm tra thông tin, tạo token JWT và trả về kết quả.
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Khóa bí mật để tạo và xác thực JWT token
const secretKey = process.env.JWT_SECRET;

/**
 * Hàm đăng ký người dùng mới
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với thông báo thành công hoặc lỗi
 * 
 * Quy trình:
 * 1. Kiểm tra username đã tồn tại chưa
 * 2. Nếu chưa tồn tại, tạo người dùng mới với thông tin từ request
 * 3. Lưu người dùng vào database
 * 4. Trả về thông báo thành công hoặc lỗi
 */
async function registerUser(req, res) {
    let { firstName, lastName, username, password } = req.body;
    try {
        // Kiểm tra username đã tồn tại chưa
        const duplicate = await User.find({ username });
        if (duplicate && duplicate.length > 0) {
            return res.status(400).send({ message: 'Tên đăng nhập này đã được sử dụng!' });
        }

        // Tạo người dùng mới
        let user = new User({ firstName, lastName, username, password });
        const result = await user.save();
        console.log(result);
        res.status(201).send({ message: 'Đăng ký tài khoản thành công!' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: 'Đã xảy ra lỗi khi đăng ký!' });
    }
}

/**
 * Hàm đăng nhập người dùng
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với thông tin người dùng và JWT token
 * 
 * Quy trình:
 * 1. Tìm người dùng theo username
 * 2. Kiểm tra mật khẩu có đúng không
 * 3. Nếu đúng, tạo JWT token với thời hạn 1 giờ
 * 4. Trả về thông tin người dùng và token
 */
async function loginUser(req, res) {
    try {
        const { username, password } = req.body;

        // Tìm user theo username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: "Tài khoản không tồn tại!" });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(404).send({ message: "Mật khẩu không đúng!" });
        }

        // Tạo JWT token
        let token = jwt.sign({ userId: user?._id }, secretKey, { expiresIn: '1h' });

        // Trả về thông tin user + token
        let finalData = {
            userId: user?._id,
            username: user?.username,
            firstName: user?.firstName,
            lastName: user?.lastName,
            token
        }
        res.send(finalData);
    } catch (err) {
        console.log(err);
        res.status(400).send({ message: 'Đã xảy ra lỗi khi đăng nhập!' });
    }
}

// Export controller
const AuthController = {
    registerUser,
    loginUser
}

module.exports = AuthController;
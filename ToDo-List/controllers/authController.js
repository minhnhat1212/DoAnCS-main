const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

// Đăng ký người dùng mới
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

// Đăng nhập người dùng
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
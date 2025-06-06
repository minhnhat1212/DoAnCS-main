/**
 * File User.js - Định nghĩa model cho người dùng
 * 
 * File này định nghĩa cấu trúc dữ liệu cho người dùng trong hệ thống,
 * bao gồm các thông tin cơ bản và xử lý mã hóa mật khẩu.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt'); // Thư viện mã hóa mật khẩu

/**
 * Schema cho người dùng
 * Mỗi người dùng có các thông tin:
 * - firstName: Tên
 * - lastName: Họ
 * - username: Tên đăng nhập (bắt buộc)
 * - password: Mật khẩu (bắt buộc)
 */
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    username: { type: String, required: true },
    password: { type: String, required: true }
});

/**
 * Middleware tự động mã hóa mật khẩu trước khi lưu vào CSDL
 * - Chỉ mã hóa khi mật khẩu bị thay đổi
 * - Sử dụng bcrypt để tạo salt và hash mật khẩu
 * - Độ phức tạp của salt là 10
 */
userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
});

/**
 * Phương thức so sánh mật khẩu khi đăng nhập
 * @param {string} password - Mật khẩu cần so sánh
 * @returns {Promise<boolean>} - Trả về true nếu mật khẩu khớp
 */
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

// Tạo model từ schema và export
const User = mongoose.model("User", userSchema);

module.exports = User;

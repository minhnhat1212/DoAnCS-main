/**
 * File User.js - Định nghĩa model cho người dùng
 * 
 * File này định nghĩa cấu trúc dữ liệu cho người dùng trong hệ thống,
 * bao gồm các thông tin cơ bản và xử lý mã hóa mật khẩu.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu

/**
 * Schema cho người dùng
 * Mỗi người dùng có các thông tin:
 * - firstName: Tên
 * - lastName: Họ
 * - username: Tên đăng nhập (bắt buộc)
 * - email: Email (tùy chọn)
 * - password: Mật khẩu (bắt buộc nếu không phải là người dùng Google)
 * - profilePicture: Hình ảnh đại diện (tùy chọn)
 * - isGoogleUser: Kiểm tra xem người dùng có phải là người dùng Google không
 * - createdAt: Thời gian tạo tài khoản
 */
const userSchema = new Schema({
    firstName: {
        type: String,
        required: function() {
            return !this.isGoogleUser;
        }
    },
    lastName: {
        type: String,
        required: function() {
            return !this.isGoogleUser;
        }
    },
    username: {
        type: String,
        required: function() {
            return !this.isGoogleUser;
        },
        unique: true,
        sparse: true // Allows multiple null values for username if not a Google user and username is not explicitly set
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values for email
    },
    password: {
        type: String,
        required: function() {
            return !this.isGoogleUser;
        }
    },
    profilePicture: {
        type: String
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
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
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
}

// Tạo model từ schema và export
const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

// Định nghĩa schema cho người dùng
const userSchema = new Schema({
    firstName: String, // Tên
    lastName: String,  // Họ
    username: { type: String, required: true }, // Tên đăng nhập (bắt buộc)
    password: { type: String, required: true }  // Mật khẩu (bắt buộc)
});

// Mã hóa mật khẩu trước khi lưu vào CSDL
userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified('password')) return next(); // Nếu mật khẩu chưa bị sửa thì bỏ qua
    let salt = await bcrypt.genSalt(10); // Tạo salt
    let hash = await bcrypt.hash(user.password, salt); // Mã hóa mật khẩu
    user.password = hash; // Lưu mật khẩu đã mã hóa
    next();
});

// Hàm so sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;

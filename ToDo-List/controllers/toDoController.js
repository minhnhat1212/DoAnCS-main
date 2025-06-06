/**
 * File toDoController.js - Xử lý logic quản lý công việc (To-Do)
 * 
 * File này chứa các hàm xử lý logic cho việc quản lý công việc,
 * bao gồm tạo mới, lấy danh sách, cập nhật, xóa công việc và gửi thông báo qua email.
 */

const ToDo = require("../models/ToDoList");
const User = require("../models/User");
const nodemailer = require('nodemailer');

/**
 * Cấu hình transporter cho nodemailer
 * Sử dụng Gmail làm dịch vụ gửi mail
 * Các thông tin xác thực được lấy từ biến môi trường
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Tạo công việc mới
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với thông báo và dữ liệu công việc đã tạo
 * 
 * Quy trình:
 * 1. Lấy thông tin công việc từ request body
 * 2. Tạo công việc mới với thông tin đã lấy
 * 3. Lưu công việc vào database
 * 4. Gửi email thông báo nếu có cấu hình email
 * 5. Trả về kết quả
 */
exports.createToDo = async (req, res) => {
    try {
        const {
            title,
            description,
            isCompleted,
            completedOn,
            startTime,
            endTime,
            notify,
            subTasks,
            createdBy,
            priority,
            notifyEmail
        } = req.body;

        const todo = new ToDo({
            title,
            description,
            isCompleted,
            completedOn,
            startTime,
            endTime,
            notify,
            notifyStart: true,
            notifyEnd: true,
            subTasks,
            createdBy,
            priority,
            notifyEmail
        });

        const result = await todo.save();
        console.log(result);

        // Gửi email thông báo khi tạo task mới
        if (notifyEmail) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: notifyEmail,
                subject: `Task mới: ${title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Task mới đã được tạo</h2>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <h3 style="color: #1e293b; margin: 0 0 10px 0;">${title}</h3>
                            <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">${description}</p>
                            
                            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                                <div>
                                    <span style="color: #64748b; font-size: 14px;">Thời gian bắt đầu:</span>
                                    <div style="color: #1e293b; font-weight: 500;">${new Date(startTime).toLocaleString('vi-VN')}</div>
                                </div>
                                <div>
                                    <span style="color: #64748b; font-size: 14px;">Thời gian kết thúc:</span>
                                    <div style="color: #1e293b; font-weight: 500;">${new Date(endTime).toLocaleString('vi-VN')}</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="color: #64748b; font-size: 14px;">Mức độ ưu tiên:</span>
                                <span style="background: ${priority === 'low' ? '#34d399' : priority === 'medium' ? '#fbbf24' : '#f87171'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px;">
                                    ${priority === 'low' ? 'Thấp' : priority === 'medium' ? 'Trung bình' : 'Cao'}
                                </span>
                            </div>
                        </div>

                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">
                            <p style="margin: 0;">Đây là email tự động từ hệ thống quản lý công việc của bạn.</p>
                            <p style="margin: 5px 0 0 0;">Bạn có thể truy cập vào hệ thống để xem chi tiết và cập nhật trạng thái công việc.</p>
                        </div>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Đã gửi email thông báo tạo task mới thành công!');
            } catch (emailError) {
                console.error('Lỗi khi gửi email thông báo:', emailError);
            }
        }

        res.status(201).send({ message: "Tạo công việc mới thành công!", data: result });
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

/**
 * Lấy danh sách công việc của người dùng
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với danh sách công việc
 * 
 * Quy trình:
 * 1. Lấy userId từ request params
 * 2. Tìm tất cả công việc được tạo bởi userId
 * 3. Trả về danh sách công việc
 */
exports.getAllToDo = async (req, res) => {
    let { userId } = req.params;

    try {
        const result = await ToDo.find({ createdBy: userId });
        res.send(result);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

/**
 * Cập nhật công việc
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với thông báo cập nhật thành công
 * 
 * Quy trình:
 * 1. Lấy id công việc từ request params
 * 2. Lấy dữ liệu cập nhật từ request body
 * 3. Cập nhật công việc trong database
 * 4. Gửi email thông báo nếu công việc được đánh dấu hoàn thành
 * 5. Trả về kết quả
 */
exports.updateToDo = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await ToDo.findByIdAndUpdate(id, { $set: data }, { returnOriginal: false });
        console.log(result);

        // Gửi email thông báo khi task hoàn thành
        if (data.isCompleted && result.notifyEmail) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: result.notifyEmail,
                subject: `Task đã hoàn thành: ${result.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Task đã hoàn thành</h2>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <h3 style="color: #1e293b; margin: 0 0 10px 0;">${result.title}</h3>
                            <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">${result.description}</p>
                            
                            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                                <div>
                                    <span style="color: #64748b; font-size: 14px;">Thời gian bắt đầu:</span>
                                    <div style="color: #1e293b; font-weight: 500;">${new Date(result.startTime).toLocaleString('vi-VN')}</div>
                                </div>
                                <div>
                                    <span style="color: #64748b; font-size: 14px;">Thời gian kết thúc:</span>
                                    <div style="color: #1e293b; font-weight: 500;">${new Date(result.endTime).toLocaleString('vi-VN')}</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="color: #64748b; font-size: 14px;">Mức độ ưu tiên:</span>
                                <span style="background: ${result.priority === 'low' ? '#34d399' : result.priority === 'medium' ? '#fbbf24' : '#f87171'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px;">
                                    ${result.priority === 'low' ? 'Thấp' : result.priority === 'medium' ? 'Trung bình' : 'Cao'}
                                </span>
                            </div>

                            <div style="margin-top: 15px; padding: 10px; background: #dcfce7; border-radius: 6px;">
                                <p style="color: #166534; margin: 0; font-weight: 500;">✓ Task đã được hoàn thành vào: ${new Date(result.completedOn).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>

                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">
                            <p style="margin: 0;">Đây là email tự động từ hệ thống quản lý công việc của bạn.</p>
                            <p style="margin: 5px 0 0 0;">Bạn có thể truy cập vào hệ thống để xem chi tiết và quản lý các task khác.</p>
                        </div>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Đã gửi email thông báo hoàn thành task thành công!');
            } catch (emailError) {
                console.error('Lỗi khi gửi email thông báo hoàn thành:', emailError);
            }
        }

        res.send({ message: 'Cập nhật công việc thành công!' });
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

/**
 * Xóa công việc
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với thông báo xóa thành công
 * 
 * Quy trình:
 * 1. Lấy id công việc từ request params
 * 2. Xóa công việc khỏi database
 * 3. Trả về kết quả
 */
exports.deleteToDo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ToDo.findByIdAndDelete(id);
        console.log(result);
        res.send({ message: "Xóa công việc thành công!" });
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

/**
 * Cập nhật cài đặt thông báo của công việc
 * @param {Object} req - Request object từ Express
 * @param {Object} res - Response object từ Express
 * @returns {Object} Response với thông báo cập nhật thành công
 * 
 * Quy trình:
 * 1. Lấy id công việc từ request params
 * 2. Lấy cài đặt thông báo từ request body
 * 3. Cập nhật cài đặt thông báo trong database
 * 4. Trả về kết quả
 */
exports.updateNotify = async (req, res) => {
    try {
        const { id } = req.params;
        const { notifyStart, notifyEnd } = req.body;
        const update = {};
        if (notifyStart !== undefined) update.notifyStart = notifyStart;
        if (notifyEnd !== undefined) update.notifyEnd = notifyEnd;

        const result = await ToDo.findByIdAndUpdate(id, { $set: update }, { new: true });
        res.send({ message: 'Cập nhật trạng thái notify thành công!', data: result });
    } catch (err) {
        res.status(400).send(err);
    }
}

/**
 * File server.js - File chính để khởi động và cấu hình server
 * 
 * File này chứa các cấu hình và khởi tạo cho server Node.js, bao gồm:
 * - Kết nối database MongoDB
 * - Cấu hình middleware
 * - Định nghĩa routes
 * - Cấu hình gửi email
 * - Cấu hình cron job để tự động kiểm tra và thông báo task
 */

// Import các thư viện cần thiết
const express = require('express'); // Framework web cho Node.js
const app = express(); // Khởi tạo ứng dụng Express
const cors = require('cors'); // Middleware cho phép CORS
const mongoose = require('mongoose'); // ODM để làm việc với MongoDB
const authRoutes = require('./routes/authRoutes'); // Route xử lý đăng nhập/đăng ký
const toDoRoutes = require('./routes/ToDoRoutes'); // Route xử lý quản lý công việc
require('dotenv').config(); // Load biến môi trường từ file .env
const cron = require('node-cron'); // Thư viện để lập lịch các tác vụ tự động
const nodemailer = require('nodemailer'); // Thư viện gửi email
const ToDo = require('./models/ToDoList'); // Model cho công việc
const User = require('./models/User'); // Model cho người dùng

// Cổng server sẽ chạy (nếu không có trong .env thì mặc định là 5000)
const PORT = process.env.PORT || 5000;

// Sử dụng middleware cho CORS (chấp nhận yêu cầu từ các nguồn khác)
app.use(cors());

// Sử dụng middleware để parse JSON trong request body
app.use(express.json());

// Các route API
app.use('/api', authRoutes); // Route cho các chức năng xác thực người dùng (đăng ký, đăng nhập)
app.use('/api/todo', toDoRoutes); // Route cho chức năng quản lý to-do

// Kết nối tới MongoDB
mongoose.connect(process.env.DB_URL)
    .then((result) => {
        console.log("Kết nối CSDL thành công!"); // Thông báo khi kết nối thành công
    })
    .catch(err => {
        console.log("Kết nối CSDL thất bại:", err); // Thông báo khi kết nối thất bại
    });

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

// Kiểm tra kết nối email
transporter.verify(function(error, success) {
  if (error) {
    console.log('Lỗi kết nối email:', error);
  } else {
    console.log('Kết nối email thành công!');
  }
});

/**
 * Hàm gửi email thông báo task
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung email dạng text
 * @param {Object} task - Thông tin task cần thông báo
 * @returns {Promise<boolean>} - Trả về true nếu gửi thành công
 */
async function sendTaskMail(to, subject, text, task) {
  try {
    console.log('Đang gửi email đến:', to);
    console.log('Tiêu đề:', subject);
    console.log('Nội dung:', text);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">${subject}</h2>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0;">${task.title}</h3>
            <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">${task.description}</p>
            
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
              <div>
                <span style="color: #64748b; font-size: 14px;">Thời gian bắt đầu:</span>
                <div style="color: #1e293b; font-weight: 500;">${new Date(task.startTime).toLocaleString('vi-VN')}</div>
              </div>
              <div>
                <span style="color: #64748b; font-size: 14px;">Thời gian kết thúc:</span>
                <div style="color: #1e293b; font-weight: 500;">${new Date(task.endTime).toLocaleString('vi-VN')}</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #64748b; font-size: 14px;">Mức độ ưu tiên:</span>
              <span style="background: ${task.priority === 'low' ? '#34d399' : task.priority === 'medium' ? '#fbbf24' : '#f87171'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px;">
                ${task.priority === 'low' ? 'Thấp' : task.priority === 'medium' ? 'Trung bình' : 'Cao'}
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

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi thành công:', info.response);
    return true;
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw error;
  }
}

/**
 * Cron job chạy mỗi phút để kiểm tra và xử lý các task
 * Các chức năng chính:
 * 1. Gửi thông báo khi task bắt đầu
 * 2. Gửi thông báo khi task kết thúc
 * 3. Gửi thông báo khi task quá hạn
 * 4. Tự động đánh dấu task hoàn thành khi đến thời gian kết thúc
 * 5. Cập nhật trạng thái các subtask khi task chính hoàn thành
 */
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Lấy các task chưa completed, có notifyStart hoặc notifyEnd
    const tasks = await ToDo.find({
      $or: [
        { notifyStart: true },
        { notifyEnd: true }
      ],
      isCompleted: false
    });

    for (const task of tasks) {
      try {
        const user = await User.findById(task.createdBy);
        if (!user) {
          console.error(`User not found for task ${task._id}`);
          continue;
        }

        // Ưu tiên gửi về notifyEmail nếu có, nếu không thì gửi về user.email
        const emailTo = task.notifyEmail && task.notifyEmail.trim() ? task.notifyEmail.trim() : (user && user.email ? user.email : null);
        if (!emailTo) {
          console.error(`No email address found for task ${task._id}`);
          continue;
        }
        
        // Gửi mail khi đến giờ bắt đầu
        if (task.startTime && new Date(task.startTime) <= now && task.notifyStart) {
          await sendTaskMail(
            emailTo,
            `Task "${task.title}" đã bắt đầu!`,
            `Task: ${task.title}\nMô tả: ${task.description}\nBắt đầu: ${task.startTime}\nMức độ: ${task.priority}`,
            task
          );
          task.notifyStart = false;
          await task.save();
          console.log(`Sent start notification for task: ${task.title}`);
        }

        // Gửi mail khi đến giờ kết thúc
        if (task.endTime && new Date(task.endTime) <= now && task.notifyEnd) {
          await sendTaskMail(
            emailTo,
            `Task "${task.title}" đã kết thúc!`,
            `Task: ${task.title}\nMô tả: ${task.description}\nKết thúc: ${task.endTime}\nMức độ: ${task.priority}`,
            task
          );
          task.notifyEnd = false;
          task.isCompleted = true;
          task.completedOn = now.toISOString();
          await task.save();
          console.log(`Sent end notification and marked as completed for task: ${task.title}`);
        }

        // Kiểm tra task quá hạn (quá 1 giờ so với thời gian kết thúc)
        if (task.endTime && 
            new Date(task.endTime).getTime() + 3600000 <= now.getTime() && 
            !task.isCompleted) {
          await sendTaskMail(
            emailTo,
            `Task "${task.title}" đã quá hạn!`,
            `Task: ${task.title}\nMô tả: ${task.description}\nThời gian kết thúc: ${task.endTime}\nMức độ: ${task.priority}\n\nTask này đã quá hạn 1 giờ. Vui lòng kiểm tra và cập nhật trạng thái.`,
            task
          );
          console.log(`Sent overdue notification for task: ${task.title}`);
        }

        // Tự động hoàn thành task khi đến thời gian kết thúc
        if (task.endTime && new Date(task.endTime) <= now && !task.isCompleted) {
          task.isCompleted = true;
          task.completedOn = now.toISOString();
          await task.save();
          console.log(`Auto-completed task: ${task.title}`);
        }

        // Cập nhật trạng thái subtasks nếu task đã hoàn thành
        if (task.isCompleted && task.subTasks && task.subTasks.length > 0) {
          const updatedSubTasks = task.subTasks.map(subTask => ({
            ...subTask,
            isCompleted: true
          }));
          task.subTasks = updatedSubTasks;
          await task.save();
          console.log(`Updated subtasks status for task: ${task.title}`);
        }
      } catch (taskError) {
        console.error(`Error processing task ${task._id}:`, taskError);
        // Continue with next task even if current one fails
        continue;
      }
    }
  } catch (error) {
    console.error('Error in task notification cron job:', error);
  }
});

// Gửi thử email test khi khởi động server
/*
if (process.env.TEST_EMAIL) {
  sendTaskMail(
    process.env.TEST_EMAIL,
    'Test gửi mail từ hệ thống ToDo',
    'Đây là email test gửi từ hệ thống ToDo-List.',
    {
      title: 'Test Task',
      description: 'Đây là mô tả cho task test.',
      startTime: new Date(),
      endTime: new Date(),
      priority: 'low'
    }
  ).then(() => {
    console.log('Đã gửi email test thành công!');
  }).catch((err) => {
    console.error('Gửi email test thất bại:', err);
  });
}
*/

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`); // Thông báo khi server bắt đầu chạy
});

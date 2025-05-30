const ToDo = require('../models/toDo');
const transporter = require('../config/email');

const sendEmailNotification = async ({ email, subject, message, task }) => {
  try {
    const priorityColors = {
      low: '#34d399',
      medium: '#fbbf24',
      high: '#f87171'
    };

    const priorityLabels = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
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
              <span style="background: ${priorityColors[task.priority]}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px;">
                ${priorityLabels[task.priority]}
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

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmailNotification
}; 
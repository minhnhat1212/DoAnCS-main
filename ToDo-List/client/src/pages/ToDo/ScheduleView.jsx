import React from 'react';
import { Card } from 'antd';
import dayjs from 'dayjs';

function getHour(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.getHours();
}
function getDateKey(dateStr) {
  if (!dateStr) return null;
  return dayjs(dateStr).format('YYYY-MM-DD');
}
const hours = Array.from({length: 24}, (_, i) => i);

export default function ScheduleView({ tasks }) {
  // Gom task theo ngày và giờ bắt đầu
  const tasksByDate = {};
  tasks.forEach(task => {
    const dateKey = getDateKey(task.startTime);
    const hour = getHour(task.startTime);
    if (dateKey && hour !== null) {
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = {};
      if (!tasksByDate[dateKey][hour]) tasksByDate[dateKey][hour] = [];
      tasksByDate[dateKey][hour].push(task);
    }
  });
  const allDates = Object.keys(tasksByDate).sort();

  return (
    <div style={{ width: '100%', overflowX: 'auto', marginTop: 24 }}>
      {allDates.length === 0 && <div style={{ color: '#bbb', fontSize: 16, textAlign: 'center' }}>Không có task nào trong thời khóa biểu</div>}
      {allDates.map(dateKey => (
        <div key={dateKey} style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 8, color: '#1677ff' }}>{dayjs(dateKey).format('DD/MM/YYYY')}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
            <thead>
              <tr>
                <th style={{ padding: 8, border: '1px solid #eee', background: '#f5f7fa' }}>Giờ</th>
                <th style={{ padding: 8, border: '1px solid #eee', background: '#f5f7fa' }}>Task</th>
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => (
                <tr key={hour}>
                  <td style={{ padding: 8, border: '1px solid #eee', width: 80, textAlign: 'center', background: '#f9f9f9' }}>{hour}:00</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>
                    {tasksByDate[dateKey][hour] ? tasksByDate[dateKey][hour].map(task => (
                      <Card key={task._id} size="small" style={{ marginBottom: 8 }}>
                        <b>{task.title}</b><br/>
                        <span style={{ fontSize: 12 }}>{task.description}</span><br/>
                        <span style={{ fontSize: 11, color: '#888' }}>Bắt đầu: {task.startTime ? new Date(task.startTime).toLocaleTimeString() : ''}</span>
                      </Card>
                    )) : <span style={{ color: '#bbb', fontSize: 12 }}>-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
} 
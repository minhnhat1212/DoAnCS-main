import React from 'react';
import { Progress } from 'antd';
import { CheckCircleFilled, FireFilled, ThunderboltFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

const priorityColors = {
  low: '#34d399', // xanh lá
  medium: '#fbbf24', // vàng
  high: '#f87171', // đỏ
};
const priorityIcons = {
  low: <CheckCircleFilled style={{ color: priorityColors.low, fontSize: 20 }} />,
  medium: <ThunderboltFilled style={{ color: priorityColors.medium, fontSize: 20 }} />,
  high: <FireFilled style={{ color: priorityColors.high, fontSize: 20 }} />,
};

export default function TaskStatistics({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.isCompleted).length;
  const pending = total - completed;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const low = tasks.filter(t => t.priority === 'low' && !t.isCompleted).length;
  const medium = tasks.filter(t => t.priority === 'medium' && !t.isCompleted).length;
  const high = tasks.filter(t => t.priority === 'high' && !t.isCompleted).length;
  const sorted = [...tasks].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const recent = sorted[0];

  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #f0f1f2', marginRight: 32 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#7c3aed', marginBottom: 18 }}>Task Statistics</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, background: '#f3f0ff', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 15 }}>Total Tasks</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{total}</div>
        </div>
        <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <div style={{ color: '#34d399', fontWeight: 600, fontSize: 15 }}>Completed</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{completed}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, background: '#fef9c3', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: 15 }}>Pending</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{pending}</div>
        </div>
        <div style={{ flex: 1, background: '#f3e8ff', borderRadius: 14, padding: 16, textAlign: 'center' }}>
          <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 15 }}>Completion Rate</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{completionRate}%</div>
        </div>
      </div>
      <div style={{ margin: '18px 0' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Task Progress</div>
        <Progress percent={completionRate} showInfo format={() => `${completed}/${total}`} strokeColor="#a78bfa" />
      </div>
      <div style={{ margin: '18px 0' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>By Priority</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 10, padding: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {priorityIcons.low}
            <div style={{ color: priorityColors.low, fontWeight: 600 }}>Low</div>
            <div style={{ fontWeight: 700 }}>{low}</div>
          </div>
          <div style={{ flex: 1, background: '#fef9c3', borderRadius: 10, padding: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {priorityIcons.medium}
            <div style={{ color: priorityColors.medium, fontWeight: 600 }}>Medium</div>
            <div style={{ fontWeight: 700 }}>{medium}</div>
          </div>
          <div style={{ flex: 1, background: '#fef2f2', borderRadius: 10, padding: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {priorityIcons.high}
            <div style={{ color: priorityColors.high, fontWeight: 600 }}>High</div>
            <div style={{ fontWeight: 700 }}>{high}</div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 18, paddingTop: 14 }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Recent Activity</div>
        {recent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <b>{recent.title}</b> <br />
              <span style={{ fontSize: 12, color: '#888' }}>{dayjs(recent.updatedAt || recent.createdAt).format('DD/MM/YYYY')}</span>
            </div>
            <div style={{ fontWeight: 600, color: recent.isCompleted ? '#34d399' : '#fbbf24', background: recent.isCompleted ? '#f0fdf4' : '#fef9c3', borderRadius: 8, padding: '4px 14px' }}>
              {recent.isCompleted ? 'Done' : 'Pending'}
            </div>
          </div>
        ) : <span style={{ color: '#bbb' }}>No activity</span>}
      </div>
    </div>
  );
} 
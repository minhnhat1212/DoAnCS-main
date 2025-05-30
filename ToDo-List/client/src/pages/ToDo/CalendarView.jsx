import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);

// Hàm chuyển đổi task sang event cho calendar
function mapTasksToEvents(tasks) {
  return tasks.map(task => ({
    id: task._id,
    title: task.title + (task.priority ? ` [${task.priority.toUpperCase()}]` : ''),
    start: task.startTime ? new Date(task.startTime) : new Date(),
    end: task.endTime ? new Date(task.endTime) : new Date(),
    allDay: false,
    status: task.isCompleted ? 'completed' : 'incomplete',
    priority: task.priority || 'low',
    raw: task
  }));
}

export default function CalendarView({ tasks, onEventDrop, onSelectEvent }) {
  const events = useMemo(() => mapTasksToEvents(tasks), [tasks]);

  // Đổi màu theo trạng thái và mức độ ưu tiên
  function eventStyleGetter(event) {
    let bgColor = '#e0e0e0';
    if (event.status === 'completed') bgColor = '#b7eb8f';
    else if (event.priority === 'high') bgColor = '#ff7875';
    else if (event.priority === 'medium') bgColor = '#ffe58f';
    else if (event.priority === 'low') bgColor = '#91d5ff';
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '6px',
        color: '#222',
        border: 'none',
        fontWeight: 600
      }
    };
  }

  return (
    <div style={{ height: 600, background: '#fff', borderRadius: 8, marginTop: 24 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        defaultView="week"
        onEventDrop={onEventDrop}
        onSelectEvent={onSelectEvent}
        draggableAccessor={() => true}
        eventPropGetter={eventStyleGetter}
        popup
        resizable
      />
    </div>
  );
} 
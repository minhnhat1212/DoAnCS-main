import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import styles from './ToDoList.module.css';
import { Button, Divider, Empty, Input, Modal, Select, Tag, Tooltip, message } from 'antd';
import { getErrorMessage } from '../../util/GetError';
import { getUserDetails } from '../../util/GetUser';
import ToDoServices from '../../services/toDoServices';
import { useNavigate } from 'react-router';
import { CheckCircleFilled, CheckCircleOutlined, DeleteOutlined, EditOutlined, FireFilled, ThunderboltFilled, PlusOutlined } from '@ant-design/icons';
import ScheduleView from './ScheduleView';
import { DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import CalendarView from './CalendarView';
import TaskStatistics from './TaskStatistics';

dayjs.extend(utc);
dayjs.extend(timezone);

function ToDoList() {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [startTimeValue, setStartTimeValue] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTimeValue, setEndTimeValue] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allToDo, setAllToDo] = useState([]);
  const [currentEditItem, setCurrentEditItem] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [currentTaskType, setCurrentTaskType] = useState('incomplete');
  const [currentTodoTask, setCurrentToDoTask] = useState([]);
  const [filteredToDo, setFilteredToDo] = useState([]);
  const [notifyStart, setNotifyStart] = useState(true);
  const [notifyEnd, setNotifyEnd] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [updatedStartTime, setUpdatedStartTime] = useState(null);
  const [updatedEndTime, setUpdatedEndTime] = useState(null);
  const [updatedNotifyStart, setUpdatedNotifyStart] = useState(true);
  const [updatedNotifyEnd, setUpdatedNotifyEnd] = useState(true);
  const [updatedSubTasks, setUpdatedSubTasks] = useState([]);
  const [priority, setPriority] = useState('low');
  const [updatedPriority, setUpdatedPriority] = useState('low');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [audioContext] = useState(new (window.AudioContext || window.webkitAudioContext)());

  const navigate = useNavigate();

  const getAllToDo = async () => {
    try {
      const user = getUserDetails();
      const response = await ToDoServices.getAllToDo(user?.userId);
      setAllToDo(response.data);
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const user = getUserDetails();
    if (user && user?.userId) {
      getAllToDo();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const incomplete = allToDo.filter(item => !item.isCompleted);
    const complete = allToDo.filter(item => item.isCompleted);
    setCurrentToDoTask(currentTaskType === 'incomplete' ? incomplete : complete);
  }, [allToDo, currentTaskType]);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'completeTask') {
              handleCompleteTask(event.data.taskId);
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = async (title, message, type, taskId) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: message,
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [100, 50, 100],
          data: { 
            type,
            taskId,
            message
          }
        });

        // Show in-app notification
        message.info({
          content: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{message}</div>
              </div>
              {type === 'end' && (
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleCompleteTask(taskId)}
                >
                  Hoàn thành
                </Button>
              )}
            </div>
          ),
          duration: 5,
          style: { top: 80 }
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else {
      // Fallback to regular notification if service worker is not available
      new Notification(title, {
        body: message,
        icon: '/logo192.png'
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = dayjs().tz('Asia/Ho_Chi_Minh');

      allToDo.forEach(async task => {
        // Xử lý thông báo cho task chính
        if (task.startTime && dayjs(task.startTime).tz('Asia/Ho_Chi_Minh').isBefore(now) && task.notifyStart) {
          await sendNotification(
            `Task "${task.title}" đã bắt đầu!`,
            `Task "${task.title}" đã bắt đầu lúc ${dayjs(task.startTime).format('HH:mm DD/MM/YYYY')}`,
            'start',
            task._id
          );
          if (task.notifyEmail) {
            try {
              await ToDoServices.sendEmailNotification({
                email: task.notifyEmail,
                subject: `Task "${task.title}" đã bắt đầu!`,
                message: `Task "${task.title}" đã bắt đầu lúc ${dayjs(task.startTime).format('HH:mm DD/MM/YYYY')}`,
                task
              });
            } catch (err) {
              console.error('Failed to send email notification:', err);
            }
          }
          ToDoServices.updateNotify(task._id, { notifyStart: false });
        }

        if (task.endTime && dayjs(task.endTime).tz('Asia/Ho_Chi_Minh').isBefore(now) && task.notifyEnd) {
          await sendNotification(
            `Task "${task.title}" đã kết thúc!`,
            `Task "${task.title}" đã kết thúc lúc ${dayjs(task.endTime).format('HH:mm DD/MM/YYYY')}`,
            'end',
            task._id
          );
          if (task.notifyEmail) {
            try {
              await ToDoServices.sendEmailNotification({
                email: task.notifyEmail,
                subject: `Task "${task.title}" đã kết thúc!`,
                message: `Task "${task.title}" đã kết thúc lúc ${dayjs(task.endTime).format('HH:mm DD/MM/YYYY')}`,
                task
              });
            } catch (err) {
              console.error('Failed to send email notification:', err);
            }
          }
          ToDoServices.updateNotify(task._id, { notifyEnd: false });
        }

        // Xử lý thông báo cho subtasks
        if (task.subTasks && task.subTasks.length > 0) {
          const updatedSubTasks = [...task.subTasks];
          let hasChanges = false;

          for (let i = 0; i < updatedSubTasks.length; i++) {
            const subTask = updatedSubTasks[i];
            
            if (subTask.startTime && dayjs(subTask.startTime).tz('Asia/Ho_Chi_Minh').isBefore(now) && subTask.notifyStart) {
              await sendNotification(
                `Subtask "${subTask.title}" của task "${task.title}" đã bắt đầu!`,
                `Subtask "${subTask.title}" đã bắt đầu lúc ${dayjs(subTask.startTime).format('HH:mm DD/MM/YYYY')}`,
                'start',
                task._id
              );
              if (task.notifyEmail) {
                try {
                  await ToDoServices.sendEmailNotification({
                    email: task.notifyEmail,
                    subject: `Subtask "${subTask.title}" của task "${task.title}" đã bắt đầu!`,
                    message: `Subtask "${subTask.title}" đã bắt đầu lúc ${dayjs(subTask.startTime).format('HH:mm DD/MM/YYYY')}`,
                    task: { ...task, ...subTask }
                  });
                } catch (err) {
                  console.error('Failed to send email notification:', err);
                }
              }
              updatedSubTasks[i].notifyStart = false;
              hasChanges = true;
            }

            if (subTask.endTime && dayjs(subTask.endTime).tz('Asia/Ho_Chi_Minh').isBefore(now) && subTask.notifyEnd) {
              await sendNotification(
                `Subtask "${subTask.title}" của task "${task.title}" đã kết thúc!`,
                `Subtask "${subTask.title}" đã kết thúc lúc ${dayjs(subTask.endTime).format('HH:mm DD/MM/YYYY')}`,
                'end',
                task._id
              );
              if (task.notifyEmail) {
                try {
                  await ToDoServices.sendEmailNotification({
                    email: task.notifyEmail,
                    subject: `Subtask "${subTask.title}" của task "${task.title}" đã kết thúc!`,
                    message: `Subtask "${subTask.title}" đã kết thúc lúc ${dayjs(subTask.endTime).format('HH:mm DD/MM/YYYY')}`,
                    task: { ...task, ...subTask }
                  });
                } catch (err) {
                  console.error('Failed to send email notification:', err);
                }
              }
              updatedSubTasks[i].notifyEnd = false;
              hasChanges = true;
            }
          }

          if (hasChanges) {
            await ToDoServices.updateToDo(task._id, { subTasks: updatedSubTasks });
          }
        }

        // Check for overdue tasks (1 hour after end time)
        if (task.endTime && 
            dayjs(task.endTime).add(1, 'hour').tz('Asia/Ho_Chi_Minh').isBefore(now) && 
            !task.isCompleted) {
          await sendNotification(
            `Task "${task.title}" đã quá hạn!`,
            `Task "${task.title}" đã quá hạn 1 giờ so với thời gian kết thúc dự kiến`,
            'overdue',
            task._id
          );
        }

        if (task.endTime && dayjs(task.endTime).tz('Asia/Ho_Chi_Minh').isBefore(now) && !task.isCompleted) {
          ToDoServices.updateToDo(task._id, { isCompleted: true }).then(() => {
            getAllToDo();
          });
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [allToDo]);

  const handleSubmitTask = async () => {
    setLoading(true);
    try {
      const userId = getUserDetails()?.userId;
      let startDateTime = null;
      let endDateTime = null;
      if (startDate && startTimeValue) {
        startDateTime = dayjs(startDate).hour(dayjs(startTimeValue).hour()).minute(dayjs(startTimeValue).minute()).second(0).toISOString();
      }
      if (endDate && endTimeValue) {
        endDateTime = dayjs(endDate).hour(dayjs(endTimeValue).hour()).minute(dayjs(endTimeValue).minute()).second(0).toISOString();
      }
      const data = {
        title,
        description,
        isCompleted: false,
        createdBy: userId,
        startTime: startDateTime,
        endTime: endDateTime,
        subTasks,
        notifyStart,
        notifyEnd,
        priority,
        notifyEmail: notifyEmail.trim() ? notifyEmail.trim() : undefined
      };
      await ToDoServices.createToDo(data);
      message.success('Task added successfully!');
      setIsAdding(false);
      getAllToDo();
      setTitle('');
      setDescription('');
      setStartDate(null);
      setStartTimeValue(null);
      setEndDate(null);
      setEndTimeValue(null);
      setSubTasks([]);
      setNotifyStart(true);
      setNotifyEnd(true);
      setPriority('low');
      setNotifyEmail('');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = item => {
    setCurrentEditItem(item);
    setUpdatedTitle(item.title);
    setUpdatedDescription(item.description);
    setUpdatedStatus(item.isCompleted);
    setUpdatedStartTime(item.startTime ? item.startTime.slice(0, 16) : null);
    setUpdatedEndTime(item.endTime ? item.endTime.slice(0, 16) : null);
    setUpdatedNotifyStart(item.notifyStart !== undefined ? item.notifyStart : true);
    setUpdatedNotifyEnd(item.notifyEnd !== undefined ? item.notifyEnd : true);
    setUpdatedSubTasks(item.subTasks || []);
    setIsEditing(true);
  };

  const handleDelete = async item => {
    try {
      await ToDoServices.deleteToDo(item._id);
      message.success(`${item.title} deleted successfully!`);
      getAllToDo();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await ToDoServices.updateToDo(id, { isCompleted: status });
      message.success('Task status updated!');
      getAllToDo();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleSubTaskChange = (index, field, value) => {
    const updatedSubTasks = [...subTasks];
    updatedSubTasks[index][field] = value;
    setSubTasks(updatedSubTasks);
  };

  const handleSubTaskDateChange = (index, date) => {
    const updatedSubTasks = [...subTasks];
    if (!updatedSubTasks[index].startTime) {
      updatedSubTasks[index].startTime = new Date(date).toISOString();
    } else {
      const currentDate = new Date(updatedSubTasks[index].startTime);
      const newDate = new Date(date);
      currentDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      updatedSubTasks[index].startTime = currentDate.toISOString();
    }
    setSubTasks(updatedSubTasks);
  };

  const handleSubTaskTimeChange = (index, time) => {
    const updatedSubTasks = [...subTasks];
    if (!updatedSubTasks[index].startTime) {
      updatedSubTasks[index].startTime = new Date(time).toISOString();
    } else {
      const currentDate = new Date(updatedSubTasks[index].startTime);
      const newTime = new Date(time);
      currentDate.setHours(newTime.getHours(), newTime.getMinutes());
      updatedSubTasks[index].startTime = currentDate.toISOString();
    }
    setSubTasks(updatedSubTasks);
  };

  const addSubTask = () => setSubTasks([...subTasks, { 
    title: '', 
    description: '', 
    isCompleted: false, 
    startTime: null, 
    endTime: null,
    notifyStart: true,
    notifyEnd: true,
    notifyEmail: ''
  }]);

  const handleToggleSubTask = async (taskId, subTaskIndex, newStatus) => {
    try {
      const task = allToDo.find(t => t._id === taskId);
      const updatedSubTasks = [...task.subTasks];
      updatedSubTasks[subTaskIndex].isCompleted = newStatus;
      await ToDoServices.updateToDo(taskId, { subTasks: updatedSubTasks });
      message.success('Subtask status updated!');
      getAllToDo();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleUpdateSubTask = (index, field, value) => {
    const updated = [...updatedSubTasks];
    updated[index][field] = value;
    setUpdatedSubTasks(updated);
  };

  const addUpdatedSubTask = () => setUpdatedSubTasks([...updatedSubTasks, { title: '', description: '', isCompleted: false, startTime: null, endTime: null }]);

  const handleUpdateTask = async () => {
    try {
      setLoading(true);
      const data = {
        title: updatedTitle,
        description: updatedDescription,
        isCompleted: updatedStatus,
        startTime: updatedStartTime ? new Date(updatedStartTime).toISOString() : null,
        endTime: updatedEndTime ? new Date(updatedEndTime).toISOString() : null,
        notifyStart: updatedNotifyStart,
        notifyEnd: updatedNotifyEnd,
        subTasks: updatedSubTasks,
        priority: updatedPriority
      };
      await ToDoServices.updateToDo(currentEditItem._id, data);
      message.success(`${currentEditItem.title} updated!`);
      setIsEditing(false);
      getAllToDo();
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = value => setCurrentTaskType(value);

  const handleSearch = e => {
    const query = e.target.value.toLowerCase();
    const filteredList = allToDo.filter(item => item.title.toLowerCase().includes(query));
    setFilteredToDo(query ? filteredList : []);
  };

  const getFormattedDate = value => {
    const date = new Date(value);
    return `${date.toDateString()} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await ToDoServices.updateToDo(taskId, { isCompleted: true });
      message.success('Task marked as completed!');
      getAllToDo();
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      await ToDoServices.updateToDo(event.id, {
        startTime: start.toISOString(),
        endTime: end.toISOString()
      });
      getAllToDo();
      message.success('Task time updated!');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleSelectEvent = (event) => {
    handleEdit(event.raw);
  };

  const renderTaskCard = item => (
    <div key={item._id} className={styles.toDoCard}>
      <div>
        <div className={styles.toDoCardHeader}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
            {item.priority === 'low' && (
              <span className={`${styles.priorityTag} ${styles.priorityLow}`} style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircleFilled style={{ color: '#34d399', fontSize: 15 }} /> Low
              </span>
            )}
            {item.priority === 'medium' && (
              <span className={`${styles.priorityTag} ${styles.priorityMedium}`} style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ThunderboltFilled style={{ color: '#fbbf24', fontSize: 15 }} /> Medium
              </span>
            )}
            {item.priority === 'high' && (
              <span className={`${styles.priorityTag} ${styles.priorityHigh}`} style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FireFilled style={{ color: '#f87171', fontSize: 15 }} /> High
              </span>
            )}
          </div>
          <span className={`${styles.statusTag} ${item.isCompleted ? styles.completed : styles.incomplete}`}>{item.isCompleted ? 'Completed' : 'Incomplete'}</span>
        </div>
        <p>{item.description}</p>

        <div style={{ marginBottom: '0.5rem', fontSize: '12px', color: '#666' }}>
          {item.startTime && <div>Bắt đầu: {getFormattedDate(item.startTime)}</div>}
          {item.endTime && <div>Kết thúc: {getFormattedDate(item.endTime)}</div>}
        </div>

        {item.subTasks && item.subTasks.length > 0 && (
          <div className={styles.subTaskList}>
            {item.subTasks.map((subTask, index) => (
              <div key={index} className={styles.subTaskItem}>
                <div>
                  <p className={subTask.isCompleted ? styles.completedSubTask : ''}>{subTask.title}</p>
                  {subTask.startTime && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Bắt đầu: {new Date(subTask.startTime).toLocaleString('vi-VN')}
                    </div>
                  )}
                  {subTask.endTime && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Kết thúc: {new Date(subTask.endTime).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
                <div className={styles.subTaskActions}>
                  <CheckCircleOutlined
                    onClick={() => handleToggleSubTask(item._id, index, !subTask.isCompleted)}
                    style={{ color: subTask.isCompleted ? 'green' : 'gray' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.toDoCardFooter}>
        <div className={styles.toDoFooterAction}>
          <Tooltip title="Edit">
            <EditOutlined className={styles.actionIcon} onClick={() => handleEdit(item)} />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined className={styles.actionIcon} onClick={() => handleDelete(item)} />
          </Tooltip>
          {!item.isCompleted && (
            <Tooltip title="Hoàn thành task">
              <CheckCircleFilled className={styles.actionIcon} style={{ color: 'green' }} onClick={() => handleCompleteTask(item._id)} />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );

  const taskList = filteredToDo.length ? filteredToDo : currentTodoTask;

  return (
    <>
      <div className={styles.toDoBackground}>
        <div className={`${styles.circleBg} ${styles.circle1}`}></div>
        <div className={`${styles.circleBg} ${styles.circle2}`}></div>
        <div className={`${styles.circleBg} ${styles.circle3}`}></div>
        <div className={`${styles.circleBg} ${styles.circle4}`}></div>
      </div>
      <div className={styles.toDoLayout}>
        <aside className={styles.toDoSidebar}>
          <TaskStatistics tasks={allToDo} />
        </aside>
        <main className={styles.toDoMain}>
          <Navbar active="myTask" />
          <div className={styles.toDoHeader}>
            <h1>My Tasks</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button type={viewMode==='list' ? 'primary' : 'default'} onClick={()=>setViewMode('list')}>Danh sách</Button>
              <Button type={viewMode==='schedule' ? 'primary' : 'default'} onClick={()=>setViewMode('schedule')}>Thời khóa biểu</Button>
              <Button type={viewMode==='calendar' ? 'primary' : 'default'} onClick={()=>setViewMode('calendar')}>Lịch</Button>
              <Input.Search
                placeholder="Search tasks..."
                onChange={handleSearch}
                style={{ width: 200, marginRight: 16 }}
              />
              <Select
                defaultValue="incomplete"
                style={{ width: 120 }}
                onChange={handleTypeChange}
                options={[
                  { value: 'incomplete', label: 'Incomplete' },
                  { value: 'complete', label: 'Complete' },
                ]}
              />
              <Button type="primary" style={{ marginLeft: 16, fontWeight: 'bold' }} onClick={() => setIsAdding(true)}>
                + Thêm Task
              </Button>
            </div>
          </div>
          <div className={styles.filterBar}>
            <Button type={viewMode==='list' ? 'primary' : 'default'} onClick={()=>setViewMode('list')}>Danh sách</Button>
            <Button type={viewMode==='schedule' ? 'primary' : 'default'} onClick={()=>setViewMode('schedule')}>Thời khóa biểu</Button>
            <Button type={viewMode==='calendar' ? 'primary' : 'default'} onClick={()=>setViewMode('calendar')}>Lịch</Button>
            <Input.Search
              placeholder="Search tasks..."
              onChange={handleSearch}
              style={{ width: 200 }}
            />
            <Select
              defaultValue="incomplete"
              style={{ width: 120 }}
              onChange={handleTypeChange}
              options={[
                { value: 'incomplete', label: 'Incomplete' },
                { value: 'complete', label: 'Complete' },
              ]}
            />
          </div>
          {viewMode === 'list' ? (
            <div className={styles.toDoListCardWrapper}>
              {taskList.length > 0 ? taskList.map(renderTaskCard) : <div className={styles.noTaskWrapper}><Empty /></div>}
            </div>
          ) : viewMode === 'schedule' ? (
            <ScheduleView tasks={taskList} />
          ) : (
            <CalendarView tasks={taskList} onEventDrop={handleEventDrop} onSelectEvent={handleSelectEvent} />
          )}
          <div className={styles.fabAddTask} onClick={() => setIsAdding(true)}>
            <PlusOutlined />
          </div>
          <Modal
            title="Add New Task"
            open={isAdding}
            onOk={handleSubmitTask}
            onCancel={() => setIsAdding(false)}
            confirmLoading={loading}
          >
            <Input
              placeholder="Task Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.TextArea
              placeholder="Task Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input
              placeholder="Email nhận thông báo (tùy chọn)"
              value={notifyEmail}
              onChange={e => setNotifyEmail(e.target.value)}
              style={{ marginBottom: 16 }}
              type="email"
            />
            <Select
              value={priority}
              onChange={setPriority}
              style={{ width: 180, marginBottom: 16 }}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              placeholder="Mức độ ưu tiên"
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <DatePicker value={startDate} onChange={setStartDate} placeholder="Ngày bắt đầu" style={{ width: 140 }} />
              <TimePicker value={startTimeValue} onChange={setStartTimeValue} placeholder="Giờ bắt đầu" format="HH:mm" style={{ width: 120 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <DatePicker value={endDate} onChange={setEndDate} placeholder="Ngày kết thúc" style={{ width: 140 }} />
              <TimePicker value={endTimeValue} onChange={setEndTimeValue} placeholder="Giờ kết thúc" format="HH:mm" style={{ width: 120 }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <label><input type="checkbox" checked={notifyStart} onChange={e => setNotifyStart(e.target.checked)} /> Bật thông báo khi bắt đầu</label>
              <label><input type="checkbox" checked={notifyEnd} onChange={e => setNotifyEnd(e.target.checked)} /> Bật thông báo khi kết thúc</label>
            </div>
            {subTasks.map((subTask, index) => (
              <div key={index} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
                <Input
                  placeholder="Subtask Title"
                  value={subTask.title}
                  onChange={e => handleSubTaskChange(index, 'title', e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <Input.TextArea
                  placeholder="Subtask Description"
                  value={subTask.description}
                  onChange={e => handleSubTaskChange(index, 'description', e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <DatePicker 
                    value={subTask.startTime ? dayjs(subTask.startTime) : null} 
                    onChange={date => handleSubTaskDateChange(index, date)} 
                    placeholder="Ngày bắt đầu" 
                    style={{ width: 140 }} 
                  />
                  <TimePicker 
                    value={subTask.startTime ? dayjs(subTask.startTime) : null} 
                    onChange={time => handleSubTaskTimeChange(index, time)} 
                    placeholder="Giờ bắt đầu" 
                    format="HH:mm" 
                    style={{ width: 120 }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <DatePicker 
                    value={subTask.endTime ? dayjs(subTask.endTime) : null} 
                    onChange={date => {
                      const updatedSubTasks = [...subTasks];
                      if (!updatedSubTasks[index].endTime) {
                        updatedSubTasks[index].endTime = new Date(date).toISOString();
                      } else {
                        const currentDate = new Date(updatedSubTasks[index].endTime);
                        const newDate = new Date(date);
                        currentDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                        updatedSubTasks[index].endTime = currentDate.toISOString();
                      }
                      setSubTasks(updatedSubTasks);
                    }} 
                    placeholder="Ngày kết thúc" 
                    style={{ width: 140 }} 
                  />
                  <TimePicker 
                    value={subTask.endTime ? dayjs(subTask.endTime) : null} 
                    onChange={time => {
                      const updatedSubTasks = [...subTasks];
                      if (!updatedSubTasks[index].endTime) {
                        updatedSubTasks[index].endTime = new Date(time).toISOString();
                      } else {
                        const currentDate = new Date(updatedSubTasks[index].endTime);
                        const newTime = new Date(time);
                        currentDate.setHours(newTime.getHours(), newTime.getMinutes());
                        updatedSubTasks[index].endTime = currentDate.toISOString();
                      }
                      setSubTasks(updatedSubTasks);
                    }} 
                    placeholder="Giờ kết thúc" 
                    format="HH:mm" 
                    style={{ width: 120 }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={subTask.notifyStart} 
                      onChange={e => handleSubTaskChange(index, 'notifyStart', e.target.checked)} 
                    /> Bật thông báo khi bắt đầu
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={subTask.notifyEnd} 
                      onChange={e => handleSubTaskChange(index, 'notifyEnd', e.target.checked)} 
                    /> Bật thông báo khi kết thúc
                  </label>
                </div>
              </div>
            ))}
            <Button onClick={addSubTask} style={{ marginBottom: 8 }}>Add Subtask</Button>
          </Modal>
          <Modal
            title="Edit Task"
            open={isEditing}
            onOk={handleUpdateTask}
            onCancel={() => setIsEditing(false)}
            confirmLoading={loading}
          >
            <Input
              placeholder="Task Title"
              value={updatedTitle}
              onChange={e => setUpdatedTitle(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.TextArea
              placeholder="Task Description"
              value={updatedDescription}
              onChange={e => setUpdatedDescription(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Select
              value={updatedPriority}
              onChange={setUpdatedPriority}
              style={{ width: 180, marginTop: 16 }}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              placeholder="Mức độ ưu tiên"
            />
            <Input
              type="datetime-local"
              value={updatedStartTime}
              onChange={e => setUpdatedStartTime(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input
              type="datetime-local"
              value={updatedEndTime}
              onChange={e => setUpdatedEndTime(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <label><input type="checkbox" checked={updatedNotifyStart} onChange={e => setUpdatedNotifyStart(e.target.checked)} /> Bật thông báo khi bắt đầu</label>
              <label><input type="checkbox" checked={updatedNotifyEnd} onChange={e => setUpdatedNotifyEnd(e.target.checked)} /> Bật thông báo khi kết thúc</label>
            </div>
            {updatedSubTasks.map((subTask, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Subtask Title"
                  value={subTask.title}
                  onChange={e => handleUpdateSubTask(index, 'title', e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <Input.TextArea
                  placeholder="Subtask Description"
                  value={subTask.description}
                  onChange={e => handleUpdateSubTask(index, 'description', e.target.value)}
                />
              </div>
            ))}
            <Button onClick={addUpdatedSubTask}>Add Subtask</Button>
            <Select
              value={updatedStatus}
              onChange={value => setUpdatedStatus(value)}
              style={{ width: '100%', marginTop: 16 }}
              options={[
                { value: true, label: 'Completed' },
                { value: false, label: 'Incomplete' },
              ]}
            />
          </Modal>
        </main>
      </div>
    </>
  );
}

export default ToDoList;

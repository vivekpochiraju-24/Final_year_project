import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { initSocket, joinRooms, getSocket } from '../services/socket';

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;
    api.get('/notifications').then((res) => setNotifications(res.data));
    api.get('/appointments').then((res) => setAppointments(res.data));

    const socket = initSocket();
    joinRooms({ userId: user.id, doctorId: user.role === 'doctor' ? user.id : null });

    socket.on('notification', (n) => {
      setNotifications((s) => [n, ...s]);
    });
    socket.on('appointment_booked', (a) => {
      setAppointments((s) => [a, ...s]);
    });

    return () => {
      socket.off('notification');
      socket.off('appointment_booked');
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>Notifications</h3>
          <ul>
            {notifications.map((n) => (
              <li key={n._id}>{n.message}</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 2 }}>
          <h3>Appointments</h3>
          <ul>
            {appointments.map((a) => (
              <li key={a._id}>{a.date} {a.start} - {a.status}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

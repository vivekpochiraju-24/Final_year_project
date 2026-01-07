import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Booking() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('2026-01-10');
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    api.get('/doctors').then((res) => setDoctors(res.data));
  }, []);

  async function fetchSlots() {
    if (!doctorId || !date) return alert('pick doctor and date');
    const { data } = await api.get('/appointments/slots', { params: { doctorId, date } });
    setSlots(data.slots);
  }

  async function book(slot) {
    try {
      await api.post('/appointments', { doctorId, date, start: slot.start, end: slot.end });
      alert('Booked');
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Book Appointment</h2>
      <div>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option value={d._id} key={d._id}>{d.user.name} - {d.specialization}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={fetchSlots}>View slots</button>
      </div>
      <ul>
        {slots.map((s, i) => (
          <li key={i}>{s.start} - {s.end} <button onClick={() => book(s)}>Book</button></li>
        ))}
      </ul>
    </div>
  );
}

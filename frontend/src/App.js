import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import VideoCall from './pages/VideoCall';

export default function App() {
  return (
    <div>
      <nav style={{ padding: 10 }}>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link> | <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/video" element={<VideoCall />} />
        <Route path="/" element={<div style={{ padding: 20 }}>Welcome to Appointment App</div>} />
      </Routes>
    </div>
  );
}

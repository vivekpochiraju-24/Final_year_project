const Notification = require('../models/Notification');

async function getNotifications(req, res) {
  const userId = req.user._id;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  res.json(notifications);
}

async function markAsRead(req, res) {
  const { id } = req.params;
  const notif = await Notification.findById(id);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  if (notif.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
  notif.read = true;
  await notif.save();
  res.json(notif);
}

async function createNotification(req, res) {
  // admin or system endpoint to push notifications
  const { user, type, message } = req.body;
  if (!user || !message) return res.status(400).json({ message: 'Missing fields' });
  const notif = await Notification.create({ user, type, message });
  // emit via socket if available
  const io = req.app.get('io');
  if (io) io.to(`user_${user}`).emit('notification', notif);
  res.status(201).json(notif);
}

module.exports = { getNotifications, markAsRead, createNotification };

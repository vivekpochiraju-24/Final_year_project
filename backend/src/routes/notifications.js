const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const { getNotifications, markAsRead, createNotification } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.post('/', auth, authorizeRoles('admin'), createNotification);

module.exports = router;

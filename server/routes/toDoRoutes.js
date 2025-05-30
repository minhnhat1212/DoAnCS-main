const express = require('express');
const router = express.Router();
const toDoController = require('../controllers/toDoController');

// ... existing routes ...

router.post('/send-email', toDoController.sendEmailNotification);

// ... existing code ...

module.exports = router; 
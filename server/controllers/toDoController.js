const toDoServices = require('../services/toDoServices');

// ... existing code ...

const sendEmailNotification = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    await toDoServices.sendEmailNotification({ email, subject, message });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... existing code ...

module.exports = {
  // ... existing exports ...
  sendEmailNotification
}; 
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../controllers/middlewareController');

// Get all users (admin only)
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers);

// Delete user (admin only)
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);

// Toggle admin status (admin only)
router.put('/:id/toggle-admin', verifyToken, verifyAdmin, userController.toggleAdminStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../controllers/middlewareController');

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Lấy danh sách user (admin)
 *     responses:
 *       200:
 *         description: Danh sách user
 *
 * /api/user/{id}:
 *   delete:
 *     summary: Xóa user (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Xóa thành công
 *
 * /api/user/{id}/toggle-admin:
 *   put:
 *     summary: Chuyển đổi quyền admin (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Chuyển đổi thành công
 */

// Get all users (admin only)
router.get('/', verifyToken, verifyAdmin, userController.getAllUsers);

// Delete user (admin only)
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);

// Toggle admin status (admin only)
router.put('/:id/toggle-admin', verifyToken, verifyAdmin, userController.toggleAdminStatus);

module.exports = router;
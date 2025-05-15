const authController = require('../controllers/authController');
const middlewareController = require('../controllers/middlewareController');

const router = require('express').Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *
 * /api/auth/refresh:
 *   post:
 *     summary: Làm mới token
 *     responses:
 *       200:
 *         description: Token mới
 *
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin user đang đăng nhập
 *     responses:
 *       200:
 *         description: Thông tin user
 */

//REGISTER
router.post('/register', authController.registerUser);

//LOGIN
router.post('/login', authController.loginUser);

//REFRESH TOKEN
router.post('/refresh',authController.requestRefreshToken);

//LOG OUT
router.post('/logout', middlewareController.verifyToken, authController.userLogout);

//GET LOGGED IN USER
router.get('/me', middlewareController.verifyToken, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
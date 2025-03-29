const authController = require('../controllers/authController');
const middlewareController = require('../controllers/middlewareController');

const router = require('express').Router();

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
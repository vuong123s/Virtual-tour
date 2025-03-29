const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let refreshTokens = [];

const authController = {
    //REGISTER
    registerUser: async(req, res) => {
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //Create new user
            const newUser = await new User({
                username: req.body.username,
                email:req.body.email,
                password: hashed,
            });

            //Save to database
            const user = await newUser.save();
            res.status(200).json(user);

        }catch(err){
            res.status(500).json(err);
        }
    },

    //GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin,
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '2h' }
        );   
    },
    //GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
            id: user.id,
            admin: user.admin,
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '365d' }
        );
    },

    //Login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json({ message: "Email not found!" });
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: "Incorrect password!" });
            }
            if (user && validPassword) {
                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: 'strict'
                });
                const { password, ...others } = user._doc;
                res.status(200).json({ ...others, accessToken });
            }
        } catch (err) {
            res.status(500).json({ message: "Login failed!", error: err.message });
        }
    },
    requestRefreshToken: async(req, res) => {
        // Take refresh token from user
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(401).json("You're not authenticated");
        if(!refreshTokens.includes(refreshToken)) return res.status(401).json("Invalid refresh token");
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if(err){
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            //Create new accsesstoken, refresh token
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true, 
                secure: false, 
                path:"/",
                sameSite: 'strict'  
            });
            res.status(200).json({accessToken: newAccessToken});
        });
    },
    //LOG OUT
    userLogout: async(req, res) => {
        try {
            res.clearCookie('refreshToken');
            refreshTokens = refreshTokens.filter(
                (token) => token !== req.cookies.refreshToken
            );
            res.status(200).json('Logged out!');
        } catch (err) {
            res.status(500).json('Logout failed!');
        }
    }
}

//STORE TOKEN
//1) LOCAL STORAGE : XSS dễ bị tấn công
//2) COOKIES : Cookies lưu trữ trên máy chủ, không lưu trữ trên trình duyệt, không bị XSS dễ bị tấn công
// có thể bị đánh cắp qua CSRF -> được khắc  phục SAMESITE
//3) REDUX STORE -> xài ACCESSTOKEN
// HTTPONLY COOKIES: -> xài REFRESHTOKEN

// BFF PATTERN (BACKEND FOR FONTEND)

module.exports = authController;
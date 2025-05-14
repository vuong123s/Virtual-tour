const jwt = require('jsonwebtoken');
const User = require('../models/User');

const middlewareController = {
    //verifyToken
    verifyToken: (req, res, next) => {
        const authHeader = req.headers.authorization; // Use 'authorization' header
        if (authHeader) {
            const accessToken = authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Token is not valid" });
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json({ message: "No token provided. You're not authenticated" });
        }
    },

    verifyTokenAndAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if(req.user.id == req.params.id || req.user.admin) {
                next();
            }
            else {
                res.status(403).json("You're not an admin");
            }
        });
    },

    verifyAdmin: async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json('User not found');
            }
            if (!user.admin) {
                return res.status(403).json('You are not authorized to perform this action!');
            }
            next();
        } catch (err) {
            return res.status(500).json('Error verifying admin status');
        }
    }
}

module.exports = middlewareController;
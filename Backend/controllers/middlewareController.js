const jwt = require('jsonwebtoken');

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
    }
}

module.exports = middlewareController;
const User = require('../models/User');

const userController = {
    //GET ALL USERS
    getAllUsers: async(req, res) => {
        try{
            const users = await User.find({});
            res.status(200).json(users);
        }catch(err){
            res.status(500).json(err);
        }
    },

    //DELETE USER
    deleteUser: async(req, res) => {
        try{
            const user = await User.findByIdAndDelete(req.params.id);
            if(!user){
                res.status(404).json({message: "User not found!"});
            }
            else
                res.status(200).json("Delete user successfully!");
        }catch(err){
            res.status(500).json(err);
        }
    }
}

module.exports = userController;
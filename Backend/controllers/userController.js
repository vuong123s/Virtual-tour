const User = require('../models/User');

const userController = {
    //GET ALL USERS
    getAllUsers: async(req, res) => {
        try{
            const users = await User.find().select('-password');
            res.status(200).json(users);
        }catch(err){
            res.status(500).json(err);
        }
    },

    //DELETE USER
    deleteUser: async(req, res) => {
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(404).json('User not found');
            }
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json('User has been deleted');
        }catch(err){
            res.status(500).json(err);
        }
    },

    // Toggle admin status
    toggleAdminStatus: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Prevent self-demotion
            if (user._id.toString() === req.user.id) {
                return res.status(403).json({ message: 'You cannot modify your own admin status' });
            }

            // Get the new status from request body
            const { status } = req.body;
            if (typeof status !== 'boolean') {
                return res.status(400).json({ message: 'Invalid status value' });
            }

            // Update admin status
            user.admin = status;
            await user.save();

            // Return updated user without password
            const updatedUser = await User.findById(user._id).select('-password');
            res.status(200).json({
                message: `User ${status ? 'promoted to' : 'demoted from'} admin successfully`,
                user: updatedUser
            });
        } catch (err) {
            console.error('Error updating user status:', err);
            res.status(500).json({ message: 'Error updating user status', error: err.message });
        }
    }
}

module.exports = userController;
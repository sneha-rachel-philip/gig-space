// controllers/admin.controller.js

import User from '../models/user.model.js';

// GET /api/admin/users - Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from response
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/admin/users/:id - Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

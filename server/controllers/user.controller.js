import User from '../models/user.model.js';
import upload from '../middlewares/uploadImage.js';
import bcrypt from 'bcryptjs';

// POST /upload - Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Upload profile pic error:', err);
    res.status(500).json({ error: 'Server error uploading image' });
  }
};

// PUT /change-password - Change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log('Request body:', req.body);
  console.log('User in req:', req.user);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide both passwords' });
  }

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



// GET /me - Get logged-in user's data
export const getCurrentUser = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

// GET /:id - Public user profile
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

// PUT /me - Update profile
export const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select('-password');
    res.json(updated);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

// GET /role/:role - Get users by role (e.g., all freelancers)
export const getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');
    res.json(users);
  } catch (err) {
  console.error('Error in getCurrentUser:', err);
  res.status(500).json({ error: 'Server error' });
}

};

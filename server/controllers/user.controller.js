import User from '../models/user.model.js';

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

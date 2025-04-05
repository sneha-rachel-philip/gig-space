import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

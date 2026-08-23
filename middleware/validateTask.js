module.exports = (req, res, next) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  next();
};

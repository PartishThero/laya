// Middleware to validate presence of required fields in req.body
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => {
      const val = req.body[field];
      return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
    });

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missing.join(', ')}`
      });
    }
    next();
  };
};

export default { validateBody };

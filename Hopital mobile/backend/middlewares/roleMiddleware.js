const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès interdit. Rôle requis : ${roles.join(' ou ')}. Votre rôle : ${req.user.role}`
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
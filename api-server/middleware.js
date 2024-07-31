const jwt = require("jsonwebtoken");
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('maybe expired token')
      return res.sendStatus(403);
    }
    req.userId = user.userId;
    next();
  });
};
module.exports = { authenticateToken };

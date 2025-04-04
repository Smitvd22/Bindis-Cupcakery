const jwt = require('jsonwebtoken');
require("dotenv").config();

module.exports = async (req, res, next) => {
    try {
        const token = req.header('token');
        
        if (!token) {
            return res.status(403).json({ error: "Not Authorized" });
        }
        
        const payload = jwt.verify(token, process.env.jwtSecret);
        req.user = payload.user;
      
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(403).json({ error: "Not Authorized" });
    }
};
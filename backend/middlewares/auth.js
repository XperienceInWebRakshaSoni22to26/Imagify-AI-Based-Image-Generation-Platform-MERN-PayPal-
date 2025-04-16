const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null; // Extract token

    if (!token) {
        return res.status(403).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

        req.userId = decoded.id; // Attach userId to the request object
        next(); // Move to the next middleware or route handler
    } catch (error) {
        // Specific handling for expired tokens
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ success: false, message: "Token has expired" });
        }

        // General invalid token error
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};

module.exports = userAuth;
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.log("Clear cookie");
        res.clearCookie("role");
        res.clearCookie("token");
        return res.status(401).json({ message: "Authentication Required" })
    }
    else {
        try {
            const user = jwt.verify(token, process.env.PRIVATE_KEY);
            req.user = user;
            next();
        } catch (err) {
            res.clearCookie("role");
            res.clearCookie("token");
            return res.status(401).json({ message: "Token Expired" })
        }
    }
};
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.authCheck = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = headerToken.split(" ")[1];

    // ตรวจสอบความถูกต้องของ Token
    const decode = jwt.verify(token, process.env.SECRET);
    req.user = decode;

    const user = await prisma.user.findFirst({
      where: { email: req.user.email },
    });

    if (!user || !user.enabled) {
      return res.status(403).json({ message: "Access denied: Unauthorized" });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Auth Check Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.adminCheck = async (req, res, next) => {
  try {
    const { email } = req.user;

    const adminUser = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    next();
  } catch (error) {
    console.error("Admin Check Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

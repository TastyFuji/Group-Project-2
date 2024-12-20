const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ฟังก์ชัน register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required!" });
    }

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });

    res.status(201).json({
      message: "Register completed!",
      user: newUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check email

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user || !user.enabled) {
      return res
        .status(400)
        .json({ message: "User not found or not enabled!" });
    }
    //Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password invalid!" });
    }
    //create payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    //generate token
    jwt.sign(
      payload,
      process.env.SECRET,
      {
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: "Server Erorr" });
        }
        res.json({ payload, token });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.currentUser = async (req, res) => {
  try {
    res.send("Hello CurrentUser In Controller");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.currentAdmin = async (req, res) => {
  try {
    res.send("Hello CurrentAdmin In Controller");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

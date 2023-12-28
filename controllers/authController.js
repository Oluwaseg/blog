const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const validator = require("validator");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");

require("dotenv").config();
const secretKey = process.env.JWT_SECRET;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profileImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
});

// Function to create a JWT token for a user
const createToken = (user) => {
  const tokenData = {
    userId: user._id,
    email: user.email,
    name: user.name,
    username: user.username,
    profileImage: user.profileImage,
  };

  const token = jwt.sign(tokenData, secretKey, { expiresIn: "1d" });

  return token;
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next();
  }

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return next();
    }
    req.user = decodedToken;
    next();
  });
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.redirect("/auth/login");
    }

    const decoded = jwt.verify(token, secretKey);

    const user = await userModel.findById(decoded.userId);

    if (!user || !user.tokens.includes(token)) {
      return res.redirect("/auth/login");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware - JWT verification failed:", error);
    return res.redirect("/auth/login");
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (existingUser) {
      req.flash(
        "error",
        "User with the given email or username already exists"
      );
    }

    if (!name || !email || !password || !username) {
      req.flash("error", "All fields are required..!");
    }

    if (!validator.isEmail(email)) {
      req.flash("error", "Please input a valid email.");
    }

    if (password.length < 6 || !validator.isStrongPassword(password)) {
      req.flash(
        "error",
        "Password must be strong, containing at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      // Handle the error or redirect accordingly
    }

    let imageUrl = "/uploads/profileImages/default.jpg";

    const profileImage = req.file;

    if (profileImage && profileImage.filename) {
      imageUrl = `/uploads/profileImages/${profileImage.filename}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      username,
      name,
      email,
      password: hashedPassword,
      profileImage: imageUrl,
    });

    const token = createToken(user);

    user.tokens.push(token);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    await user.save();

    req.flash(
      "success",
      "Registration complete! Redirecting to home page in a few seconds."
    );

    setTimeout(() => {
      res.redirect("/auth/home");
    }, 3000);
  } catch (error) {
    console.error("Registration failed:", error);

    req.flash("error", "Registration failed. Please try again.");

    res.redirect("/auth/register");
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/auth/login");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      req.flash("error", "Please check your email and password.");
      return res.redirect("/auth/login");
    }

    const token = createToken(user);

    user.tokens.push(token);

    await user.save();

    req.user = user;

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.redirect("/auth/home");
  } catch (error) {
    console.error("An error occurred:", error);
    return next(error);
  }
};
const logoutUser = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "Logout failed. User not authenticated.");
      return res.redirect("/auth/login");
    }

    if (req.user.tokens) {
      req.user.tokens = req.user.tokens.filter(
        (token) => token !== req.cookies.jwt
      );

      await req.user.save();
    }

    res.clearCookie("jwt");

    req.flash("success", "Logout successful!");
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Logout failed:", error);
    req.flash("error", "Logout failed. Please try again.");
    res.redirect("/auth/home");
  }
};

const checkTokenBlacklist = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token && req.user?.tokens?.includes(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

module.exports = {
  registerUser,
  loginUser,
  upload,
  verifyToken,
  logoutUser,
  authMiddleware,
  checkTokenBlacklist,
};

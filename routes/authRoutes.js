const authController = require("../controllers/authController");
const express = require("express");
const router = express.Router();

// Apply global token verification middleware
router.use(authController.verifyToken);

// Apply middleware for specific routes
router.use("/home", authController.authMiddleware);
router.use(authController.checkTokenBlacklist);

// Define login and registration routes
router.post("/login", authController.loginUser);
router.post(
  "/register",
  authController.upload.single("profileImage"),
  authController.registerUser
);

// Define home route
router.get("/home", (req, res) => {
  res.render("home/home.ejs", {
    username: req.user.username,
    name: req.user.name,
    profileImage: req.user.profileImage,
  });
});

// Define registration and login routes
router.get("/register", (req, res) => {
  if (req.user) {
    return res.redirect("/auth/home");
  }
  res.render("auth/register.ejs");
});

router.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/auth/home");
  }
  res.render("auth/login.ejs");
});

// Define logout route
router.get("/logout", authController.logoutUser);

module.exports = router;
